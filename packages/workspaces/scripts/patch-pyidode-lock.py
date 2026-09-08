#!/usr/bin/env python3
"""
Localize CDN wheels referenced by a JupyterLite pyodide-lock.json.

Replaces the inline heredoc in build-jupyterlite.sh. Two fixes over the
original:

  1. Writes ``file_name`` (the only field Pyodide reads) instead of ``url``,
     which is not part of the pyodide-lock schema and is silently ignored.
  2. Writes a bare filename. ``file_name`` is resolved relative to the
     directory holding pyodide-lock.json, which is where we download to,
     so no "../../static/..." prefix is needed.

Fails loudly if any CDN reference survives, so a no-op patch can never be
reported as success.

Usage:
    LOCK_FILE=... LOCK_OUT=... python3 patch-pyodide-lock.py
"""

import json
import os
import sys
import urllib.request

CDN_HOSTS = ("cdn.jsdelivr.net", "pypi.org", "files.pythonhosted.org")

lock_file = os.environ["LOCK_FILE"]
lock_out = os.environ["LOCK_OUT"]

with open(lock_file) as fh:
    lock = json.load(fh)

packages = lock.get("packages", {})
localized = 0
failed = []

for name, meta in packages.items():
    ref = meta.get("file_name", "")
    if not any(host in ref for host in CDN_HOSTS):
        continue

    fname = ref.split("/")[-1].split("?")[0]
    dest = os.path.join(lock_out, fname)

    if not os.path.exists(dest):
        try:
            urllib.request.urlretrieve(ref, dest)
            print(f"  downloaded {fname}", flush=True)
        except Exception as exc:
            failed.append((name, fname, exc))
            print(f"  WARN: {fname}: {exc}", file=sys.stderr, flush=True)
            continue

    # The only field Pyodide reads. sha256 is unchanged because it is the
    # same artifact, so integrity checks still pass.
    meta["file_name"] = fname
    meta.pop("url", None)  # drop the stale no-op key if a prior run added it
    localized += 1

with open(lock_file, "w") as fh:
    json.dump(lock, fh)

# ---- verification: no CDN reference may survive -----------------------------
with open(lock_file) as fh:
    reloaded = json.load(fh)

survivors = [
    (n, m.get("file_name", ""))
    for n, m in reloaded.get("packages", {}).items()
    if any(host in m.get("file_name", "") for host in CDN_HOSTS)
]

print(f"Lock patched: {localized} localized, {len(failed)} download failures")

if survivors:
    print(
        f"ERROR: {len(survivors)} package(s) still point at a remote host; "
        "the browser will fetch these at import time and may hang:",
        file=sys.stderr,
    )
    for n, ref in survivors[:20]:
        print(f"  {n}: {ref}", file=sys.stderr)
    sys.exit(1)

# Every localized reference must actually exist on disk next to the lock.
missing = [
    (n, m["file_name"])
    for n, m in reloaded.get("packages", {}).items()
    if m.get("file_name")
    and "/" not in m["file_name"]
    and not os.path.exists(os.path.join(lock_out, m["file_name"]))
]
if missing:
    print(f"ERROR: {len(missing)} lock entries reference missing files:", file=sys.stderr)
    for n, f in missing[:20]:
        print(f"  {n}: {f}", file=sys.stderr)
    sys.exit(1)

print("Verified: all package references are local and present.")
