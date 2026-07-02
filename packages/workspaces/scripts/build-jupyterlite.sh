#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <tier> [build_dir]"
  echo "  tier: 'free' or 'remote'"
  exit 1
}

TIER="${1:-}"
if [[ "$TIER" != "free" && "$TIER" != "remote" ]]; then
  usage
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "$TIER" == "free" ]]; then
  SRC_DIR="$ROOT_DIR/free-private"
else
  SRC_DIR="$ROOT_DIR/jupyterlite-builds/remote-private"
fi

CONFIG_FILE="$SRC_DIR/jupyter_lite_config.json"
REQUIREMENTS_FILE="$SRC_DIR/requirements.txt"
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3)}"
BUILD_DIR="${2:-$SRC_DIR/build}"
VENV_DIR="$BUILD_DIR/.venv"
VENV_PYTHON="$VENV_DIR/bin/python"
VENV_JUPYTER_LITE="$VENV_DIR/bin/jupyter-lite"

if [[ -z "$PYTHON_BIN" ]] || ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "python3 executable not found. Set PYTHON_BIN to a valid Python interpreter."
  exit 1
fi

if [[ ! -f "$REQUIREMENTS_FILE" ]]; then
  echo "Missing requirements file: $REQUIREMENTS_FILE"
  exit 1
fi

mkdir -p "$BUILD_DIR"

"$PYTHON_BIN" -m venv "$VENV_DIR"

"$VENV_PYTHON" -m pip install --upgrade pip
"$VENV_PYTHON" -m pip install -r "$REQUIREMENTS_FILE"

if [[ ! -x "$VENV_JUPYTER_LITE" ]]; then
  echo "jupyter-lite executable not found in $VENV_DIR after dependency install."
  exit 1
fi

"$VENV_JUPYTER_LITE" build \
  --config "$CONFIG_FILE" \
  --output-dir "$BUILD_DIR/$TIER"

echo "$TIER-tier JupyterLite build complete: $BUILD_DIR/$TIER (venv: $VENV_DIR)"
