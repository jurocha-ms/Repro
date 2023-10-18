///
// See https://learn.microsoft.com/en-us/dotnet/api/system.net.httplistener
///

using System.Net;

// URI prefixes are required,
// for example "http://contoso.com:8080/index/".
var prefixes = new string[] { "http://localhost:5000/" };
var alphabet = "0123456789ABCDEF".ToCharArray();
var contentLenght = 1024 * 1024;

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
		//var responseString = "<HTML><BODY> Hello world!</BODY></HTML>";
		//byte[] buffer = System.Text.Encoding.UTF8.GetBytes(responseString);
		var buffer = new byte[contentLenght];
		for (var i = 0; i < buffer.Length; i++)
			buffer[i] = (byte)alphabet[i % alphabet.Length];

		// Get a response stream and write the response to it.
		response.ContentLength64 = buffer.Length;

		using (var output = response.OutputStream)
		{
			output.Write(buffer, 0, buffer.Length);
		}
	}
}
