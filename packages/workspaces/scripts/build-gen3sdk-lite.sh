#!/usr/bin/env bash
# =============================================================================
# build-gen3sdk-lite.sh — Build Gen3 SDK and dependencies as WASM wheels
#
# Prerequisites:
#   - uv  (https://docs.astral.sh/uv/getting-started/installation/)
#   - git
#   - cmake, make, and a C compiler (for emsdk bootstrap)
#
# Usage:
#   ./build-gen3sdk-lite.sh            # full build (setup + all packages)
#   ./build-gen3sdk-lite.sh --setup    # environment setup only
#   ./build-gen3sdk-lite.sh --build    # build wheels only (assumes setup done)
#   ./build-gen3sdk-lite.sh --clean    # remove cloned repos, build artifacts
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
EMSDK_DIR="$BUILD_DIR/emsdk"
SOURCES_DIR="$BUILD_DIR/sources"
OUTPUT_DIR="$BUILD_DIR/pypi"
LOG_DIR="$BUILD_DIR/logs"

export BUILD_DIR   # setup-env.sh reads this

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

# ── Source shared environment (venv + Python + core tooling) ─────────────────
source_shared_env() {
  # shellcheck disable=SC1091
  source "${SCRIPT_DIR}/setup-env.sh"
}

## ── Emscripten SDK ───────────────────────────────────────────────────────────
#setup_emsdk() {
#  info "Setting up Emscripten SDK …"
#
#  if [[ ! -d "${EMSDK_DIR}" ]]; then
#    git clone https://github.com/emscripten-core/emsdk.git "${EMSDK_DIR}"
#  fi
#
#  local em_version
#  em_version="$(pyodide config get emscripten_version)"
#  info "Pyodide requires Emscripten ${em_version}"
#
#  pushd "${EMSDK_DIR}" > /dev/null
#  ./emsdk install "${em_version}"
#  ./emsdk activate "${em_version}"
#  # shellcheck disable=SC1091
#  source emsdk_env.sh
#  popd > /dev/null
#
#  success "Emscripten $(emcc --version | head -1) activated"
#}

# ── Full environment setup ───────────────────────────────────────────────────
setup_environment() {
  source_shared_env
  mkdir -p "${WORK_DIR}" "${SOURCES_DIR}" "${OUTPUT_DIR}" "${LOG_DIR}"

  # WASM-specific tooling (on top of the shared base)
  info "Installing pyodide-build …"
  uv pip install pyodide-build 2>&1 | tail -3
  success "pyodide-build $(pyodide --version 2>/dev/null || echo '(installed)')"
}

# ── Clone / update sources ──────────────────────────────────────────────────
clone_repos() {
  info "Cloning / updating repositories …"
  for entry in "${REPOS[@]}"; do
    IFS='|' read -r name url _subdir <<< "${entry}"
    local dest="${SOURCES_DIR}/${name}"
    if [[ -d "${dest}/.git" ]]; then
      info "  ${name}: pulling latest …"
      git -C "${dest}" pull --ff-only 2>&1 | tail -1
    else
      info "  ${name}: cloning …"
      git clone "${url}" "${dest}" 2>&1 | tail -1
    fi
  done
  success "All repositories ready"
}

