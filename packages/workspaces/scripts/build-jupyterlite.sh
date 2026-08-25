#!/usr/bin/env bash
# =============================================================================
# build-jupyterlite.sh — Build a JupyterLite site (free or remote tier)
#
# Sources setup-env.sh so the venv, Python version, and tooling are identical
# to those used by build-gen3sdk-lite.sh.
#
# Usage:
#   ./build-jupyterlite.sh <tier> [build_dir]
#     tier: 'free' or 'remote'
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  echo "Usage: $0 <tier> [build_dir]"
  echo "  tier: 'free' or 'remote'"
  exit 1
}

TIER="${1:-}"
if [[ "$TIER" != "free" && "$TIER" != "remote" ]]; then
  usage
fi

# ── Path constants (self-contained, mirrors build-gen3sdk-lite layout) ───────
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

if [[ "$TIER" == "free" ]]; then
  SRC_DIR="$ROOT_DIR/free-private"
else
  SRC_DIR="$ROOT_DIR/remote-private"
fi

BUILD_DIR="${2:-$(pwd)/builds}"
mkdir -p "$BUILD_DIR"
BUILD_DIR="$(cd "$BUILD_DIR" && pwd)"

VENV_DIR="$BUILD_DIR/.venv"
OUTPUT_DIR="$BUILD_DIR/pypi"

export BUILD_DIR   # setup-env.sh reads this

# ── Colours / helpers (available before setup-env.sh) ────────────────────────
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }

# ── Source shared environment (creates/reuses the venv) ──────────────────────
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/setup-env.sh"

# ── JupyterLite-specific setup ──────────────────────────────────────────────
CONFIG_FILE="$SRC_DIR/jupyter_lite_config.json"
REQUIREMENTS_FILE="$SRC_DIR/requirements.txt"
VENV_JUPYTER_LITE="$VENV_DIR/bin/jupyter-lite"
PYPI="$OUTPUT_DIR"   # wheels built by build-gen3sdk-lite land here

if [[ ! -f "$REQUIREMENTS_FILE" ]]; then
  echo "Missing requirements file: $REQUIREMENTS_FILE"
  exit 1
fi

# For the free tier, skip reinstalling requirements when jupyter-lite is already
# present to preserve exact package versions set up by build-gen3sdk-lite.sh.
# For the remote tier, always install because its requirements.txt includes
# jupyterlite-remote-server which the free-tier build never installs.
if [[ "$TIER" == "free" && -x "$VENV_JUPYTER_LITE" ]]; then
  info "Existing venv already has jupyter-lite — skipping requirements install"
else
  info "Installing JupyterLite requirements …"
  uv pip install -r "$REQUIREMENTS_FILE" 2>&1 | tail -5
  success "JupyterLite requirements installed"
fi

if [[ ! -x "$VENV_JUPYTER_LITE" ]]; then
  echo "jupyter-lite executable not found in $VENV_DIR after dependency install."
  exit 1
fi

# ── Build ────────────────────────────────────────────────────────────────────
if [[ "$TIER" == "free" ]]; then
  WHEEL_ARGS=()
  if [[ -d "$PYPI" ]]; then
    info "Looking for wheels in $PYPI"
    while IFS= read -r -d '' whl; do
      WHEEL_ARGS+=(--piplite-wheels "$whl")
    done < <(find "$PYPI" -maxdepth 1 -name "*.whl" -print0 | sort -z)
  fi

  # Patch the config to point PyodideLockAddon.wheels at the absolute pypi path.
  # The source config uses a relative "pypi/" path (relative to lite-dir), which
  # is wrong when the wheels live in BUILD_DIR/pypi rather than SRC_DIR/pypi.
  PATCHED_CONFIG="$BUILD_DIR/jupyter_lite_config.json"
  python3 - <<PYEOF
import json
with open('$CONFIG_FILE') as fh:
    cfg = json.load(fh)
addon = cfg.setdefault('PyodideLockAddon', {})
addon['wheels'] = ['$PYPI/']
with open('$PATCHED_CONFIG', 'w') as fh:
    json.dump(cfg, fh, indent=2)
PYEOF

  info "Running: jupyter-lite build (free tier, ${#WHEEL_ARGS[@]} custom wheels)"
  "$VENV_JUPYTER_LITE" build \
    --config "$PATCHED_CONFIG" \
    --lite-dir "$SRC_DIR" \
    --output-dir "$BUILD_DIR/$TIER" \
    ${WHEEL_ARGS[@]+"${WHEEL_ARGS[@]}"}
else
  info "Running: jupyter-lite build (remote tier)"
  "$VENV_JUPYTER_LITE" build \
    --config "$CONFIG_FILE" \
    --lite-dir "$SRC_DIR" \
    --output-dir "$BUILD_DIR/$TIER"
fi

success "$TIER-tier JupyterLite build complete: $BUILD_DIR/$TIER"
