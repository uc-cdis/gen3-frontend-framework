#!/usr/bin/env bash
set -euo pipefail


BUILD_SRC="${1:-}"
if [[ -z "$BUILD_SRC" ]]; then
  usage "set to the output of the juypterlite install"
fi

PKG_DIR="${2:-jupyter-workspaces}"
echo "assets directory is: $PKG_DIR"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FREE_SRC="$BUILD_SRC/free"
REMOTE_SRC="$BUILD_SRC/remote"
FREE_DST="$PKG_DIR/assets/free"
REMOTE_DST="$PKG_DIR/assets/remote"
VALIDATE_SCRIPT="$SCRIPT_DIR/scripts/validate-jupyterlite-assets.sh"

if [[ ! -d "$FREE_SRC" ]]; then
  echo "Missing free JupyterLite build output: $FREE_SRC"
  echo "Run: npm run build:jupyterlite:free"
  exit 1
fi

if [[ ! -d "$REMOTE_SRC" ]]; then
  echo "Missing remote JupyterLite build output: $REMOTE_SRC"
  echo "Run: npm run build:jupyterlite:remote"
  exit 1
fi

bash "$VALIDATE_SCRIPT" --free-dir "$FREE_SRC" --remote-dir "$REMOTE_SRC"

rm -rf "$FREE_DST" "$REMOTE_DST"
mkdir -p "$PKG_DIR/assets"
cp -R "$FREE_SRC" "$FREE_DST"
cp -R "$REMOTE_SRC" "$REMOTE_DST"

bash "$VALIDATE_SCRIPT" --free-dir "$FREE_DST" --remote-dir "$REMOTE_DST"

echo "Synced JupyterLite assets into package:"
echo "  $FREE_DST"
echo "  $REMOTE_DST"
