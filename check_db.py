import sqlite3
conn = sqlite3.connect('D:/talk clone/voicestudio.db')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("Tables:", cursor.fetchall())
try:
    cursor.execute("SELECT id, username, email, tier FROM users")
    print("Users:", cursor.fetchall())
except Exception as e:
    print("Users error:", e)
conn.close()
