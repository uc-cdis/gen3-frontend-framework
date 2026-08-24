#!/usr/bin/env bash
# =============================================================================
# build.sh — Build Gen3 SDK and dependencies as WASM wheels for JupyterLite
#
# Prerequisites:
#   - uv  (https://docs.astral.sh/uv/getting-started/installation/)
#   - git
#   - cmake, make, and a C compiler (for emsdk bootstrap)
#
# Usage:
#   ./build.sh            # full build (setup + all packages)
#   ./build.sh --setup    # environment setup only (Python, emsdk)
#   ./build.sh --build    # build wheels only (assumes setup is done)
#   ./build.sh --clean    # remove cloned repos, build artifacts, and output
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── Configuration ────────────────────────────────────────────────────────────
PYTHON_VERSION="3.13.1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$ROOT_DIR/free-private"
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3)}"
BUILD_DIR="${2:-$SRC_DIR/build}"
VENV_DIR="$BUILD_DIR/.venv"
WORK_DIR="${BUILD_DIR}/work"
EMSDK_DIR="${BUILD_DIR}/emsdk"
SOURCES_DIR="${BUILD_DIR}/sources"
OUTPUT_DIR="${BUILD_DIR}/pypi"
LOG_DIR="${BUILD_DIR}/logs"

# Repositories to build (order matters — independent packages first)
# Format: "name|git_url|subdir"  (subdir is optional — omit for repo root)
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
)

# ── Helpers ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fail()    { echo -e "${RED}[FAIL]${NC}  $*"; exit 1; }

elapsed() {
  local t=$1
  printf '%dm%ds' $((t/60)) $((t%60))
}

# ── Step 1: Environment setup ───────────────────────────────────────────────
setup_environment() {
  info "Setting up build environment …"
  mkdir -p "${WORK_DIR}" "${SOURCES_DIR}" "${OUTPUT_DIR}" "${LOG_DIR}"

  # ---- uv ------------------------------------------------------------
  if ! command -v uv &>/dev/null; then
    fail "uv is not installed. Install it first: https://docs.astral.sh/uv/getting-started/installation/"
  fi
  success "uv found: $(uv --version)"

  # ---- Python via uv -------------------------------------------------
  info "Ensuring Python ${PYTHON_VERSION} is available via uv …"
  uv python install "${PYTHON_VERSION}" 2>&1 | tail -1
  success "Python ${PYTHON_VERSION} ready"

  # ---- Virtual environment -------------------------------------------
  if [[ ! -d "${VENV_DIR}" ]]; then
    info "Creating virtual environment at ${VENV_DIR} …"
    uv venv --python "${PYTHON_VERSION}" "${VENV_DIR}"
  fi
  # shellcheck disable=SC1091
  source "${VENV_DIR}/bin/activate"
  success "Activated venv ($(python --version))"

  # ---- Python build tools --------------------------------------------
  info "Installing Python build tooling …"
  uv pip install build pyodide-build 2>&1 | tail -3
  success "pyodide-build $(pyodide --version 2>/dev/null || echo '(installed)')"

  # ---- Emscripten SDK ------------------------------------------------
  setup_emsdk
}

setup_emsdk() {
  info "Setting up Emscripten SDK …"

  if [[ ! -d "${EMSDK_DIR}" ]]; then
    git clone https://github.com/emscripten-core/emsdk.git "${EMSDK_DIR}"
  fi

  local em_version
  em_version="$(pyodide config get emscripten_version)"
  info "Pyodide requires Emscripten ${em_version}"

  pushd "${EMSDK_DIR}" > /dev/null
  ./emsdk install "${em_version}"
  ./emsdk activate "${em_version}"
  # shellcheck disable=SC1091
  source emsdk_env.sh
  popd > /dev/null

  success "Emscripten $(emcc --version | head -1) activated"
}

# ── Step 2: Clone / update sources ──────────────────────────────────────────
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