# ── Build WASM wheels ───────────────────────────────────────────────────────
build_wheels() {
  # Make sure emsdk env is active in this shell
  if [[ -f "${EMSDK_DIR}/emsdk_env.sh" ]]; then
    # shellcheck disable=SC1091
    source "${EMSDK_DIR}/emsdk_env.sh" 2>/dev/null
  fi
  # shellcheck disable=SC1091
  source "${VENV_DIR}/bin/activate"

  local total=${#REPOS[@]}
  local built=0
  local failed=0
  local failed_names=()

  # ── Source patches ─────────────────────────────────────────────────────

  # gen3users: old poetry.masonry.api → poetry.core.masonry.api
  local gen3users_pyproject="${SOURCES_DIR}/gen3users/pyproject.toml"
  if [[ -f "${gen3users_pyproject}" ]]; then
    sed -i '' 's|build-backend = "poetry.masonry.api"|build-backend = "poetry.core.masonry.api"|' "${gen3users_pyproject}"
    info "Patched gen3users: build-backend updated to poetry.core.masonry.api"
  fi

  # gen3sdk-python: relax indexclient pin
  local gen3sdk_pyproject="${SOURCES_DIR}/gen3sdk-python/pyproject.toml"
  if [[ -f "${gen3sdk_pyproject}" ]]; then
    sed -i '' 's/indexclient = "\^2\.3\.0"/indexclient = ">=2.3.0"/' "${gen3sdk_pyproject}"
    info "Patched gen3sdk-python: indexclient constraint relaxed to >=2.3.0"
  fi

  # dictionaryutils: relax jsonschema pin
  local dictionaryutils_pyproject="${SOURCES_DIR}/dictionaryutils/pyproject.toml"
  if [[ -f "${dictionaryutils_pyproject}" ]]; then
    sed -i '' 's/jsonschema = "<=4\.23\.0"/jsonschema = ">=4.0.0"/' "${dictionaryutils_pyproject}"
    info "Patched dictionaryutils: jsonschema constraint relaxed to >=4.0.0"
  fi

  # dictionaryutils: defer metaschema YAML load to non-lazy path
  # With lazy=True, DataDictionary.__init__ still called load_yaml(metaschema.yaml),
  # triggering PyYAML's WASM C extension on first use in a synchronous context.
  # In Pyodide this blocks the WASM thread indefinitely. Skip it when lazy=True.
  local dictionaryutils_init="${SOURCES_DIR}/dictionaryutils/dictionaryutils/__init__.py"
  if [[ -f "${dictionaryutils_init}" ]]; then
    python3 - "${dictionaryutils_init}" <<'PYEOF'
import sys
path = sys.argv[1]
text = open(path).read()
OLD = (
    "        self.metaschema = load_yaml(\n"
    "            os.path.join(MOD_DIR, \"schemas\", self.metaschema_path)\n"
    "        )\n"
    "\n"
    "        if not lazy:\n"
    "            self.load_data(directory=self.root_dir, url=url, local_file=local_file)\n"
    "        self.allow_nulls()"
)
NEW = (
    "        if not lazy:\n"
    "            self.metaschema = load_yaml(\n"
    "                os.path.join(MOD_DIR, \"schemas\", self.metaschema_path)\n"
    "            )\n"
    "            self.load_data(directory=self.root_dir, url=url, local_file=local_file)\n"
    "        else:\n"
    "            self.metaschema = None\n"
    "        self.allow_nulls()"
)
if OLD in text:
    open(path, 'w').write(text.replace(OLD, NEW))
    print("Patched dictionaryutils: metaschema load deferred to non-lazy path")
else:
    print("WARN: dictionaryutils lazy patch pattern not found — skipping")
PYEOF
  fi

  # gen3dictionary: defer schema loading to avoid WASM hang
  # GDCDictionary is instantiated at module import time with lazy=False (the
  # default). In Pyodide the synchronous schema resolution blocks the WASM
  # thread indefinitely. Patching to lazy=True defers loading until first use.
  local gen3dictionary_init="${SOURCES_DIR}/gen3dictionary/gdcdictionary/__init__.py"
  if [[ -f "${gen3dictionary_init}" ]]; then
    sed -i '' 's/gdcdictionary = GDCDictionary(root_dir=SCHEMA_DIR)/gdcdictionary = GDCDictionary(root_dir=SCHEMA_DIR, lazy=True)/' "${gen3dictionary_init}"
    info "Patched gen3dictionary: GDCDictionary instantiated with lazy=True"
  fi

  # ── Build loop ─────────────────────────────────────────────────────────
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

    # fastavro has Python fallbacks for all C extensions; build pure-Python so
    # micropip/piplite accepts the wheel regardless of the Pyodide platform tag.
    # pip wheel (not pyodide build) avoids the pyemscripten stamp, but still
    # produces a platform-specific wheel on macOS, so retag to py3-none-any and
    # patch Root-Is-Purelib so micropip treats it as a pure-Python wheel.

    local build_cmd='pip wheel . --no-deps -w dist/ \
      && python -m wheel tags --python-tag py3 --abi-tag none --platform-tag any --remove dist/*.whl'
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

  info "Verifying all wheels are pure-Python …"
  bad=()
  for whl in "${OUTPUT_DIR}"/*.whl; do
    [[ -f "$whl" ]] || continue
    [[ "$(basename "$whl")" == *-py3-none-any.whl ]] || bad+=("$(basename "$whl")")
  done
  if (( ${#bad[@]} )); then
    for b in "${bad[@]}"; do warn "  not pure-Python: $b"; done
    fail "${#bad[@]} wheel(s) carry a platform tag and will not load in the browser"
  fi

  # ── Download pure-Python deps missing from the Pyodide lock ────────────
  if [[ "${NO_EXTRAS}" == "true" ]]; then
    info "Skipping pure-Python extras download (--no-extras)"
  else
  # These are gen3 dependencies that aren't in the Pyodide distribution and
  # aren't built from source above. Without them, micropip falls back to PyPI
  # inside the browser
  # Versions pinned to satisfy gen3's constraints where applicable.
  PURE_PYTHON_DEPS=(
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
  info "Downloading pure-Python deps missing from Pyodide lock …"
  for dep in "${PURE_PYTHON_DEPS[@]}"; do
    if compgen -G "${OUTPUT_DIR}/${dep//-/_}-*.whl" > /dev/null 2>&1 || \
       compgen -G "${OUTPUT_DIR}/${dep}-*.whl" > /dev/null 2>&1; then
      info "  ${dep}: already present, skipping"
      continue
    fi
    if pip download "${dep}" \
        --no-deps \
        --only-binary=:all: \
        --python-version 313 \
        --platform any \
        -d "${OUTPUT_DIR}" \
        --quiet 2>/dev/null; then
      info "  ${dep}: downloaded"
    else
      warn "  ${dep}: download failed — import gen3 may hang in browser"
    fi
  done
  fi  # end NO_EXTRAS check

  # ── Summary ────────────────────────────────────────────────────────────
  echo ""
  echo "========================================="
  echo "  Build Summary"
  echo "========================================="
  echo "  Succeeded : ${built}"
  echo "  Failed    : ${failed}"
  echo "  Wheels    : ${count} file(s) in ${OUTPUT_DIR}/"
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

# ── Clean ────────────────────────────────────────────────────────────────────
clean() {
  info "Cleaning build artifacts …"
  rm -rf "${WORK_DIR}" "${OUTPUT_DIR}" "${LOG_DIR}"
  success "Clean complete"
}

# ── Main ─────────────────────────────────────────────────────────────────────
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
      echo "  --setup      Set up Python, venv, pyodide-build, and emsdk"
      echo "  --build      Clone/update repos and build WASM wheels (requires prior --setup)"
      echo "  --clean      Remove work/, dist/, and logs/"
      echo "  --help       Show this message"
      echo ""
      echo "  --no-extras  Skip downloading pure-Python deps (aiofiles, backoff, etc.)"
      echo "               Use when gen3 SDK wheel support is not needed"
      ;;
    *)
      setup_environment
      clone_repos
      build_wheels
      ;;
  esac
}

main "$@"
