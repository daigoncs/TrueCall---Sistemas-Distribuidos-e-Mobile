import os
import unittest

from main import create_app


class TestCreateApp(unittest.TestCase):

    def test_create_app_modo_teste(self):
        """Garante que create_app em modo TESTING nao exige SECRET_KEY do ambiente."""
        app = create_app({"TESTING": True, "SECRET_KEY": "chave-teste"})
        self.assertTrue(app.config["TESTING"])
        self.assertEqual(app.config["SECRET_KEY"], "chave-teste")

    def test_create_app_secret_key_padrao_teste(self):
        """Garante que TESTING=True usa chave padrao quando SECRET_KEY nao e fornecida."""
        app = create_app({"TESTING": True})
        self.assertEqual(app.config["SECRET_KEY"], "chave-de-teste-segura")

    def test_create_app_sem_secret_key_erro(self):
        """Garante que create_app levanta RuntimeError quando SECRET_KEY nao esta definida."""
        env_backup = os.environ.pop("SECRET_KEY", None)
        try:
            with self.assertRaises(RuntimeError):
                create_app()
        finally:
            if env_backup is not None:
                os.environ["SECRET_KEY"] = env_backup

    def test_create_app_com_env_secret_key(self):
        """Garante que create_app usa SECRET_KEY do ambiente quando nao esta em modo teste."""
        os.environ["SECRET_KEY"] = "chave-de-ambiente-temporaria"
        try:
            app = create_app()
            self.assertEqual(app.config["SECRET_KEY"], "chave-de-ambiente-temporaria")
        finally:
            del os.environ["SECRET_KEY"]


class TestIndexEndpoint(unittest.TestCase):

    def setUp(self):
        self.app = create_app({"TESTING": True, "SECRET_KEY": "chave-teste"})
        self.client = self.app.test_client()

    def test_index_retorna_info_aplicacao(self):
        """Garante que GET / retorna informacoes basicas da API."""
        resposta = self.client.get("/")
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(dados["aplicacao"], "TrueCall API")
        self.assertIn("versao", dados)
        self.assertIn("endpoints", dados)

    def test_index_endpoints_listados(self):
        """Garante que os endpoints principais estao listados na raiz."""
        resposta = self.client.get("/")
        endpoints = resposta.get_json()["endpoints"]

        self.assertIn("auth", endpoints)
        self.assertIn("denuncias", endpoints)
        self.assertIn("instituicoes", endpoints)
        self.assertIn("tipos_golpe", endpoints)


class TestBlueprintsRegistrados(unittest.TestCase):

    def setUp(self):
        self.app = create_app({"TESTING": True, "SECRET_KEY": "chave-teste"})

    def test_blueprint_auth_registrado(self):
        """Garante que o blueprint de autenticacao esta registrado."""
        self.assertIn("auth", self.app.blueprints)

    def test_blueprint_denuncias_registrado(self):
        """Garante que o blueprint de denuncias esta registrado."""
        self.assertIn("denuncias", self.app.blueprints)

    def test_blueprint_instituicoes_registrado(self):
        """Garante que o blueprint de instituicoes esta registrado."""
        self.assertIn("instituicoes", self.app.blueprints)

    def test_blueprint_tipos_golpe_registrado(self):
        """Garante que o blueprint de tipos de golpe esta registrado."""
        self.assertIn("tipos_golpe", self.app.blueprints)
