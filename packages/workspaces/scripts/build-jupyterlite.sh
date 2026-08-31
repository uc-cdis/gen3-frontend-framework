#!/usr/bin/env bash
# =============================================================================
# build-jupyterlite.sh — Build a JupyterLite site (free or remote tier)
#
# Sources setup-env.sh so the venv, Python version, and tooling are identical
# to those used by build-gen3sdk-lite.sh.
#
# Package delivery model (see jupyter_lite_config.json):
#   - PyodideAddon vendors the full Pyodide distribution into static/pyodide,
#     so the runtime and its ~300 wheels are served from our own origin.
#   - PyodideLockAddon is DISABLED. In jupyterlite-pyodide-kernel 0.8.5 its
#     post_build_lock() copies the lock away from the wheels it references,
#     so a vendored local distribution fails with Pep508UrlError. The
#     distribution's own pyodide-lock.json is shipped untouched instead.
#   - Our wheels reach the browser via PipliteAddon, fed by the
#     --piplite-wheels flags below.
#
# Usage:
#   ./build-jupyterlite.sh <tier> [build_dir]
#     tier: 'free' or 'remote'
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() {
  echo "Usage: $0 <tier> [build_dir]"
  echo "  tier:  'free' or 'remote'"
  exit 1
}

# ── Parse flags (strip before positional args are consumed) ──────────────────
POSITIONAL_ARGS=()
for _arg in "$@"; do
  case "$_arg" in
    # Accepted and ignored for backwards compatibility. This used to skip
    # downloading CDN wheels and patching pyodide-lock.json; that step is gone
    # because the Pyodide distribution is now vendored at build time.
    --no-extras)
      echo "[WARN]  --no-extras is obsolete and has no effect; remove it from package.json"
      ;;
    *) POSITIONAL_ARGS+=("$_arg") ;;
  esac
done
set -- "${POSITIONAL_ARGS[@]+"${POSITIONAL_ARGS[@]}"}"

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

_resolve_against_init_cwd() {
  local path="$1"
  local base="${INIT_CWD:-$(pwd)}"
  case "$path" in
    /*) printf '%s' "$path" ;;
    *)  printf '%s/%s' "$base" "$path" ;;
  esac
}

BUILD_DIR="$(_resolve_against_init_cwd "${2:-builds}")"
mkdir -p "$BUILD_DIR"
BUILD_DIR="$(cd "$BUILD_DIR" && pwd)"

VENV_DIR="$BUILD_DIR/.venv"
OUTPUT_DIR="$BUILD_DIR/pypi"

export BUILD_DIR   # setup-env.sh reads this

# ── Colours / helpers (available before setup-env.sh) ────────────────────────
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()    { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

# ── Source shared environment (creates/reuses the venv) ─────────────────────
# shellcheck disable=SC1091
source "${SCRIPT_DIR}/setup-env.sh"

# ── JupyterLite-specific setup ──────────────────────────────────────────────
CONFIG_FILE="$SRC_DIR/jupyter_lite_config.json"
REQUIREMENTS_FILE="$SRC_DIR/requirements.txt"
VENV_JUPYTER_LITE="$VENV_DIR/bin/jupyter-lite"
PYPI="$OUTPUT_DIR"   # wheels built by build-gen3sdk-lite land here

[[ -f "$REQUIREMENTS_FILE" ]] || fail "Missing requirements file: $REQUIREMENTS_FILE"
[[ -f "$CONFIG_FILE" ]]       || fail "Missing config file: $CONFIG_FILE"

# For the free tier, skip reinstalling requirements when jupyter-lite is already
# present to preserve exact package versions set up by build-gen3sdk-lite.sh.
# For the remote tier, always install because its requirements.txt includes
# jupyterlite-remote-server which the free-tier build never installs.
#
if [[ "$TIER" == "free" && -x "$VENV_JUPYTER_LITE" ]]; then
  info "Existing venv already has jupyter-lite — skipping requirements install"
else
  info "Installing JupyterLite requirements …"
  uv pip install --verbose -r "$REQUIREMENTS_FILE" 2>&1 | tail -5
  success "JupyterLite requirements installed"
fi

[[ -x "$VENV_JUPYTER_LITE" ]] || \
  fail "jupyter-lite executable not found in $VENV_DIR after dependency install."

# ── Collect our own wheels for PipliteAddon ─────────────────────────────────
# With PyodideLockAddon disabled these flags are the ONLY route by which our
# wheels reach the browser. This only applies to the free tier
WHEEL_ARGS=()
WHEEL_COUNT=0
if [[ "$TIER" == "free" ]]; then
  if [[ -d "$PYPI" ]]; then
    info "Looking for wheels in $PYPI"
    while IFS= read -r -d '' whl; do
      WHEEL_ARGS+=(--piplite-wheels "$whl")
      ((WHEEL_COUNT++)) || true
    done < <(find "$PYPI" -maxdepth 1 -name "*.whl" -print0 | sort -z)
  fi

  if (( WHEEL_COUNT == 0 )); then
    fail "No wheels found in $PYPI — run build-gen3sdk-lite.sh first."
  fi
else
  info "Skipping custom wheel collection for $TIER tier"
fi

# ── Build ───────────────────────────────────────────────────────────────────
info "Running: jupyter-lite build ($TIER tier, ${WHEEL_COUNT} custom wheels)"
"$VENV_JUPYTER_LITE" build \
  --config "$CONFIG_FILE" \
  --lite-dir "$SRC_DIR" \
  --output-dir "$BUILD_DIR/$TIER" \
  ${WHEEL_ARGS[@]+"${WHEEL_ARGS[@]}"}

# ── Verify the site is self-contained ───────────────────────────────────────
# The whole point of vendoring the distribution is that nothing is fetched from
# a CDN at runtime. Check it here rather than discovering it as a browser hang.
LOCK_FILE="$BUILD_DIR/$TIER/static/pyodide/pyodide-lock.json"
if [[ -f "$LOCK_FILE" ]]; then
  REMOTE_COUNT="$(python3 - "$LOCK_FILE" <<'PYEOF'
import json, sys
lock = json.load(open(sys.argv[1]))
remote = [
    m.get("file_name", "")
    for m in lock.get("packages", {}).values()
    if "://" in m.get("file_name", "")
]
print(len(remote))
for r in remote[:10]:
    print(f"  {r}", file=sys.stderr)
PYEOF
)"
  if [[ "$REMOTE_COUNT" != "0" ]]; then
    warn "$REMOTE_COUNT package(s) in pyodide-lock.json point at a remote host;"
    warn "  the browser will fetch these at runtime (see the sample above)."
  else
    success "pyodide-lock.json is fully local ($(ls -1 "$BUILD_DIR/$TIER/static/pyodide"/*.whl 2>/dev/null | wc -l | tr -d ' ') wheels)"
  fi
else
  warn "No pyodide-lock.json at $LOCK_FILE — is PyodideAddon.pyodide_url set?"
fi

PIPLITE_DIR="$BUILD_DIR/$TIER/static/pypi"
if [[ -d "$PIPLITE_DIR" ]]; then
  success "piplite index: $(ls -1 "$PIPLITE_DIR"/*.whl 2>/dev/null | wc -l | tr -d ' ') wheels"
else
  warn "No piplite index at $PIPLITE_DIR — our wheels did not reach the site."
fi

success "$TIER-tier JupyterLite build complete: $BUILD_DIR/$TIER"
