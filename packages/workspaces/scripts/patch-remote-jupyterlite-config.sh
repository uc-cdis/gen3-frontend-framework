#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Patch the remote jupyter-lite.json to enable terminals and expose the app.

Inserts "terminalsAvailable": true and "exposeAppInBrowser": true into the
"jupyter-config-data" object. The latter is required so that RemoteComputeWorkspace
can find `window.jupyterapp` in the iframe to detect readiness and wire up
activity-detection listeners for the session's inactivity timer.
The file is modified in place; a backup is written alongside it as .bak.

Usage:
  bash scripts/patch-remote-jupyterlite-config.sh --remote-dir <path>

Options:
  --remote-dir <path>   Path to the remote JupyterLite build directory
                        (must contain jupyter-lite.json)
  -h, --help            Show this help message
EOF
}

REMOTE_DIR=""

while [[ $# -gt 0 ]]; do
  case "$1" in
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

if [[ -z "$REMOTE_DIR" ]]; then
  echo "Error: --remote-dir is required."
  usage
  exit 1
fi

REMOTE_JSON="$REMOTE_DIR/jupyter-lite.json"

if [[ ! -f "$REMOTE_JSON" ]]; then
  echo "Error: file not found: $REMOTE_JSON"
  exit 1
fi

python3 - <<'PY' "$REMOTE_JSON"
import json
import sys
import shutil

path = sys.argv[1]
backup = path + ".bak"

with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

config = data.get('jupyter-config-data')
if not isinstance(config, dict):
    print(f"Error: 'jupyter-config-data' key not found or not an object in {path}", file=sys.stderr)
    sys.exit(1)

needs_patch = (
    config.get('terminalsAvailable') is not True
    or config.get('exposeAppInBrowser') is not True
)
if not needs_patch:
    print(f"'terminalsAvailable' and 'exposeAppInBrowser' already set to true in {path} — no changes made.")
    sys.exit(0)

shutil.copy2(path, backup)

config['terminalsAvailable'] = True
config['exposeAppInBrowser'] = True

with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
    f.write('\n')

print(f"Patched: {path}")
print(f"Backup:  {backup}")
PY
