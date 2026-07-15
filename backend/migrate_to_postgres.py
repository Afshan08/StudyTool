"""
migrate_to_postgres.py
======================
Migrates all data from the SQLite database to PostgreSQL.

Usage:
    1. Make sure PostgreSQL is running and the DB exists:
       createdb focus_journal_db   (or create via pgAdmin)

    2. Make sure your .env file has the correct DB_* settings pointing to PostgreSQL.

    3. Run from the backend/ directory:
       python migrate_to_postgres.py

How it works:
    - Dumps data from SQLite using Django's dumpdata command
    - Switches the DATABASE setting to PostgreSQL temporarily
    - Loads the dumped data into PostgreSQL using loaddata
"""

import os
import sys
import subprocess
import json

# ---------------------------------------------------------------------------
# Step 1: Verify we're in the right directory
# ---------------------------------------------------------------------------
if not os.path.exists('manage.py'):
    print("ERROR: Run this script from the backend/ directory.")
    sys.exit(1)

DUMP_FILE = 'sqlite_data_dump.json'

print("=" * 60)
print(" SQLite → PostgreSQL Migration Script")
print("=" * 60)

# ---------------------------------------------------------------------------
# Step 2: Dump all data from SQLite (current DB)
# ---------------------------------------------------------------------------
print("\n[1/4] Dumping data from SQLite...")
print("      This exports: categories, sessions, accounts, etc.\n")

# Temporarily force SQLite by setting env var
env_sqlite = os.environ.copy()
env_sqlite['DB_ENGINE'] = 'django.db.backends.sqlite3'

result = subprocess.run(
    [sys.executable, 'manage.py', 'dumpdata',
     '--exclude=contenttypes',
     '--exclude=auth.permission',
     '--indent=2',
     '-o', DUMP_FILE],
    env=env_sqlite,
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print(f"ERROR during dumpdata:\n{result.stderr}")
    sys.exit(1)

# Count records
with open(DUMP_FILE, 'r') as f:
    records = json.load(f)
print(f"      ✓ Dumped {len(records)} records to {DUMP_FILE}")

# ---------------------------------------------------------------------------
# Step 3: Run migrations on PostgreSQL
# ---------------------------------------------------------------------------
print("\n[2/4] Running migrations on PostgreSQL database...")

env_pg = os.environ.copy()
env_pg['DB_ENGINE'] = 'django.db.backends.postgresql'

result = subprocess.run(
    [sys.executable, 'manage.py', 'migrate', '--run-syncdb'],
    env=env_pg,
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print(f"ERROR during migrate:\n{result.stderr}")
    print("\nTip: Make sure PostgreSQL is running and your .env DB_* settings are correct.")
    sys.exit(1)

print("      ✓ PostgreSQL schema created successfully")

# ---------------------------------------------------------------------------
# Step 4: Load data into PostgreSQL
# ---------------------------------------------------------------------------
print("\n[3/4] Loading data into PostgreSQL...")

result = subprocess.run(
    [sys.executable, 'manage.py', 'loaddata', DUMP_FILE],
    env=env_pg,
    capture_output=True,
    text=True
)

if result.returncode != 0:
    print(f"ERROR during loaddata:\n{result.stderr}")
    sys.exit(1)

print(f"      ✓ {result.stdout.strip()}")

# ---------------------------------------------------------------------------
# Step 5: Cleanup
# ---------------------------------------------------------------------------
print("\n[4/4] Cleaning up temporary dump file...")
os.remove(DUMP_FILE)
print(f"      ✓ Removed {DUMP_FILE}")

print("\n" + "=" * 60)
print(" Migration COMPLETE!")
print(" Next steps:")
print("   1. Update your .env: set DB_ENGINE=django.db.backends.postgresql")
print("   2. Run: start.bat  (to start the production server)")
print("=" * 60)
