#!/usr/bin/env python3
"""Set the Transferegov API key in the API's private .env file from stdin."""

import os
import re
import sys
import tempfile
from pathlib import Path


repo = Path(__file__).resolve().parents[2]
env_path = repo / "apps" / "api" / ".env"
key = sys.stdin.readline().rstrip("\r\n")
if not key:
    raise SystemExit("TRANSFEREGOV_API_KEY was empty; refusing to change the API environment.")
if "\n" in key or "\r" in key:
    raise SystemExit("Invalid TRANSFEREGOV_API_KEY input.")

current = env_path.read_text(encoding="utf-8") if env_path.exists() else ""
replacement = f"TRANSFEREGOV_API_KEY={key}"
pattern = re.compile(r"(?m)^TRANSFEREGOV_API_KEY=.*$")
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
