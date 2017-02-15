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

/*
  Redirect downloads

  UX PoC for downloading files from web using native IPFS

  Downloads files from local IPFS gateway when the website
  specifies 'IPFS_DOWNLOAD=Qm...Foo' in a link. Eg.

  <a href="http://ovh.net/files/1Gb.dat?IPFS_DOWNLOAD=QmWKW2E4qHTUeYXtiEQpZ7eX3aNoNnWc4d9g3NW1CuyUCq">

  What happens here:
  1. User downloads a file from a URL, gets asked
     for where to save the file, like normally.
  2. Download is created by the browser.
  3. We capture the newly-created download and cancel it
     if we find 'IPFS_DOWNLOAD=Qm...Foo' in the URL. 
     For example:
     http://ovh.net/files/1Gb.dat?IPFS_DOWNLOAD=QmWKW2E4qHTUeYXtiEQpZ7eX3aNoNnWc4d9g3NW1CuyUCq
  4. We ask the browser to download the hash from local IPFS gateway
     with the original filename.

  Limitations:
  - Websites need to add 'IPFS_DOWNLOAD=Qm...Foo' to their <a> tags
  - With the current flow, files are always saved in browser's default
    download directory regardless where user saved it when prompted.
 */
function handleDownloadRequest(downloadItem) {
  console.log("Download:", downloadItem)

  const match = downloadItem.url.match(/\bIPFS_DOWNLOAD=Qm\w{44}\b/)
  const multihash = match ? match[0].replace("IPFS_DOWNLOAD=", "") : null

  if (multihash) {
    browser.downloads.cancel(downloadItem.id)
      .then(() => {
        const downloadUrl = localgatewayurl + "/ipfs/" + multihash
        const filename = downloadItem.filename.split("/").pop()
        console.log("multihash:", multihash, downloadUrl)
        browser.downloads.download({ 
          url: downloadUrl,
          filename: filename,
        })
      })
  }
}

browser.downloads.onCreated.addListener(handleDownloadRequest)
