/*
On startup, connect to the "ping_pong" app.
*/
console.log("startup")
var port = null
if (typeof browser != 'undefined') {
	port = browser.runtime.connectNative("ipfs");
} else {
	port = chrome.runtime.connectNative("ipfs")
}

console.log("got port")
var localgatewayurl = "http://localhost:8080"

/*
Listen for messages from the app.
*/
port.onMessage.addListener((response) => {
  console.log("Received: " + response);
});
port.onDisconnect.addListener(() => {
  console.log("ipfs disconnected");
});


//navigator.registerProtocolHandler("web+fs", "http://localhost:8080/%s", "ipfs extension")

var pattern = "https://ipfs.io/*";

function redirect(requestDetails) {
	console.log("Redirecting: " + requestDetails.url);
	if (requestDetails.url == "https://ipfs.io/") {
		return {
			redirectUrl: localgatewayurl + "/ipns/ipfs.io"
		}
	}
	return {
		redirectUrl: requestDetails.url.replace("https://ipfs.io", localgatewayurl)
	};
}

var b = null
if (typeof browser != 'undefined') {
	b = browser
} else {
	b = chrome
}

b.webRequest.onBeforeRequest.addListener(
  redirect,
  {urls:[pattern]},
  ["blocking"]
);
