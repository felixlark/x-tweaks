#!/usr/bin/env bash
# Build the Chrome Web Store upload zip.
#
# The store rejects an archive with a top-level folder, so the files are zipped
# from the repo root with explicit paths. Source SVGs, the README, and this
# directory are deliberately left out — only what the extension loads ships.
set -euo pipefail

cd "$(dirname "$0")/.."
version=$(sed -n 's/.*"version": "\([^"]*\)".*/\1/p' manifest.json)
out="dist/x-tweaks-${version}.zip"

mkdir -p dist
rm -f "$out"
zip -q -X "$out" \
  manifest.json \
  content.css \
  content.js \
  nav-keys.js \
  icons/icon16.png \
  icons/icon32.png \
  icons/icon48.png \
  icons/icon128.png

echo "$out"
unzip -l "$out"
