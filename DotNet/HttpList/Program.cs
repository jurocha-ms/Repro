///
// See https://learn.microsoft.com/en-us/dotnet/api/system.net.httplistener
///

using System.Net;

// URI prefixes are required,
// for example "http://contoso.com:8080/index/".
var prefixes = new string[] { "http://localhost:5000/" };

// Create a listener.
//var listener = new HttpListener();
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
		var responseString = "<HTML><BODY> Hello world!</BODY></HTML>";
		byte[] buffer = System.Text.Encoding.UTF8.GetBytes(responseString);
		// Get a response stream and write the response to it.
		response.ContentLength64 = buffer.Length;

		using (var output = response.OutputStream)
		{
			output.Write(buffer, 0, buffer.Length);
		}
	}
}
