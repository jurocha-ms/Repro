/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

function testCORS(event) {

  const uri = 'https://jsonplaceholder.typicode.com/posts/1';
  const headers = {
      // [FAIL] TypeError: Network request failed
      Authorization: "test"
  };

  return fetch(uri, {headers})
    .then(response => {
      if (! response.ok) {
        Office.context.mailbox.item.subject.setAsync('[FAIL] Response not OK');
      }

      Office.context.mailbox.item.subject.setAsync('[WIN] Response yes OK');

      return response;
    }).then(response => response.json())
    .then(jsonData => {
      var content = jsonData["body"];
      Office.context.mailbox.item.body.setAsync(`${content}`);
    }).catch(error => {
      Office.context.mailbox.item.subject.setAsync('[FAIL] ' + error);
    });
}

function a2b(a) {
  var b, c, d, e = {}, f = 0, g = 0, h = "", i = String.fromCharCode, j = a.length;
  for (b = 0; 64 > b; b++) e["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(b)] = b;
  for (c = 0; j > c; c++) for (b = e[a.charAt(c)], f = (f << 6) + b, g += 6; g >= 8; ) ((d = 255 & f >>> (g -= 8)) || j - 2 > c) && (h += i(d));
  return h;
}

function blobbyfill(event) {
  try {
    //Classic Outlook AddIn does not implement the atob function, the a2b function is a polyfill of the atob function.

    let base64String = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
    let bstr, n, u8arr;

    if (typeof btoa === 'function')
      bstr = atob(base64String);
    else
      bstr = a2b(base64String);

    n = bstr.length;
    u8arr = new Uint8Array(n);

    while(n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    var myblob = new Blob([u8arr], {type: 'application/octet-stream'});

    Office.context.mailbox.item.subject.setAsync('[WIN] blah');
  } catch (error) {
    Office.context.mailbox.item.subject.setAsync('[FAIL] ' + error);
  }
}

function onNewMessageComposeHandler(event) {
  blobbyfill(event);
}

function onNewAppointmentComposeHandler(event) {
  setSubject(event);
}

function setSubject(event) {
  Office.context.mailbox.item.subject.setAsync(
    "Set by an event-based add-in!",
    {
      "asyncContext": event
    },
    function (asyncResult) {
      // Handle success or error.
      if (asyncResult.status !== Office.AsyncResultStatus.Succeeded) {
        console.error("Failed to set subject: " + JSON.stringify(asyncResult.error));
      }

      // Call event.completed() to signal to the Outlook client that the add-in has completed processing the event.
      asyncResult.asyncContext.completed();
    });
}

// IMPORTANT: To ensure your add-in is supported in Outlook, remember to map the event handler name specified in the manifest to its JavaScript counterpart.
Office.actions.associate("onNewMessageComposeHandler", onNewMessageComposeHandler);
Office.actions.associate("onNewAppointmentComposeHandler", onNewAppointmentComposeHandler);