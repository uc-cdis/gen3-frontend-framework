#!/usr/bin/env bash
# =============================================================================
# setup-env.sh — Shared build-environment bootstrap
#
# Guarantees both build-gen3sdk-lite and build-jupyterlite use the same
# Python interpreter and virtual environment.
#
# The caller MUST set BUILD_DIR before sourcing this script.
#
# Usage (from another script):
#   export BUILD_DIR="/path/to/build"
#   source "$(dirname "${BASH_SOURCE[0]}")/setup-env.sh"
#
# After sourcing, the venv at $BUILD_DIR/.venv is activated in the calling
# shell, and VENV_DIR is exported.
# =============================================================================

# ── Configuration ────────────────────────────────────────────────────────────
PYTHON_VERSION="3.13.1"

if [[ -z "${BUILD_DIR:-}" ]]; then
  echo "[FATAL] BUILD_DIR must be set before sourcing setup-env.sh" >&2
  return 1 2>/dev/null || exit 1
fi

mkdir -p "$BUILD_DIR"
BUILD_DIR="$(cd "$BUILD_DIR" && pwd)"

VENV_DIR="$BUILD_DIR/.venv"
export BUILD_DIR VENV_DIR PYTHON_VERSION

# ── Colours / helpers ────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()    { echo -e "${RED}[FAIL]${NC}  $*"; return 1 2>/dev/null || exit 1; }

# Export helpers so functions in the calling script can use them.
export -f info success warn fail

# ── uv ───────────────────────────────────────────────────────────────────────
if ! command -v uv &>/dev/null; then
  fail "uv is not installed. Install it first: https://docs.astral.sh/uv/getting-started/installation/"
fi
success "uv found: $(uv --version)"

# ── Python (via uv) ─────────────────────────────────────────────────────────
info "Ensuring Python ${PYTHON_VERSION} is available via uv …"
uv python install "${PYTHON_VERSION}" 2>&1 | tail -1
success "Python ${PYTHON_VERSION} ready"

# ── Virtual environment (create once, reuse everywhere) ──────────────────────
if [[ ! -d "${VENV_DIR}" ]]; then
  info "Creating virtual environment at ${VENV_DIR} …"
  uv venv --python "${PYTHON_VERSION}" "${VENV_DIR}"
fi

# shellcheck disable=SC1091
source "${VENV_DIR}/bin/activate"
success "Activated venv ($(python --version))"

# ── Core Python tooling (idempotent — uv skips already-installed) ────────────
info "Ensuring core Python build tooling …"
uv pip install --upgrade pip build 2>&1 | tail -3
success "Core tooling ready"
