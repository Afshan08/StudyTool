import sqlite3
conn = sqlite3.connect('db.sqlite3')
cur = conn.cursor()
print('=== Categories ===')
cur.execute('SELECT id, name, color FROM tracker_category ORDER BY id')
for row in cur.fetchall():
    print(' ', row)
conn.close()
