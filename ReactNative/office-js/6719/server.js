// Diagnostic HTTPS server for OJS #6719 repro.
//
// Purpose: be the ORACLE for the core question -- "does the outbound request
// from the JS-only (RNW) event runtime actually reach the server?"
// Every inbound request is logged (console + server-requests.log) with a
// timestamp, method, path, query, origin, user-agent and remote address.
//
// It also serves the add-in files (manifest.xml, src/*, .well-known/*) so the
// whole repro runs from a single HTTPS origin: https://localhost:3000

const fs = require("fs");
const path = require("path");
const https = require("https");
const express = require("express");
const devCerts = require("office-addin-dev-certs");

const PORT = 3000;
const LOG_FILE = path.join(__dirname, "server-requests.log");

const app = express();

function logHit(kind, req, extra) {
  const line = JSON.stringify({
    t: new Date().toISOString(),
    kind: kind,
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    origin: req.headers["origin"] || null,
    ua: req.headers["user-agent"] || null,
    ip: req.socket && req.socket.remoteAddress,
    extra: extra || null
  });
  // eslint-disable-next-line no-console
  console.log(line);
  fs.appendFile(LOG_FILE, line + "\n", function () {});
}

// Permissive CORS so that CORS is never the blocker -- we want to isolate the
// transport layer, not fight preflight.
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    logHit("preflight", req);
    return res.status(204).end();
  }
  next();
});

// The echo/telemetry endpoint. The JS-only handler and the taskpane both hit
// this. `report=<tag>&data=<json>` lets the client relay the outcome of calls
// to *other* servers (e.g. public APIs) back into our single log.
app.all("/api/echo", function (req, res) {
  logHit("echo", req);
  res.json({
    ok: true,
    serverTime: new Date().toISOString(),
    youSent: { method: req.method, query: req.query }
  });
});

// Serve add-in static files (dotfiles:'allow' is required for /.well-known/).
app.use(
  express.static(__dirname, {
    dotfiles: "allow",
    setHeaders: function (res, filePath) {
      if (filePath.indexOf("microsoft-officeaddins-allowed.json") !== -1) {
        res.setHeader("Content-Type", "application/json");
      }
    }
  })
);

(async function () {
  const options = await devCerts.getHttpsServerOptions();
  https.createServer(options, app).listen(PORT, function () {
    // eslint-disable-next-line no-console
    console.log("OJS-6719 repro server listening on https://localhost:" + PORT);
    console.log("  manifest:   https://localhost:" + PORT + "/manifest.xml");
    console.log("  events.js:  https://localhost:" + PORT + "/src/events/events.js");
    console.log("  well-known: https://localhost:" + PORT + "/.well-known/microsoft-officeaddins-allowed.json");
    console.log("  echo:       https://localhost:" + PORT + "/api/echo");
    console.log("Logging every inbound request to " + LOG_FILE);
  });
})().catch(function (err) {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
