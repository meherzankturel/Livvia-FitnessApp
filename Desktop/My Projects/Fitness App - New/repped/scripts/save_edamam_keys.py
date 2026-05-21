#!/usr/bin/env python3
"""Interactively prompt for Edamam (or Nutritionix) App ID + Key and append to
repped/.env.local. Handles paste issues cleanly — no shell quoting headaches."""

from pathlib import Path
import sys

ENV = Path(__file__).resolve().parent.parent / ".env.local"

print("\nThis will append your Edamam (or Nutritionix) credentials to:")
print(f"  {ENV}\n")

provider = input("Which API did you sign up for? Type 'edamam' or 'nutritionix': ").strip().lower()
if provider not in ("edamam", "nutritionix"):
    print("ERROR: type 'edamam' or 'nutritionix' exactly. Re-run the script.")
    sys.exit(1)

prefix = "EDAMAM" if provider == "edamam" else "NUTRITIONIX"

app_id = input(f"\nPaste your {provider.title()} Application ID, then press Enter:\n> ").strip()
if not app_id:
    print("ERROR: App ID was empty. Re-run and paste it.")
    sys.exit(1)

app_key = input(f"\nPaste your {provider.title()} Application Key, then press Enter:\n> ").strip()
if not app_key:
    print("ERROR: App Key was empty. Re-run and paste it.")
    sys.exit(1)

# Append both lines
with ENV.open("a") as f:
    f.write(f"{prefix}_APP_ID={app_id}\n")
    f.write(f"{prefix}_APP_KEY={app_key}\n")

# Verify
count = 0
for line in ENV.read_text().splitlines():
    if line.startswith(f"{prefix}_"):
        count += 1

print(f"\n✓ Saved. {prefix}_* line count: {count}")
if count == 2:
    print(f"\nYou can now message: '{provider} set, count=2'\n")
else:
    print("\nUnexpected count — please check the file manually.")
    sys.exit(1)
