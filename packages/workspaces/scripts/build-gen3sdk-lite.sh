#!/usr/bin/env bash
# =============================================================================
# build-gen3sdk-lite.sh — Build Gen3 SDK and dependencies as pure-Python wheels
#
# All packages in REPOS are pure Python (fastavro has Python fallbacks for its
# C extensions). They are therefore built with `pip wheel` and retagged to
# py3-none-any, which loads under any Pyodide/Python version. This replaces the
# previous `pyodide build` + emsdk approach, which downloaded ~1 GB of
# toolchain, took several minutes, and produced wheels that were then renamed
# to py3-none-any anyway.
#
# If a package with genuine C extensions is added to REPOS, the pure-Python
# assertion below will fail the build rather than silently shipping a wheel
# that cannot load in the browser.
#
# Prerequisites:
#   - uv  (https://docs.astral.sh/uv/getting-started/installation/)
#   - git
#
# Usage:
#   ./build-gen3sdk-lite.sh            # full build (setup + all packages)
#   ./build-gen3sdk-lite.sh --setup    # environment setup only
#   ./build-gen3sdk-lite.sh --build    # build wheels only (assumes setup done)
#   ./build-gen3sdk-lite.sh --clean    # remove build artifacts
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Parse flags (strip before positional args are consumed) ──────────────────
NO_EXTRAS=false
POSITIONAL_ARGS=()
for _arg in "$@"; do
  case "$_arg" in
    --no-extras) NO_EXTRAS=true ;;
    *)           POSITIONAL_ARGS+=("$_arg") ;;
  esac
done
set -- "${POSITIONAL_ARGS[@]+"${POSITIONAL_ARGS[@]}"}"

# ── Path constants (always defined, no external dependency) ──────────────────
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SRC_DIR="$ROOT_DIR/free-private"
BUILD_DIR="${2:-$(pwd)/builds}"
mkdir -p "$BUILD_DIR"
BUILD_DIR="$(cd "$BUILD_DIR" && pwd)"

VENV_DIR="$BUILD_DIR/.venv"
WORK_DIR="$BUILD_DIR/work"
SOURCES_DIR="$BUILD_DIR/sources"
OUTPUT_DIR="$BUILD_DIR/pypi"
LOG_DIR="$BUILD_DIR/logs"

export BUILD_DIR   # setup-env.sh reads this

# Browser Python version, used for `pip download` of pure-Python extras.
# Must match jupyterlite_pyodide_kernel.constants.PYODIDE_PYTHON_VERSION.
# Check with:
#   python -c "from jupyterlite_pyodide_kernel.constants import \
#     PYODIDE_PYTHON_VERSION; print(PYODIDE_PYTHON_VERSION)"
BROWSER_PYTHON_TAG="${BROWSER_PYTHON_TAG:-314}"

# ── Colours / helpers (available immediately, before setup-env.sh) ───────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()    { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

elapsed() {
  local t=$1
  printf '%dm%ds' $((t/60)) $((t%60))
}

# Portable in-place sed. GNU sed reads `-i ''` as the script and the following
# expression as a filename; BSD/macOS sed requires the empty suffix. Detect once.
if sed --version >/dev/null 2>&1; then
  sedi() { sed -i "$@"; }          # GNU
else
  sedi() { sed -i '' "$@"; }       # BSD / macOS
fi

# Apply a sed substitution and fail loudly if it changed nothing. `sed` exits 0
# on a non-match, which previously let stale patterns pass as "Patched …".
patch_file() {
  local desc="$1" expr="$2" path="$3"
  [[ -f "$path" ]] || { warn "${desc}: file not found, skipping (${path})"; return 0; }
  local before after
  before="$(cat "$path")"
  sedi "$expr" "$path"
  after="$(cat "$path")"
  if [[ "$before" == "$after" ]]; then
    warn "${desc}: pattern did not match — upstream may have changed"
    return 0
  fi
  info "${desc}"
}

# ── Repositories to build (order matters — independent packages first) ───────
# Format: "name|git_url|subdir"  (subdir is optional)
REPOS=(
  "cdislogging|https://github.com/uc-cdis/cdislogging.git"
  "python-json-logger|https://github.com/nhairs/python-json-logger.git"
  "fastavro|https://github.com/fastavro/fastavro.git"
  "drsclient|https://github.com/uc-cdis/drsclient.git"
  "indexd|https://github.com/uc-cdis/indexd.git|indexclient"
  "dictionaryutils|https://github.com/uc-cdis/dictionaryutils.git"
  "pypfb|https://github.com/uc-cdis/pypfb.git"
  "gen3sdk-python|https://github.com/uc-cdis/gen3sdk-python.git"
  "gen3users|git@github.com:uc-cdis/gen3users.git"
  "gen3dictionary|https://github.com/uc-cdis/datadictionary.git"
)

