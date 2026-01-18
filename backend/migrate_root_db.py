import sqlite3
import os

# Target the DB in the root directory explicitly
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "habitos.db"))

print(f"Targeting Database at: {db_path}")

if not os.path.exists(db_path):
    print(f"Database {db_path} not found.")
    exit(1)

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if column exists first
    cursor.execute("PRAGMA table_info(users);")
    columns = [info[1] for info in cursor.fetchall()]
    
    if "goals" in columns:
        print("Column 'goals' already exists in users table.")
    else:
        cursor.execute("ALTER TABLE users ADD COLUMN goals TEXT;")
        conn.commit()
        print("Migration successful: Added 'goals' column.")
        
except Exception as e:
    print(f"Migration failed: {e}")
finally:
    if conn:
        conn.close()
