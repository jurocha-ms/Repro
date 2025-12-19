/*
* Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
* See LICENSE in the project root for license information.
*/

/*
 * Start WebPack (stand-alone): node node_modules\webpack\bin\webpack.js serve --mode development
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

/*
Reference (Chromium-based browser):

const uri = 'http://localhost:5555/officedev/office-js/issues/5869';
const formData = new FormData();
const xhr = new XMLHttpRequest();
undefined
xhr.onload = () => { console.log(`[${xhr.responseText}]`); }
xhr.open('POST', uri, true);
xhr.onerror = e => { console.log(e) }
xhr.send(formData);

[Multipart form data with 0 entries]
*/
function emptyForm(event) {
  const uri = 'http://localhost:5555/officedev/office-js/issues/5869';
  const xhr = new XMLHttpRequest();
  const formData = new FormData();
  // formData.append('k1', 'v1');
  // formData.append('k2', 'v2');

  xhr.open('POST', uri, true);
  xhr.onload = () => {
    if (xhr.status < 200 || xhr.status > 299) {
      Office.context.mailbox.item.subject.setAsync('[NOK] ' + xhr.status);
      return;
    }

    Office.context.mailbox.item.subject.setAsync('[OK] ' + xhr.status);
    Office.context.mailbox.item.body.setAsync(xhr.responseText);
  };
  xhr.onerror = (error) => {
    Office.context.mailbox.item.body.setAsync("[FAIL]\n" + uri + "\n" + JSON.stringify(error, null, 2));
  };

  xhr.send(formData);
}

/*
  const uri = 'http://localhost:5555/officedev/office-js/issues/5869';
  const xhr = new XMLHttpRequest();
  const formData = new FormData();

  // Office.context.mailbox.item.body.setAsync('pre LET');

  let bstr = atob('fileContent'),
  n = bstr.length,
  u8arr = new Uint8Array(n);

  // Office.context.mailbox.item.body.setAsync('post LET');

  while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
  }

xhr.responseType = 'blob';
  xhr.open('POST', uri, true);
    xhr.onload = (response) => {
      if (xhr.status < 200 || xhr.status > 299) { console.error('bad status ' + xhr.status); }
      console.log(JSON.stringify(response));
    };
    xhr.onerror = error => { console.log(error); };

xhr.send(formData);
*/
function fileForm(event) {
  const uri = 'http://localhost:5555/officedev/office-js/issues/5869';
  const xhr = new XMLHttpRequest();
  const formData = new FormData();

  // Office.context.mailbox.item.body.setAsync('pre LET');

  let bstr = a2b('fileContent'),
  n = bstr.length,
  u8arr = new Uint8Array(n);

  // Office.context.mailbox.item.body.setAsync('post LET');

  while(n--) {
        u8arr[n] = bstr.charCodeAt(n);
  }

  // Office.context.mailbox.item.body.setAsync('post while');

  ///Office.context.mailbox.item.body.setAsync(`u8arr: [${u8arr}]\nbstr: [${bstr}]`);

  //THIS FAILS!!!
  // const file = new File([u8arr], "attachmentName");
  // formData.append('file', file);
  // formData.append('file', new File([u8arr], "attachmentName"));

  Office.context.mailbox.item.body.setAsync('post PEND');

  xhr.responseType = 'blob';
  xhr.open('POST', uri, true);
  xhr.onload = () => {
    if (xhr.status < 200 || xhr.status > 299) {
      Office.context.mailbox.item.subject.setAsync('[NOK] ' + xhr.status);
      return;
    }

    Office.context.mailbox.item.subject.setAsync('[OK] ' + xhr.status);
    Office.context.mailbox.item.body.setAsync(xhr.responseText);
  };
  xhr.onerror = (error) => {
    Office.context.mailbox.item.body.setAsync("[FAIL]\n" + uri + "\n" + JSON.stringify(error, null, 2));
  };

  Office.context.mailbox.item.body.setAsync('PRE send');

  // xhr.send(formData);
}

function onNewMessageComposeHandler(event) {
  fileForm(event);
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
