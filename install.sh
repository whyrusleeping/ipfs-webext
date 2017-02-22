#!/bin/bash

DIST="/ipns/dist.ipfs.io"
IPFS_VERS="v0.4.5"

LOCAL_APP_DIR="$HOME/.local/share/ipfs-web"
IPFS_BIN_PATH="$LOCAL_APP_DIR/run-ipfs.sh"

# init colors
txtnon='\e[0m'    # color reset
txtred='\e[0;31m' # Red
txtgrn='\e[0;32m' # Green
txtylw='\e[0;33m' # Yellow

function fail() { printf $txtred%s$txtnon\\n "$*"; exit 1; }
function warn() { printf $txtylw%s$txtnon\\n "$*"; }
function notice() { printf $txtgrn%s$txtnon\\n "$*"; }

function hostsPath() {
	browser="$1"
	osname=$(uname)

	case "$browser$osname" in
		firefoxLinux)
			echo "$HOME/.mozilla/native-messaging-hosts"
			;;
		firefoxDarwin)
			echo "$HOME/Library/Application Support/Mozilla/NativeMessagingHosts"
			;;
		googlechromeLinux)
			echo "$HOME/.config/google-chrome/NativeMessagingHosts"
			;;
		googlechromeDarwin)
			echo "$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
			;;
		chromiumLinux)
			echo "$HOME/.config/chromium/NativeMessagingHosts"
			;;
		chromiumDarwin)
			echo "$HOME/Library/Application Support/Chromium/NativeMessagingHosts"
			;;
	esac
}


function installNativeHook() {
	runipfsbin="$1"
	browser="$2"

	trgtdir=$(hostsPath $browser)

	echo "  > ensure $trgtdir exists..."
	mkdir -p "$trgtdir" ||
		fail "could not create standard native messaging directory: $trgtdir"

	echo "  > write native messaging host file"
	sed "s#XXRUNIPFSPATHXX#$runipfsbin#g" ipfs.json > "$trgtdir/ipfs.json" ||
		fail "failed to write ipfs.json file"

	echo "  > complete"
}

function installForBrowser() {
	browser="$1"
	notice "Installing ipfs web extension for $browser"

	notice "Step 1: Install native messaging hook"

	installNativeHook "$IPFS_BIN_PATH" "$browser"

	notice "Step 2: Install extension files to application directory"

	echo "  > ensure $LOCAL_APP_DIR exists..."
	mkdir -p "$LOCAL_APP_DIR" ||
		fail "could not create entry in local application directory: $LOCAL_APP_DIR"

	export IPFS_PATH="$LOCAL_APP_DIR/repo"

	echo "  > move extension scripts into place"
	cp dist_get run-ipfs.sh "$LOCAL_APP_DIR/" ||
		fail "could not copy files into app dir"

	cd "$LOCAL_APP_DIR" ||
		exit 1

	chmod +x dist_get run-ipfs.sh ||
		fail "failed to set execute bit on installed scripts"

	echo "  > complete"

	notice "Step 3: Download ipfs"

	if test -f ./bin/ipfs; then
		warn "  > found previously downloaded ipfs binary, skipping download"
	else
		if ! ./dist_get $DIST go-ipfs ./bin/ipfs $IPFS_VERS ipfs; then
			fail "failed to fetch ipfs binary"
		fi
	fi

	echo "  > complete"

	notice "Step 4: Init IPFS"
	if test -f "$IPFS_PATH/config"; then
		warn "  > an ipfs node has already been initialized in the extensions app directory"
	else
		if ! ./bin/ipfs init; then
			fail "ipfs node initialization failed"
		fi
	fi

	notice "Installation Complete!"
}

BROWSER="$1"
if [ -z "$BROWSER" ]; then
	BROWSER="firefox"
fi

installForBrowser "$BROWSER"
