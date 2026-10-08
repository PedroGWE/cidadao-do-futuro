#!/usr/bin/env python3
"""Set the Portal da Transparência token in the API's private .env from stdin."""

import os
import re
import sys
import tempfile
from pathlib import Path


repo = Path(__file__).resolve().parents[2]
env_path = repo / "apps" / "api" / ".env"
token = sys.stdin.readline().rstrip("\r\n")
if not token:
    raise SystemExit("PORTAL_TRANSPARENCIA_TOKEN was empty; refusing to change the API environment.")
if "\n" in token or "\r" in token:
    raise SystemExit("Invalid PORTAL_TRANSPARENCIA_TOKEN input.")

current = env_path.read_text(encoding="utf-8") if env_path.exists() else ""
# Remove the value previously misapplied to the Transferegov client.
current = re.sub(r"(?m)^TRANSFEREGOV_API_KEY=[^\r\n]*(?:\r?\n|$)", "", current)
replacement = f"PORTAL_TRANSPARENCIA_TOKEN={token}"
pattern = re.compile(r"(?m)^PORTAL_TRANSPARENCIA_TOKEN=.*$")
updated, count = pattern.subn(lambda _: replacement, current)
if count == 0:
    updated = current.rstrip("\r\n") + ("\n" if current else "") + replacement + "\n"

env_path.parent.mkdir(parents=True, exist_ok=True)
fd, temporary_name = tempfile.mkstemp(prefix=".env.", dir=env_path.parent)
try:
    os.fchmod(fd, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as temporary:
        temporary.write(updated)
    os.replace(temporary_name, env_path)
finally:
    if os.path.exists(temporary_name):
        os.unlink(temporary_name)
