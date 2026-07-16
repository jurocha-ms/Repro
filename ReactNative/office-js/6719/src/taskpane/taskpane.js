// taskpane.js -- runs the identical probes from the WebView runtime so we can
// compare WebView vs JS-only (RNW) behavior for the same endpoints.
(function () {
  var SERVER = "https://localhost:3000";
  var ECHO = SERVER + "/api/echo";
  var PUBLIC_URL = "https://jsonplaceholder.typicode.com/todos/1";

  function print(msg) {
    var out = document.getElementById("out");
    out.textContent += "\n" + msg;
  }

  function runProbes() {
    var out = document.getElementById("out");
    out.textContent = "Running from WebView (platform=" +
      (Office.context ? Office.context.platform : "?") + ")...";
    var stamp = Date.now().toString();

    fetch(ECHO + "?probe=fetch-webview&stamp=" + stamp, { cache: "no-store" })
      .then(function (r) { print("fetch same-origin: status " + r.status); })
      .catch(function (e) { print("fetch same-origin ERROR: " + e.message); });

    fetch(PUBLIC_URL + "?stamp=" + stamp, { cache: "no-store" })
      .then(function (r) { print("fetch public: status " + r.status); })
      .catch(function (e) { print("fetch public ERROR: " + e.message); });

    var xhr = new XMLHttpRequest();
    xhr.onload = function () { print("xhr same-origin: status " + xhr.status); };
    xhr.onerror = function () { print("xhr same-origin ERROR"); };
    xhr.open("GET", ECHO + "?probe=xhr-webview&stamp=" + stamp, true);
    xhr.send();
  }

  Office.onReady(function () {
    document.getElementById("run").onclick = runProbes;
  });
})();