# ── Source shared environment (venv + Python + core tooling) ────────────────
source_shared_env() {
  # shellcheck disable=SC1091
  source "${SCRIPT_DIR}/setup-env.sh"
}

# ── Environment setup ───────────────────────────────────────────────────────
setup_environment() {
  source_shared_env
  mkdir -p "${WORK_DIR}" "${SOURCES_DIR}" "${OUTPUT_DIR}" "${LOG_DIR}"

  # `wheel` provides `python -m wheel tags`, used to retag to py3-none-any.
  info "Installing wheel …"
  uv pip install wheel 2>&1 | tail -2
  success "Build tooling ready"
}

# ── Clone / update sources ──────────────────────────────────────────────────
clone_repos() {
  info "Cloning / updating repositories …"
  for entry in "${REPOS[@]}"; do
    IFS='|' read -r name url _subdir <<< "${entry}"
    local dest="${SOURCES_DIR}/${name}"
    if [[ -d "${dest}/.git" ]]; then
      # Sources are patched in place below, so a pull would conflict. Reset to
      # a clean tree first, otherwise the pull fails silently through the pipe.
      info "  ${name}: resetting and pulling latest …"
      git -C "${dest}" checkout -- . 2>&1 | tail -1 || true
      git -C "${dest}" pull --ff-only 2>&1 | tail -1
    else
      info "  ${name}: cloning …"
      git clone "${url}" "${dest}" 2>&1 | tail -1
    fi
  done
  success "All repositories ready"
}

# ── Source patches ──────────────────────────────────────────────────────────
apply_patches() {
  # gen3users: old poetry.masonry.api → poetry.core.masonry.api
  patch_file "Patched gen3users: build-backend updated to poetry.core.masonry.api" \
    's|build-backend = "poetry.masonry.api"|build-backend = "poetry.core.masonry.api"|' \
    "${SOURCES_DIR}/gen3users/pyproject.toml"

  # gen3sdk-python: relax indexclient pin so the locally built 6.3.0 satisfies it
  patch_file "Patched gen3sdk-python: indexclient constraint relaxed to >=2.3.0" \
    's/indexclient = "\^2\.3\.0"/indexclient = ">=2.3.0"/' \
    "${SOURCES_DIR}/gen3sdk-python/pyproject.toml"

  # dictionaryutils: relax the jsonschema pin.
  #
  # NOTE: upstream pins jsonschema<=4.23.0 deliberately — "limiting to a version
  # where RefResolver is deprecated but still functioning". Relaxing it resolves
  # jsonschema 4.26.0 in the browser, where RefResolver exists only as a
  # module-level __getattr__ shim forwarding to validators._RefResolver. It
  # imports and works today, but this is borrowed time. If dictionaryutils
  # starts failing on import, this patch is the first thing to revert.
  patch_file "Patched dictionaryutils: jsonschema constraint relaxed to >=4.0.0" \
    's/jsonschema = "<=4\.23\.0"/jsonschema = ">=4.0.0"/' \
    "${SOURCES_DIR}/dictionaryutils/pyproject.toml"

  # REMOVED: the dictionaryutils metaschema deferral and the gen3dictionary
  # lazy=True patch. Both were added on the theory that eager YAML schema
  # loading blocked the WASM thread indefinitely. Measured, the eager load is
  # ~0.6s for 32 schemas / 256 KB — not a hang. The real cause was the browser
  # fetching the Pyodide distribution from cdn.jsdelivr.net; that is now fixed
  # by vendoring the distribution via PyodideAddon.pyodide_url.
  #
  # Do not reinstate them: lazy=True leaves gdcdictionary.schema == {} and
  # metaschema == None, so anything validating against the dictionary silently
  # sees an empty dictionary. A slow import is a better failure than a wrong one.

  # REMOVED: the psqlgraph patches. psqlgraph is not in REPOS, so they never
  # ran. Re-add them alongside a psqlgraph entry if it is ever needed.
}

