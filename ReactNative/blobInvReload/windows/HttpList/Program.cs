///
// See https://learn.microsoft.com/en-us/dotnet/api/system.net.httplistener
///

using System.Net;

// URI prefixes are required,
var prefixes = new string[] { "http://localhost:5000/" };
var alphabet = System.Text.Encoding.ASCII.GetBytes("0123456789ABCDEF");

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
		var response = context.Response;
		var request = context.Request;
		Console.WriteLine(request.Url?.AbsolutePath);
		int contentLength;
		var resource = "";
		if (request.Url is not null)
			resource = request.Url.AbsolutePath.Replace("/", "");

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
}
