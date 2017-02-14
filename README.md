# ipfs daemon in a webextension hack

This is my attempt at getting firefox to run an ipfs daemon and make requests to it.

## Usage
Setup is a little weird currently,this isnt polished at all.

- Edit the `ipfs.json` file so that the `path` field points to the script in this repo (wherever you happened to have cloned it).
- Move the `ipfs.json` file to be inside `~/.mozilla/native-message-hosts/`
- Edit the `localgatewayurl` variable in the `background.js` file to point to whatever your local gateway is configured to be.
- Either init an ipfs node with `IPFS_PATH` set to `/tmp/ff-ipfs`, or change the `run-ipfs.sh` script so that `IPFS_PATH` points to an initialized ipfs repo. (leaving it blank is acceptable if you want to use the default location of `~/.ipfs`)
- Open up firefox (must be at least version 49 i think), and go to `about:debugging`
- Click "Load Temporary Add-on" and navigate to and select the `manifest.json` file in this directory.
- Try loading pages like `https://ipfs.io/ipns/ipfs.io` and it should redirect to localhost.
- Do a little dance, and get yourself some coffee
