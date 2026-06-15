import sqlite3
import os
import logging

from flask import g, current_app

logger = logging.getLogger(__name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATABASE_DIR = os.path.join(BASE_DIR, "database")
DATABASE_PATH = os.path.join(DATABASE_DIR, "TrueCall.db")

def get_db():
    if "db" not in g:
        db_path = current_app.config.get("DATABASE", DATABASE_PATH) if current_app else DATABASE_PATH
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")

    return g.db

def close_db(e=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db(app=None):
    db_path = app.config.get("DATABASE", DATABASE_PATH) if app else DATABASE_PATH
    is_testing = app.config.get("TESTING", False) if app else False

    db = sqlite3.connect(db_path)
    db.execute("PRAGMA foreign_keys = ON")

    try:
        # Garante que a coluna tipo_golpe_personalizado existe na tabela denuncia
        try:
            db.execute("ALTER TABLE denuncia ADD COLUMN tipo_golpe_personalizado TEXT")
            db.commit()
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                pass
            else:
                logger.error("[DB] Erro ao adicionar coluna tipo_golpe_personalizado: %s", e)
                raise

        # Garante que a coluna estado existe na tabela denuncia
        try:
            db.execute("ALTER TABLE denuncia ADD COLUMN estado TEXT")
            db.commit()
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                pass
            else:
                logger.error("[DB] Erro ao adicionar coluna estado: %s", e)
                raise

        # Garante que a tabela de votos existe mesmo em bancos já criados
        db.execute("""
        CREATE TABLE IF NOT EXISTS voto_denuncia (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            denuncia_id INTEGER NOT NULL,
            usuario_id  INTEGER NOT NULL,
            data_voto   DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (denuncia_id) REFERENCES denuncia(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id)  REFERENCES usuario(id),
            UNIQUE(denuncia_id, usuario_id)
        )
        """)

        # Garante que a tabela de números confiáveis existe
        db.execute("""
        CREATE TABLE IF NOT EXISTS numero_confiavel (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            instituicao TEXT NOT NULL,
            numero TEXT NOT NULL,
            usuario_id INTEGER NOT NULL,
            FOREIGN KEY (usuario_id) REFERENCES usuario(id),
            UNIQUE(usuario_id, instituicao, numero)
        )
        """)
        db.commit()

        tabela_existe = db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='usuario'"
        ).fetchone()

        if not tabela_existe:
            schema_path = os.path.join(DATABASE_DIR, "schema.sql")
            seed_path   = os.path.join(DATABASE_DIR, "seed.sql")

            with open(schema_path, "r", encoding="utf-8") as f:
                db.executescript(f.read())

            with open(seed_path, "r", encoding="utf-8") as f:
                db.executescript(f.read())

            db.commit()

            if not is_testing:
                logger.info("[DB] Banco inicializado com schema e seed.")
        else:
            if not is_testing:
                logger.info("[DB] Banco já existe, pulando inicialização.")
    except Exception:
        logger.exception("[DB] Falha crítica ao inicializar o banco de dados")
        raise
    finally:
        db.close()
