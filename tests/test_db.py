import os
import sqlite3
import unittest

from main import create_app
from src.backend.db import get_db, close_db


def _pre_populate(db_path):
    """Popula o banco com schema e seed (mesmo fluxo do base.py)."""
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    schema_path = os.path.join(base_dir, "src", "database", "schema.sql")
    seed_path = os.path.join(base_dir, "src", "database", "seed.sql")

    db = sqlite3.connect(db_path)
    with open(schema_path, "r", encoding="utf-8") as f:
        db.executescript(f.read())
    with open(seed_path, "r", encoding="utf-8") as f:
        db.executescript(f.read())
    db.commit()
    db.close()


class TestGetDB(unittest.TestCase):

    def setUp(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.test_db_path = os.path.join(self.base_dir, "src", "database", "test_db_module.db")

        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)

        _pre_populate(self.test_db_path)

        self.app = create_app({
            "TESTING": True,
            "SECRET_KEY": "chave-teste-db",
            "DATABASE": self.test_db_path,
        })

    def tearDown(self):
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except OSError:
                pass

    def test_get_db_retorna_conexao(self):
        """Garante que get_db retorna uma conexao sqlite valida."""
        with self.app.app_context():
            db = get_db()
            self.assertIsNotNone(db)
            cursor = db.execute("SELECT 1")
            self.assertEqual(cursor.fetchone()[0], 1)

    def test_get_db_reusa_conexao(self):
        """Garante que get_db retorna a mesma conexao dentro do mesmo contexto."""
        with self.app.app_context():
            db1 = get_db()
            db2 = get_db()
            self.assertIs(db1, db2)

    def test_get_db_row_factory(self):
        """Garante que a conexao usa sqlite3.Row como row_factory."""
        with self.app.app_context():
            db = get_db()
            self.assertEqual(db.row_factory, sqlite3.Row)

    def test_get_db_foreign_keys_ativado(self):
        """Garante que PRAGMA foreign_keys esta ativado."""
        with self.app.app_context():
            db = get_db()
            fk = db.execute("PRAGMA foreign_keys").fetchone()[0]
            self.assertEqual(fk, 1)


class TestCloseDB(unittest.TestCase):

    def setUp(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.test_db_path = os.path.join(self.base_dir, "src", "database", "test_db_close.db")

        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)

        _pre_populate(self.test_db_path)

        self.app = create_app({
            "TESTING": True,
            "SECRET_KEY": "chave-teste-db",
            "DATABASE": self.test_db_path,
        })

    def tearDown(self):
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except OSError:
                pass

    def test_close_db_fecha_conexao(self):
        """Garante que close_db remove a conexao do contexto Flask."""
        with self.app.app_context():
            from flask import g
            db = get_db()
            self.assertIn("db", g.__dict__)
            close_db()
            self.assertNotIn("db", g.__dict__)

    def test_close_db_sem_conexao_aberta(self):
        """Garante que close_db nao falha quando nao ha conexao aberta."""
        with self.app.app_context():
            close_db()


class TestInitDB(unittest.TestCase):

    def setUp(self):
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        self.test_db_path = os.path.join(self.base_dir, "src", "database", "test_db_init.db")

        if os.path.exists(self.test_db_path):
            os.remove(self.test_db_path)

    def tearDown(self):
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except OSError:
                pass

    def test_init_db_garante_tabelas_auxiliares(self):
        """Garante que init_db cria voto_denuncia e numero_confiavel em banco existente."""
        _pre_populate(self.test_db_path)

        app = create_app({
            "TESTING": True,
            "SECRET_KEY": "chave-teste-db",
            "DATABASE": self.test_db_path,
        })

        db = sqlite3.connect(self.test_db_path)
        tabelas = [
            row[0]
            for row in db.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            ).fetchall()
        ]
        db.close()

        self.assertIn("usuario", tabelas)
        self.assertIn("instituicao", tabelas)
        self.assertIn("tipo_golpe", tabelas)
        self.assertIn("denuncia", tabelas)
        self.assertIn("numero_confiavel", tabelas)
        self.assertIn("voto_denuncia", tabelas)

    def test_init_db_idempotente(self):
        """Garante que chamar init_db duas vezes nao causa erro."""
        _pre_populate(self.test_db_path)

        app1 = create_app({
            "TESTING": True,
            "SECRET_KEY": "chave-teste-db",
            "DATABASE": self.test_db_path,
        })

        app2 = create_app({
            "TESTING": True,
            "SECRET_KEY": "chave-teste-db",
            "DATABASE": self.test_db_path,
        })

        db = sqlite3.connect(self.test_db_path)
        tabelas = [
            row[0]
            for row in db.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            ).fetchall()
        ]
        db.close()

        self.assertIn("usuario", tabelas)

    def test_init_db_popula_seed(self):
        """Garante que init_db preserva os dados iniciais do seed."""
        _pre_populate(self.test_db_path)

        app = create_app({
            "TESTING": True,
            "SECRET_KEY": "chave-teste-db",
            "DATABASE": self.test_db_path,
        })

        db = sqlite3.connect(self.test_db_path)
        instituicoes = db.execute("SELECT COUNT(*) FROM instituicao").fetchone()[0]
        tipos = db.execute("SELECT COUNT(*) FROM tipo_golpe").fetchone()[0]
        db.close()

        self.assertGreater(instituicoes, 0)
        self.assertGreater(tipos, 0)
