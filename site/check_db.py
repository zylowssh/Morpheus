import sqlite3
from pathlib import Path

DB_PATH = Path("data/aerium.sqlite")

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

print("Tables:")
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print(cur.fetchall())

print("\nLast 20 readings:")
cur.execute("""
    SELECT id, ppm, timestamp
    FROM co2_readings
    ORDER BY timestamp DESC
    LIMIT 20
""")
for row in cur.fetchall():
    print(row)

conn.close()
