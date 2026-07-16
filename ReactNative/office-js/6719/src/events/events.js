// events.js -- OJS #6719 diagnostic handler for the classic Outlook JS-only
// (React Native Windows) event runtime.
//
// Constraints for the JS-only runtime (per docs):
//  - single bundled file, NO imports
//  - use ABSOLUTE URLs
//  - Office.onReady/Office.initialize do NOT run here
//  - keep it ES5-ish (customer reported issues with modern syntax); avoid
//    async/await and heavy ternary use.
//
// Experimental design: run four labelled probes and let the SERVER LOG be the
// oracle. Same-origin probes hit our echo endpoint directly (so they appear in
// the log by themselves). For the public-API probes we cannot see that server,
// so after each one settles we RELAY the outcome back to our echo endpoint via
// XHR (report channel). If nothing at all shows up in the server log, the whole
// WinINET transport is dead; if only fetch is missing, fetch alone is broken.

(function (root) {
  var SERVER = "https://localhost:3000";
  var ECHO = SERVER + "/api/echo";
  var PUBLIC_URL = "https://jsonplaceholder.typicode.com/todos/1";

  function nowTag() {
    return Date.now().toString();
  }

  // Relay an outcome back to our own server so it lands in server-requests.log.
  // Uses XHR because docs note XHR surfaces more useful errors than fetch.
  function report(tag, data) {
    try {
      var xhr = new XMLHttpRequest();
      var url =
        ECHO +
        "?report=" +
        encodeURIComponent(tag) +
        "&data=" +
        encodeURIComponent(JSON.stringify(data));
      xhr.open("GET", url, true);
      xhr.send();
    } catch (e) {
      // If even this throws, the report channel itself is dead.
    }
  }

  function probeFetch(url, tag) {
    var started = Date.now();
    log("[6719] fetch start", tag, url);
    try {
      fetch(url, { method: "GET", cache: "no-store" }).then(
        function (response) {
          var out = {
            transport: "fetch",
            tag: tag,
            url: url,
            elapsedMs: Date.now() - started,
            ok: response.ok,
            status: response.status,
            statusText: response.statusText
          };
          log("[6719] fetch response", tag, out);
          report(tag + "-fetch-response", out);
        },
        function (error) {
          var out = {
            transport: "fetch",
            tag: tag,
            url: url,
            elapsedMs: Date.now() - started,
            errorName: error && error.name,
            errorMessage: error && error.message
          };
          log("[6719] fetch error", tag, out);
          report(tag + "-fetch-error", out);
        }
      );
    } catch (e) {
      report(tag + "-fetch-throw", { message: e && e.message });
    }
  }

  function probeXhr(url, tag) {
    var started = Date.now();
    log("[6719] xhr start", tag, url);
    try {
      var xhr = new XMLHttpRequest();
      xhr.timeout = 8000;
      xhr.onload = function () {
        var out = {
          transport: "xhr",
          tag: tag,
          url: url,
          elapsedMs: Date.now() - started,
          status: xhr.status,
          len: xhr.responseText ? xhr.responseText.length : 0
        };
        log("[6719] xhr load", tag, out);
        report(tag + "-xhr-load", out);
      };
      xhr.onerror = function () {
        var out = {
          transport: "xhr",
          tag: tag,
          url: url,
          elapsedMs: Date.now() - started,
          status: xhr.status
        };
        log("[6719] xhr error", tag, out);
        report(tag + "-xhr-error", out);
      };
      xhr.ontimeout = function () {
        var out = {
          transport: "xhr",
          tag: tag,
          url: url,
          elapsedMs: Date.now() - started,
          readyState: xhr.readyState
        };
        log("[6719] xhr timeout", tag, out);
        report(tag + "-xhr-timeout", out);
      };
      xhr.open("GET", url, true);
      xhr.send();
    } catch (e) {
      report(tag + "-xhr-throw", { message: e && e.message });
    }
  }

  function log() {
    try {
      // console may or may not be visible in the JS-only runtime; harmless.
      if (typeof console !== "undefined" && console.log) {
        console.log.apply(console, arguments);
      }
    } catch (e) {}
  }

  function runAllProbes(context) {
    var stamp = nowTag();
    report("handler-start", {
      context: context,
      platform:
        typeof Office !== "undefined" &&
        Office.context &&
        Office.context.platform
          ? Office.context.platform
          : "unknown",
      hasFetch: typeof fetch,
      hasXhr: typeof XMLHttpRequest,
      stamp: stamp
    });

    // Same-origin (hits our echo directly -> visible in server log by itself).
    probeFetch(ECHO + "?probe=fetch-sameorigin&stamp=" + stamp, "sameorigin");
    probeXhr(ECHO + "?probe=xhr-sameorigin&stamp=" + stamp, "sameorigin");

    // Cross-origin public API (outcome relayed back via report()).
    probeFetch(PUBLIC_URL + "?stamp=" + stamp, "public");
    probeXhr(PUBLIC_URL + "?stamp=" + stamp, "public");
  }

  function onAppointmentSendHandler(event) {
    log("[6719] OnAppointmentSend handler triggered");
    runAllProbes("OnAppointmentSend");

    // Give the network probes time to complete/report before we end the
    // runtime. Code after event.completed is not guaranteed to run.
    setTimeout(function () {
      report("handler-completing", { note: "calling event.completed" });
      event.completed({ allowEvent: true });
    }, 9000);
  }

  // Expose for both the JS-only runtime and the taskpane/commands page.
  root.OnAppointmentSendHandler = onAppointmentSendHandler;
  root.OJS6719 = { runAllProbes: runAllProbes };

  // Associate handler. In the JS-only runtime Office.actions is available.
  if (
    typeof Office !== "undefined" &&
    Office.actions &&
    Office.actions.associate
  ) {
    Office.actions.associate(
      "onAppointmentSendHandler",
      onAppointmentSendHandler
    );
  }
})(this);
