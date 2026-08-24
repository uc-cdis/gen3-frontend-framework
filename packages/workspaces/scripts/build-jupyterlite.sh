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
  SRC_DIR="$ROOT_DIR/remote-private"
fi

CONFIG_FILE="$SRC_DIR/jupyter_lite_config.json"
REQUIREMENTS_FILE="$SRC_DIR/requirements.txt"
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3)}"
BUILD_DIR="${2:-$SRC_DIR/build}"
mkdir -p "$BUILD_DIR"
BUILD_DIR="$(cd "$BUILD_DIR" && pwd)"
VENV_DIR="$BUILD_DIR/.venv"
VENV_PYTHON="$VENV_DIR/bin/python"
VENV_JUPYTER_LITE="$VENV_DIR/bin/jupyter-lite"
PYPI="$BUILD_DIR/pypi"

if [[ -z "$PYTHON_BIN" ]] || ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "python3 executable not found. Set PYTHON_BIN to a valid Python interpreter."
  exit 1
fi

if [[ ! -f "$REQUIREMENTS_FILE" ]]; then
  echo "Missing requirements file: $REQUIREMENTS_FILE"
  exit 1
fi



"$PYTHON_BIN" -m venv "$VENV_DIR"

"$VENV_PYTHON" -m pip install --upgrade pip
"$VENV_PYTHON" -m pip install -r "$REQUIREMENTS_FILE"

if [[ ! -x "$VENV_JUPYTER_LITE" ]]; then
  echo "jupyter-lite executable not found in $VENV_DIR after dependency install."
  exit 1
fi



# Add the pypi gen3 packages to the build
if [[ "$TIER" == "free" ]]; then

# Patch the config to use the absolute pypi path, then build.
# The source config uses a relative "pypi/" entry in PyodideLockAddon.wheels;
# jupyter-lite resolves it relative to the config file's location (inside the
# published dist tree), so it would never find $BUILD_DIR/pypi without patching.
PATCHED_CONFIG="$BUILD_DIR/jupyter_lite_config.json"
"$VENV_PYTHON" - <<PYEOF
import json, sys

with open('$CONFIG_FILE') as fh:
    cfg = json.load(fh)

addon = cfg.get('PyodideLockAddon', {})
if 'wheels' in addon:
    addon['wheels'] = ['$PYPI/']
    cfg['PyodideLockAddon'] = addon

with open('$PATCHED_CONFIG', 'w') as fh:
    json.dump(cfg, fh, indent=2)
PYEOF

  echo "looking for wheels in $PYPI":
  WHEEL_ARGS=()
  if [[ -d "$PYPI" ]]; then
    while IFS= read -r -d '' whl; do
      WHEEL_ARGS+=(--piplite-wheels "$whl")
    done < <(find "$PYPI" -maxdepth 1 -name "*.whl" -print0 | sort -z)
  fi

  echo "$VENV_JUPYTER_LITE" build \
         --config "$PATCHED_CONFIG" \
         --lite-dir "$SRC_DIR" ${WHEEL_ARGS[@]+"${WHEEL_ARGS[@]}"} \
         --output-dir "$BUILD_DIR/$TIER"

  "$VENV_JUPYTER_LITE" build \
    --config "$PATCHED_CONFIG" \
    --lite-dir "$SRC_DIR" ${WHEEL_ARGS[@]+"${WHEEL_ARGS[@]}"} \
    --output-dir "$BUILD_DIR/$TIER"
else
  echo "$VENV_JUPYTER_LITE" build \
         --config "$CONFIG_FILE" \
         --lite-dir "$SRC_DIR" \
         --output-dir "$BUILD_DIR/$TIER"

  "$VENV_JUPYTER_LITE" build \
    --config "$CONFIG_FILE" \
    --lite-dir "$SRC_DIR" \
    --output-dir "$BUILD_DIR/$TIER"
fi



echo "$TIER-tier JupyterLite build complete: $BUILD_DIR/$TIER (venv: $VENV_DIR)"
