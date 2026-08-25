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

  # Patch config to use the absolute pypi path so jupyter-lite can find the
  # custom wheels built by build-gen3sdk-lite.
  PATCHED_CONFIG="$BUILD_DIR/jupyter_lite_config.json"
  python - <<PYEOF
import json

with open('$CONFIG_FILE') as fh:
    cfg = json.load(fh)

addon = cfg.get('PyodideLockAddon', {})
if 'wheels' in addon:
    addon['wheels'] = ['$PYPI/']
    cfg['PyodideLockAddon'] = addon

with open('$PATCHED_CONFIG', 'w') as fh:
    json.dump(cfg, fh, indent=2)
PYEOF

  info "Looking for wheels in $PYPI"
  WHEEL_ARGS=()
  if [[ -d "$PYPI" ]]; then
    while IFS= read -r -d '' whl; do
      WHEEL_ARGS+=(--piplite-wheels "$whl")
    done < <(find "$PYPI" -maxdepth 1 -name "*.whl" -print0 | sort -z)
  fi

  info "Running: jupyter-lite build (free tier, ${#WHEEL_ARGS[@]} custom wheels)"
  "$VENV_JUPYTER_LITE" build \
    --config "$PATCHED_CONFIG" \
    --lite-dir "$SRC_DIR" ${WHEEL_ARGS[@]+"${WHEEL_ARGS[@]}"} \
    --output-dir "$BUILD_DIR/$TIER"

  # ── Patch pyodide-lock to remove packages our local wheels supersede ────────
  # Pyodide 0.29.3 bundles fastavro==0.17.5. micropip refuses to upgrade a
  # lock-registered package without reinstall=True, which breaks pypfb's
  # fastavro>=1.11.0 dep. Removing it from the lock lets piplite install our
  # 1.12.2 wheel cleanly for both direct installs and transitive dependencies.
  PYODIDE_VERSION=$(python3 -c \
    "from jupyterlite_pyodide_kernel.constants import PYODIDE_VERSION; print(PYODIDE_VERSION)")
  PYODIDE_LOCK_URL="https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide-lock.json"
  CACHED_LOCK="$BUILD_DIR/pyodide-lock-${PYODIDE_VERSION}.json"
  PATCHED_LOCK="$BUILD_DIR/$TIER/pyodide-lock.json"

  if [[ ! -f "$CACHED_LOCK" ]]; then
    info "Downloading pyodide-lock.json for Pyodide v${PYODIDE_VERSION} …"
    curl -sL "$PYODIDE_LOCK_URL" -o "$CACHED_LOCK"
  fi

  info "Patching pyodide-lock.json (removing packages provided by local wheels) …"
  python3 - "$CACHED_LOCK" "$PATCHED_LOCK" <<'PYEOF'
import json, sys
cached, patched = sys.argv[1], sys.argv[2]
with open(cached) as fh:
    lock = json.load(fh)
# Remove packages where our local wheels provide a newer version.
# Without removal, micropip raises a version-conflict error instead of
# upgrading the lock-registered package.
remove = ['fastavro']
pkgs = lock.get('packages', {})
for pkg in remove:
    if pkg in pkgs:
        del pkgs[pkg]
        print(f'  removed {pkg} from pyodide-lock')
with open(patched, 'w') as fh:
    json.dump(lock, fh)
PYEOF

  # Tell the kernel to load our patched lock instead of the CDN one.
  python3 - "$BUILD_DIR/$TIER/jupyter-lite.json" <<'PYEOF'
import json, sys
path = sys.argv[1]
with open(path) as fh:
    cfg = json.load(fh)
jcd = cfg.setdefault('jupyter-config-data', {})
ps  = jcd.setdefault('litePluginSettings', {})
ks  = ps.setdefault('@jupyterlite/pyodide-kernel-extension:kernel', {})
lo  = ks.setdefault('loadPyodideOptions', {})
lo['lockFileURL'] = './pyodide-lock.json'
with open(path, 'w') as fh:
    json.dump(cfg, fh, indent=2)
print('  updated jupyter-lite.json: lockFileURL → ./pyodide-lock.json')
PYEOF

  success "Pyodide lock patched and kernel configured"
else
  info "Running: jupyter-lite build (remote tier)"
  "$VENV_JUPYTER_LITE" build \
    --config "$CONFIG_FILE" \
    --lite-dir "$SRC_DIR" \
    --output-dir "$BUILD_DIR/$TIER"
fi

success "$TIER-tier JupyterLite build complete: $BUILD_DIR/$TIER"
