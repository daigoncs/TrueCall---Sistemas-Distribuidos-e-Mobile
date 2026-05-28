import sqlite3

conn = sqlite3.connect("GolpeZero.db")

with open("seed.sql", "r", encoding="utf-8") as f:
    conn.executescript(f.read())

conn.commit()
conn.close()

print("Seed executado com sucesso!")