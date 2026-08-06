#!/usr/bin/env bash
# Normalize raw screen captures into Chrome Web Store screenshots.
#
#   ./store/normalize-screenshots.sh ~/Desktop/shot1.png ~/Desktop/shot2.png
#
# The store accepts exactly 1280x800 or 640x400. macOS window captures come out
# at the display's scale factor and at whatever aspect the window happened to be —
# a browser viewport is usually wider than 16:10 — so each input is scaled to FIT
# and letterboxed on black rather than cropped. Cropping to 16:10 ate the left nav
# and the floating toggle, which are the two things the screenshots exist to show.
# Outputs land in store/screenshots/ as 01.png, 02.png, ...
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "usage: $0 <capture.png> [capture.png ...]" >&2
  exit 64
fi

cd "$(dirname "$0")/.."
out_dir="store/screenshots"
mkdir -p "$out_dir"

i=0
for src in "$@"; do
  i=$((i + 1))
  dst=$(printf "%s/%02d.png" "$out_dir" "$i")
  magick "$src" -resize 1280x800 -background black -gravity center -extent 1280x800 -strip "$dst"
  echo "$(magick identify -format '%wx%h' "$src")  ->  $dst  $(magick identify -format '%wx%h' "$dst")"
done
