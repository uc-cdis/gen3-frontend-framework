#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Validate that free/remote JupyterLite assets are not mixed.

Usage:
  bash scripts/validate-jupyterlite-assets.sh --free-dir <path> --remote-dir <path>

Rules:
  - free jupyter-lite.json must NOT include federated extension "jupyterlite-remote-server"
  - remote jupyter-lite.json must include federated extension "jupyterlite-remote-server"
EOF
}

FREE_DIR=""
REMOTE_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --free-dir)
      FREE_DIR="$2"
      shift 2
      ;;
    --remote-dir)
      REMOTE_DIR="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$FREE_DIR" || -z "$REMOTE_DIR" ]]; then
  echo "Both --free-dir and --remote-dir are required."
  usage
  exit 1
fi

FREE_JSON="$FREE_DIR/jupyter-lite.json"
REMOTE_JSON="$REMOTE_DIR/jupyter-lite.json"


echo "Free $FREE_DIR, Remote $REMOTE_DIR"

if [[ ! -f "$FREE_JSON" ]]; then
  echo "Missing free config: $FREE_JSON"
  exit 1
fi

if [[ ! -f "$REMOTE_JSON" ]]; then
  echo "Missing remote config: $REMOTE_JSON"
  exit 1
fi

HAS_FREE_REMOTE_EXT="$(python3 - <<'PY' "$FREE_JSON"
import json
import sys

path = sys.argv[1]
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

exts = data.get('jupyter-config-data', {}).get('federated_extensions', [])
has_remote = any(ext.get('name') == 'jupyterlite-remote-server' for ext in exts if isinstance(ext, dict))
print(1 if has_remote else 0)
PY
 )"

HAS_REMOTE_REMOTE_EXT="$(python3 - <<'PY' "$REMOTE_JSON"
import json
import sys

path = sys.argv[1]
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

exts = data.get('jupyter-config-data', {}).get('federated_extensions', [])
has_remote = any(ext.get('name') == 'jupyterlite-remote-server' for ext in exts if isinstance(ext, dict))
print(1 if has_remote else 0)
PY
 )"

if [[ "$HAS_FREE_REMOTE_EXT" -ne 0 ]]; then
  echo "Validation failed: free assets include jupyterlite-remote-server: $FREE_JSON"
  exit 1
fi

if [[ "$HAS_REMOTE_REMOTE_EXT" -ne 1 ]]; then
  echo "Validation failed: remote assets do not include jupyterlite-remote-server: $REMOTE_JSON"
  exit 1
fi

echo "JupyterLite asset validation passed."
echo "  free:   $FREE_JSON"
echo "  remote: $REMOTE_JSON"
