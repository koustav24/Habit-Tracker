import sqlite3
import os

db_path = "habitos.db"

if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
    exit(0)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("ALTER TABLE users ADD COLUMN goals TEXT;")
    conn.commit()
    print("Migration successful: Added 'goals' column.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Column 'goals' already exists.")
    else:
        print(f"Migration failed: {e}")
finally:
    conn.close()