# ── Step 3: Build WASM wheels ───────────────────────────────────────────────
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

  # gen3users uses the old poetry.masonry.api build backend path; poetry-core>=2.x
  # moved it to poetry.core.masonry.api.
  local gen3users_pyproject="${SOURCES_DIR}/gen3users/pyproject.toml"
  if [[ -f "${gen3users_pyproject}" ]]; then
    sed -i '' 's|build-backend = "poetry.masonry.api"|build-backend = "poetry.core.masonry.api"|' "${gen3users_pyproject}"
    info "Patched gen3users: build-backend updated to poetry.core.masonry.api"
  fi

  # gen3sdk-python pins indexclient ^2.3.0 (<3.0.0) but we build indexclient >=3.0.0;
  # relax the upper bound so the resolver accepts our wheel.
  local gen3sdk_pyproject="${SOURCES_DIR}/gen3sdk-python/pyproject.toml"
  if [[ -f "${gen3sdk_pyproject}" ]]; then
    sed -i '' 's/indexclient = "\^2\.3\.0"/indexclient = ">=2.3.0"/' "${gen3sdk_pyproject}"
    info "Patched gen3sdk-python: indexclient constraint relaxed to >=2.3.0"
  fi

  # dictionaryutils pins jsonschema <=4.23.0 but Pyodide only provides newer 4.x;
  # RefResolver is deprecated but still present through at least 4.26.0.
  local dictionaryutils_pyproject="${SOURCES_DIR}/dictionaryutils/pyproject.toml"
  if [[ -f "${dictionaryutils_pyproject}" ]]; then
    sed -i '' 's/jsonschema = "<=4\.23\.0"/jsonschema = ">=4.0.0"/' "${dictionaryutils_pyproject}"
    info "Patched dictionaryutils: jsonschema constraint relaxed to >=4.0.0"
  fi

  # psqlgraph: (1) pins sqlalchemy~=1.4 (<2) but Pyodide only has sqlalchemy>=2,
  # (2) build-requires versionista which is not on PyPI,
  # (3) uses versionista setuptools_scm schemes which are unavailable without it.
  local psqlgraph_pyproject="${SOURCES_DIR}/psqlgraph/pyproject.toml"
  if [[ -f "${psqlgraph_pyproject}" ]]; then
    sed -i '' 's/"sqlalchemy~=1\.4"/"sqlalchemy>=1.4"/' "${psqlgraph_pyproject}"
    sed -i '' 's/, "versionista>=1\.1\.0"//' "${psqlgraph_pyproject}"
    sed -i '' 's/local_scheme = "versionista-local-format"/local_scheme = "no-local-version"/' "${psqlgraph_pyproject}"
    sed -i '' 's/version_scheme = "versionista-format"/version_scheme = "guess-next-dev"/' "${psqlgraph_pyproject}"
    # psycopg2 and xlocal have no Pyodide wheels; PostgreSQL connections are
    # impossible in WASM so both can be dropped as runtime deps.
    sed -i '' '/"psycopg2"/d' "${psqlgraph_pyproject}"
    sed -i '' '/"xlocal"/d' "${psqlgraph_pyproject}"
    info "Patched psqlgraph: sqlalchemy >=1.4, removed versionista + psycopg2 + xlocal"

    # xlocal is imported at module level in psql.py; replace with a minimal stub
    # so psqlgraph is importable in Pyodide even without a real PostgreSQL driver.
    local psql_py="${SOURCES_DIR}/psqlgraph/src/psqlgraph/psql.py"
    if [[ -f "${psql_py}" ]]; then
      python3 - "${psql_py}" <<'PYEOF'
import sys, re

path = sys.argv[1]
text = open(path).read()
stub = '''\
try:
    import xlocal
except ImportError:
    class _XLocalInst:
        class _Ctx:
            def __init__(self, parent, **kw):
                self._parent, self._kw = parent, kw
            def __enter__(self):
                for k, v in self._kw.items():
                    setattr(self._parent, k, v)
                return self._parent
            def __exit__(self, *a):
                for k in self._kw:
                    self._parent.__dict__.pop(k, None)
        def __call__(self, **kw):
            return self._Ctx(self, **kw)
    class _xlocal_module:
        xlocal = _XLocalInst
    xlocal = _xlocal_module()'''
text = re.sub(r'^import xlocal$', stub, text, flags=re.MULTILINE)
open(path, 'w').write(text)
PYEOF
      info "Patched psqlgraph/psql.py: xlocal import wrapped in try/except stub"
    fi
  fi

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

    if (cd "${build_dir}" && pyodide build) > "${logfile}" 2>&1; then
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

  # ── Collect wheels into dist/ ──────────────────────────────────────────
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

  # ── Normalise platform tags ────────────────────────────────────────────
  # pyodide-build 0.39+ tags compiled wheels pyemscripten_<abi>_wasm32 but
  # jupyterlite-pyodide-kernel validates custom wheels against the lockfile's
  # info.platform (emscripten_<version>_wasm32).  Both names refer to the same
  # binary; rename so the validator accepts them.
  for whl in "${OUTPUT_DIR}"/*p313-cp313-pyemscripten_2025_0_wasm32.whl; do
    [[ -f "${whl}" ]] || continue
    new_whl="${whl/p313-cp313-pyemscripten_2025_0_wasm32/py3-none-any}"
    mv "${whl}" "${new_whl}"
    info "Renamed $(basename "${whl}") → $(basename "${new_whl}")"
  done

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

# ── Step 4: Clean ───────────────────────────────────────────────────────────
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
      clone_repos
      build_wheels
      ;;
    --clean)
      clean
      ;;
    --help|-h)
      echo "Usage: $0 [--setup | --build | --clean | --help]"
      echo ""
      echo "  (no flag)   Full run: setup environment, clone repos, build wheels"
      echo "  --setup     Set up Python ${PYTHON_VERSION}, venv, pyodide-build, and emsdk"
      echo "  --build     Clone/update repos and build WASM wheels (requires prior --setup)"
      echo "  --clean     Remove work/, dist/, and logs/"
      echo "  --help      Show this message"
      ;;
    *)
      setup_environment
      clone_repos
      build_wheels
      ;;
  esac
}

main "$@"
