/*
On startup, connect to the "ping_pong" app.
*/
var port = browser.runtime.connectNative("ipfs");

var localgatewayurl = "http://localhost:8090"

/*
Listen for messages from the app.
*/
port.onMessage.addListener((response) => {
  console.log("Received: " + response);
});

var pattern = "https://ipfs.io/*";

function redirect(requestDetails) {
  console.log("Redirecting: " + requestDetails.url);
  return {
    redirectUrl: requestDetails.url.replace("https://ipfs.io", localgatewayurl)
  };
}

browser.webRequest.onBeforeRequest.addListener(
  redirect,
  {urls:[pattern]},
  ["blocking"]
);
