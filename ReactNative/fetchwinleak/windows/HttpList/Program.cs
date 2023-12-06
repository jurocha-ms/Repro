///
// See https://learn.microsoft.com/en-us/dotnet/api/system.net.httplistener
///

using System.Net;
using System.Text;

// URI prefixes are required,
var prefixes = new string[] { "http://localhost:5000/" };

void RespondNotFound(HttpListenerContext context)
{
	context.Response.StatusCode = (int)HttpStatusCode.NotFound;

	using (var output = context.Response.OutputStream)
	{
		output.Write(new byte[]{});
	}
}

void RespondArbitraryBytes(HttpListenerContext context, string path)
{
	var alphabet = System.Text.Encoding.ASCII.GetBytes("0123456789ABCDEF");
	var response = context.Response;
	int contentLength;
	var resource = path.Substring(path.LastIndexOf('/') + 1); // /rn/leak/\d+

	try
	{
		if (!string.IsNullOrEmpty(resource))
			contentLength = int.Parse(resource);
		else
			contentLength = alphabet.Length;
	}
	catch (Exception ex)
	{
		Console.WriteLine(ex);
		response.StatusCode = (int)HttpStatusCode.NotFound;
		contentLength = alphabet.Length;
	}

	var buffer = new byte[contentLength];
	for (var i = 0; i < buffer.Length; i++)
		buffer[i] = alphabet[i % alphabet.Length];

	// Get a response stream and write the response to it.
	response.ContentLength64 = buffer.Length;

	using (var output = response.OutputStream)
	{
		output.Write(buffer, 0, buffer.Length);
	}
}

void RespondToFormUpload(HttpListenerContext context)
{
	var reqBody = "";
	using (var input = context.Request.InputStream)
	{
		var buffer = new byte[1024 * 1024];
		int read = 0;
		while (input.CanRead && (read = input.Read(buffer, 0, buffer.Length)) > 0)
		{
			reqBody += Encoding.UTF8.GetString(buffer, 0, read);
		}
	}
	Console.WriteLine(reqBody);

	context.Response.StatusCode = (int)HttpStatusCode.OK;
	using (var output = context.Response.OutputStream)
	{
		output.Write(null);
	}
}

// Create a listener.
using (var listener = new HttpListener())
{
	// Add the prefixes.
	foreach (string s in prefixes)
	{
		listener.Prefixes.Add(s);
	}
	listener.Start();
	Console.WriteLine("Listening...");

	while (true)
	{
		// Note: The GetContext method blocks while waiting for a request.
		var context = listener.GetContext();

		// Construct a response.
		var url = context.Request.Url;
		Console.WriteLine(url!.AbsolutePath);

		// Parse resource (path)
		var normalizedPath = "";
		foreach (var segment in url!.Segments)
		{
			if ("/" == segment)
			{
				continue;
			}

			normalizedPath += $"/{segment.TrimEnd('/')}";
		}

		// Route request
		if (normalizedPath.StartsWith("/rn/leak/"))
		{
			RespondArbitraryBytes(context, normalizedPath);
		}
		else if (normalizedPath.StartsWith("/rn/formup"))
		{
			RespondToFormUpload(context);
		}
		else
		{
			RespondNotFound(context);
		}
	}
}
