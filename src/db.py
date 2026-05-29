import sqlite3
import os

from flask import g, current_app

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATABASE_DIR = os.path.join(BASE_DIR, "database")
DATABASE_PATH = os.path.join(DATABASE_DIR, "GolpeZero.db")

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE_PATH)

        g.db.row_factory = sqlite3.Row

        g.db.execute("PRAGMA foreign_keys = ON")

    return g.db

def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    db = sqlite3.connect(DATABASE_PATH)

    tabela_existe = db.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='usuario'"
    ).fetchone()

    if not tabela_existe:
        schema_path = os.path.join(DATABASE_DIR, "schema.sql")
        seed_path = os.path.join(DATABASE_DIR, "seed.sql")

        with open(schema_path, "r", encoding="utf-8") as f:
            db.executescript(f.read())

        with open(seed_path, "r", encoding="utf-8") as f:
            db.executescript(f.read())

        db.commit()
        print("[DB] Banco inicializado com schema e seed.")
    else:
        print("[DB] Banco já existe, pulando inicialização.")

    db.close()
