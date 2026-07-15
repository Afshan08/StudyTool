import sqlite3
conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()

print('=== VideoEntry table ===')
cur.execute('SELECT id, session_id, file, uploaded_at FROM tracker_videoentry ORDER BY id')
for row in cur.fetchall():
    print(' ', row)

print()
print('=== All Sessions from July 13 onwards (including deleted) ===')
cur.execute("SELECT id, start_time, end_time, worked_on, is_deleted FROM tracker_studysession WHERE start_time > '2026-07-13' ORDER BY start_time")
for row in cur.fetchall():
    print(' ', row)

print()
print('=== Django migrations log (last 5) ===')
cur.execute("SELECT app, name, applied FROM django_migrations ORDER BY applied DESC LIMIT 5")
for row in cur.fetchall():
    print(' ', row)

conn.close()