# ── Build wheels ────────────────────────────────────────────────────────────
build_wheels() {
  # shellcheck disable=SC1091
  source "${VENV_DIR}/bin/activate"

  local total=${#REPOS[@]}
  local built=0
  local failed=0
  local failed_names=()

  apply_patches

  info "Building ${total} packages …"
  echo ""

  for entry in "${REPOS[@]}"; do
    IFS='|' read -r name _url subdir <<< "${entry}"
    local src="${SOURCES_DIR}/${name}"
    local build_dir="${src}"
    [[ -n "${subdir}" ]] && build_dir="${src}/${subdir}"
    local logfile="${LOG_DIR}/${name}.log"
    local start_ts
    start_ts=$(date +%s)

    local label="${name}"
    [[ -n "${subdir}" ]] && label="${name}/${subdir}"
    printf "  [%d/%d] %-25s " $((built + failed + 1)) "${total}" "${label}"

    # Build as a normal wheel, then force the py3-none-any tag. `pip wheel` can
    # emit a platform-specific tag on macOS even for pure Python; retagging
    # makes the result portable and loadable by micropip under any Pyodide ABI.
    local build_cmd='rm -rf dist && pip wheel . --no-deps -w dist/ \
      && python -m wheel tags --python-tag py3 --abi-tag none --platform-tag any --remove dist/*.whl'

    # fastavro ships Python fallbacks for every C extension; this env var
    # selects them so no compiler is needed and the wheel stays pure Python.
    [[ "${name}" == "fastavro" ]] && build_cmd="FASTAVRO_USE_PYTHON=1 ${build_cmd}"

    if (cd "${build_dir}" && eval "${build_cmd}") > "${logfile}" 2>&1; then
      local end_ts
      end_ts=$(date +%s)
      echo -e "${GREEN}OK${NC}  ($(elapsed $((end_ts - start_ts))))"
      ((built++))
    else
      local end_ts
      end_ts=$(date +%s)
      echo -e "${RED}FAILED${NC}  ($(elapsed $((end_ts - start_ts)))) — see ${logfile}"
      ((failed++))
      failed_names+=("${name}")
    fi
  done

  echo ""

  # ── Collect wheels ─────────────────────────────────────────────────────
  info "Collecting .whl files into ${OUTPUT_DIR} …"
  local count=0
  for entry in "${REPOS[@]}"; do
    IFS='|' read -r name _url subdir <<< "${entry}"
    local src="${SOURCES_DIR}/${name}"
    local build_dir="${src}"
    [[ -n "${subdir}" ]] && build_dir="${src}/${subdir}"
    if compgen -G "${build_dir}/dist/*.whl" > /dev/null 2>&1; then
      cp "${build_dir}"/dist/*.whl "${OUTPUT_DIR}/"
      ((count += $(ls -1 "${build_dir}"/dist/*.whl 2>/dev/null | wc -l)))
    fi
  done

  download_extras

  verify_pure_python

  # ── Summary ────────────────────────────────────────────────────────────
  echo ""
  echo "========================================="
  echo "  Build Summary"
  echo "========================================="
  echo "  Succeeded : ${built}"
  echo "  Failed    : ${failed}"
  echo "  Wheels    : ${count} built, $(ls -1 "${OUTPUT_DIR}"/*.whl 2>/dev/null | wc -l | tr -d ' ') total in ${OUTPUT_DIR}/"
  if (( failed > 0 )); then
    echo ""
    echo "  Failed packages:"
    for n in "${failed_names[@]}"; do
      echo "    - ${n}  (log: ${LOG_DIR}/${n}.log)"
    done
  fi
  echo "========================================="
  echo ""

  if (( failed > 0 )); then
    warn "Some packages failed. Check the logs above."
    return 1
  fi

  success "All wheels built and collected in ${OUTPUT_DIR}/"
  echo ""
  ls -lh "${OUTPUT_DIR}"/*.whl
}

# ── Pure-Python deps not present in the Pyodide distribution ────────────────
# PyodideLockAddon is disabled (it cannot resolve a vendored local distribution
# in jupyterlite-pyodide-kernel 0.8.5), so nothing resolves these for us. They
# reach the browser through PipliteAddon, which indexes everything in
# OUTPUT_DIR. Without them, micropip falls back to PyPI at runtime.
download_extras() {
  if [[ "${NO_EXTRAS}" == "true" ]]; then
    info "Skipping pure-Python extras download (--no-extras)"
    warn "  gen3's pure-Python deps will be fetched from PyPI in the browser"
    return 0
  fi

  local deps=(
    "aiofiles"
    "backoff"
    "dataclasses-json<=0.5.9"
    "humanfriendly"
    "importlib-metadata>=8,<9"
    "marshmallow>=3.3.0,<4.0.0"
    "marshmallow-enum"
    "mypy-extensions"
    "python-dateutil"
    "typing-inspect"
    "xmltodict>=0.13.0,<0.14.0"
    "zipp"
  )

  info "Downloading pure-Python deps missing from the Pyodide distribution …"
  local dep base
  for dep in "${deps[@]}"; do
    # Strip any version specifier to get the distribution name for the glob.
    base="${dep%%[<>=!~]*}"
    if compgen -G "${OUTPUT_DIR}/${base//-/_}-*.whl" > /dev/null 2>&1 || \
       compgen -G "${OUTPUT_DIR}/${base}-*.whl" > /dev/null 2>&1; then
      info "  ${base}: already present, skipping"
      continue
    fi
    if pip download "${dep}" \
        --no-deps \
        --only-binary=:all: \
        --python-version "${BROWSER_PYTHON_TAG}" \
        --platform any \
        -d "${OUTPUT_DIR}" \
        --quiet 2>/dev/null; then
      info "  ${base}: downloaded"
    else
      warn "  ${base}: download failed — will fall back to PyPI in the browser"
    fi
  done
}

# ── Verify every wheel is loadable in the browser ───────────────────────────
# Replaces the old hardcoded rename of *p313-cp313-pyemscripten_2025_0_wasm32.
# That pattern silently stopped matching when Pyodide moved to the 2026_0 ABI
# and Python 3.14, so mis-tagged wheels would have shipped unnoticed. A
# platform-tagged wheel cannot load under a different Pyodide ABI, so fail here
# instead of debugging it in a browser console.
verify_pure_python() {
  info "Verifying all wheels are pure-Python (py3-none-any) …"
  local bad=()
  local whl base
  for whl in "${OUTPUT_DIR}"/*.whl; do
    [[ -f "${whl}" ]] || continue
    base="$(basename "${whl}")"
    case "${base}" in
      *-py3-none-any.whl|*-py2.py3-none-any.whl) ;;
      *) bad+=("${base}") ;;
    esac
  done

  if (( ${#bad[@]} > 0 )); then
    for base in "${bad[@]}"; do
      warn "  not pure-Python: ${base}"
    done
    fail "${#bad[@]} wheel(s) carry a platform tag and cannot load in the browser.
       Either the package has real C extensions (it needs a Pyodide-ABI build
       matching the vendored distribution), or 'python -m wheel tags' did not
       run. Check ${LOG_DIR}/ for the corresponding build log."
  fi

  success "All $(ls -1 "${OUTPUT_DIR}"/*.whl 2>/dev/null | wc -l | tr -d ' ') wheels are pure-Python"
}

# ── Clean ───────────────────────────────────────────────────────────────────
clean() {
  info "Cleaning build artifacts …"
  rm -rf "${WORK_DIR}" "${OUTPUT_DIR}" "${LOG_DIR}"
  success "Clean complete"
}

# ── Main ────────────────────────────────────────────────────────────────────
main() {
  local mode="${1:-all}"

  case "${mode}" in
    --setup)
      setup_environment
      ;;
    --build)
      source_shared_env
      clone_repos
      build_wheels
      ;;
    --clean)
      clean
      ;;
    --help|-h)
      echo "Usage: $0 [--setup | --build | --clean | --help] [--no-extras] [build_dir]"
      echo ""
      echo "  (no flag)    Full run: setup environment, clone repos, build wheels"
      echo "  --setup      Set up Python venv and build tooling"
      echo "  --build      Clone/update repos and build wheels (requires prior --setup)"
      echo "  --clean      Remove work/, pypi/, and logs/"
      echo "  --help       Show this message"
      echo ""
      echo "  --no-extras  Skip downloading pure-Python deps (aiofiles, backoff, etc.)"
      echo "               Only safe if 'import gen3' is not needed"
      echo ""
      echo "Env:"
      echo "  BROWSER_PYTHON_TAG  Python version for extras download (default 314)"
      ;;
    *)
      setup_environment
      clone_repos
      build_wheels
      ;;
  esac
}

main "$@"
