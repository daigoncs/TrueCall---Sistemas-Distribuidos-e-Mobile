import os
import unittest
import sqlite3
from main import create_app

class BaseTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        cls.test_db_path = os.path.join(cls.base_dir, "src", "database", "test_TrueCall.db")
        cls.schema_path = os.path.join(cls.base_dir, "src", "database", "schema.sql")
        cls.seed_path = os.path.join(cls.base_dir, "src", "database", "seed.sql")

    def setUp(self):
        # Remove se por acaso sobrou algum banco de testes anterior
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except OSError:
                pass

        # Cria o banco de testes vazio e popula o esquema e dados iniciais (seed)
        db = sqlite3.connect(self.test_db_path)
        
        with open(self.schema_path, "r", encoding="utf-8") as f:
            db.executescript(f.read())
            
        with open(self.seed_path, "r", encoding="utf-8") as f:
            db.executescript(f.read())
            
        db.commit()
        db.close()

        # Cria o app do Flask em modo de teste com o banco temporário
        self.app = create_app({
            "TESTING": True,
            "DATABASE": self.test_db_path
        })
        self.client = self.app.test_client()

    def tearDown(self):
        # Garante a remoção do banco temporário após cada teste
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except OSError:
                pass

    def registrar_e_logar(self, nome="Usuario Teste", email="teste@example.com", senha="password123"):
        """Função auxiliar para registrar e obter o token JWT de um usuário de testes."""
        # Registra
        self.client.post("/api/auth/registrar", json={
            "nome": nome,
            "email": email,
            "senha": senha
        })
        
        # Loga
        resposta = self.client.post("/api/auth/login", json={
            "email": email,
            "senha": senha
        })
        
        dados = resposta.get_json()
        return dados.get("token")
