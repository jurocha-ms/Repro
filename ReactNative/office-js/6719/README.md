# OJS #6719 / ADO 7409444 repro

Reproduces: **classic Outlook on Windows, JavaScript-only (React Native Windows) event runtime, `OnAppointmentSend` — `fetch` / `XMLHttpRequest` start but hang/timeout and never reach the server**, while `event.completed` works.

## What this repro proves

The server (`server.js`) logs **every inbound request** to the console and to `server-requests.log`. That log is the oracle for the central question: *does the outbound request from the JS-only runtime actually reach the server?*

- `src/events/events.js` — the JS-only handler. Fires 4 labelled probes (fetch + XHR, same-origin + public API). Same-origin probes hit `/api/echo` directly; public-API outcomes are relayed back to `/api/echo` via `report=<tag>` so everything lands in one log.
- `src/taskpane/taskpane.js` — runs the **same** probes from the WebView runtime for an A/B comparison. If WebView works and JS-only doesn't, the fault is in the RNW/WinINET transport.

## Run

```powershell
cd C:\Repo\repro\ReactNative\office-js\6719
npm install
npx office-addin-dev-certs install   # trust localhost HTTPS cert (first time)
npm start                            # https://localhost:3000
```

Sideload `manifest.xml` in classic Outlook (Version >= 2201 for full CORS). Event-based add-ins normally require admin deployment; for local dev use registry sideloading per the Microsoft Learn "Sideload Outlook add-ins for testing" guide.

Then: create an appointment → **Send** (triggers `OnAppointmentSend`). Watch the server console / `server-requests.log`.

## Reading the results

| server-requests.log shows | Interpretation |
| --- | --- |
| `handler-start` but no probe hits | Whole transport dead in JS-only runtime |
| `xhr-*` reports but no `fetch-*` | fetch broken, XHR ok |
| same-origin hits but no `public` reports | egress/proxy/TLS issue to external hosts |
| nothing at all | handler not associated / runtime not loading |
| WebView probes hit, JS-only don't | RNW/WinINET-specific fault |

## Next step after repro

Capture a WinINET + RNW ETW trace during the failing send to pinpoint proxy/PAC resolution, Schannel/revocation, headless-auth, or request-never-dispatched.
