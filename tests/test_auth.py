from tests.base import BaseTestCase

class TestAuthAPI(BaseTestCase):
    def test_registro_sucesso(self):
        """Valida o cadastro de um novo usuário com dados válidos."""
        resposta = self.client.post("/api/auth/registrar", json={
            "nome": "Usuario Valido",
            "email": "valido@example.com",
            "senha": "senha_segura"
        })
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(dados["mensagem"], "Usuário registrado com sucesso")
        self.assertIn("usuario", dados)
        self.assertEqual(dados["usuario"]["nome"], "Usuario Valido")
        self.assertEqual(dados["usuario"]["email"], "valido@example.com")

    def test_registro_campos_obrigatorios(self):
        """Garante que a falta de dados obrigatórios retorna erro 400."""
        resposta = self.client.post("/api/auth/registrar", json={
            "nome": "Sem Email e Senha"
        })
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 400)
        self.assertIn("erro", dados)
        self.assertIn("obrigatório", dados["erro"])

    def test_registro_email_invalido(self):
        """Garante que formatos de email incorretos retornam erro 400."""
        resposta = self.client.post("/api/auth/registrar", json={
            "nome": "Usuario Email Invalido",
            "email": "email_sem_arroba.com",
            "senha": "senha_segura"
        })
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(dados["erro"], "Formato de email inválido")

    def test_registro_senha_curta(self):
        """Garante que senhas menores que 6 caracteres retornam erro 400."""
        resposta = self.client.post("/api/auth/registrar", json={
            "nome": "Usuario Senha Curta",
            "email": "curta@example.com",
            "senha": "123"
        })
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(dados["erro"], "A senha deve ter no mínimo 6 caracteres")

    def test_registro_email_duplicado(self):
        """Garante que não seja possível cadastrar dois usuários com o mesmo e-mail (erro 409)."""
        # Primeiro cadastro
        self.client.post("/api/auth/registrar", json={
            "nome": "Primeiro",
            "email": "duplicado@example.com",
            "senha": "senha_segura"
        })
        
        # Segundo cadastro com mesmo email
        resposta = self.client.post("/api/auth/registrar", json={
            "nome": "Segundo",
            "email": "duplicado@example.com",
            "senha": "senha_segura"
        })
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 409)
        self.assertEqual(dados["erro"], "Este email já está cadastrado")

    def test_login_sucesso(self):
        """Valida o login de um usuário cadastrado com credenciais corretas."""
        # Cadastra
        self.client.post("/api/auth/registrar", json={
            "nome": "Login Valido",
            "email": "login@example.com",
            "senha": "senha_correta"
        })
        
        # Faz login
        resposta = self.client.post("/api/auth/login", json={
            "email": "login@example.com",
            "senha": "senha_correta"
        })
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(dados["mensagem"], "Login realizado com sucesso")
        self.assertIn("token", dados)
        self.assertEqual(dados["usuario"]["nome"], "Login Valido")

    def test_login_falha_credenciais_incorretas(self):
        """Garante que login com senha incorreta ou email inexistente retorna erro 401."""
        # Cadastra
        self.client.post("/api/auth/registrar", json={
            "nome": "Login Invalido",
            "email": "login_invalido@example.com",
            "senha": "senha_correta"
        })
        
        # Login com senha incorreta
        resposta = self.client.post("/api/auth/login", json={
            "email": "login_invalido@example.com",
            "senha": "senha_errada"
        })
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 401)
        self.assertEqual(dados["erro"], "Email ou senha incorretos")
