from datetime import datetime, timedelta, timezone

import jwt

from tests.base import BaseTestCase


class TestTokenObrigatorio(BaseTestCase):
    """Testes para o decorator token_obrigatorio (auth.py)."""

    def test_sem_header_authorization(self):
        """Garante 401 quando o header Authorization esta ausente."""
        resposta = self.client.get("/api/denuncias")
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 401)
        self.assertEqual(dados["erro"], "Token não fornecido")

    def test_header_sem_bearer(self):
        """Garante 401 quando o header nao comeca com 'Bearer '."""
        resposta = self.client.get(
            "/api/denuncias",
            headers={"Authorization": "Token abc123"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 401)
        self.assertEqual(dados["erro"], "Token não fornecido")

    def test_token_invalido(self):
        """Garante 401 quando o token JWT e invalido (lixo)."""
        resposta = self.client.get(
            "/api/denuncias",
            headers={"Authorization": "Bearer token.completamente.invalido"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 401)
        self.assertEqual(dados["erro"], "Token inválido")

    def test_token_expirado(self):
        """Garante 401 quando o token JWT esta expirado."""
        token_expirado = jwt.encode(
            {
                "usuario_id": 999,
                "exp": datetime.now(timezone.utc) - timedelta(hours=1),
            },
            "chave-de-teste-segura",
            algorithm="HS256",
        )

        resposta = self.client.get(
            "/api/denuncias",
            headers={"Authorization": f"Bearer {token_expirado}"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 401)
        self.assertEqual(dados["erro"], "Token expirado")

    def test_token_assinado_com_chave_errada(self):
        """Garante 401 quando o token foi assinado com outra secret."""
        token_errado = jwt.encode(
            {
                "usuario_id": 1,
                "exp": datetime.now(timezone.utc) + timedelta(hours=1),
            },
            "chave-completamente-diferente",
            algorithm="HS256",
        )

        resposta = self.client.get(
            "/api/denuncias",
            headers={"Authorization": f"Bearer {token_errado}"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 401)
        self.assertEqual(dados["erro"], "Token inválido")


class TestLoginEdgeCases(BaseTestCase):
    """Testes adicionais para o endpoint de login."""

    def test_login_sem_corpo(self):
        """Garante 400 quando o corpo da requisicao esta vazio."""
        resposta = self.client.post(
            "/api/auth/login",
            content_type="application/json",
            data="null"
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 400)
        self.assertIn("obrigatórios", dados["erro"])

    def test_login_sem_email(self):
        """Garante 400 quando apenas a senha e fornecida."""
        resposta = self.client.post("/api/auth/login", json={"senha": "Senha@123"})
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 400)
        self.assertIn("obrigatórios", dados["erro"])

    def test_login_sem_senha(self):
        """Garante 400 quando apenas o email e fornecido."""
        resposta = self.client.post("/api/auth/login", json={"email": "x@x.com"})
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 400)
        self.assertIn("obrigatórios", dados["erro"])

    def test_login_usuario_inexistente(self):
        """Garante 401 quando o email nao esta cadastrado."""
        resposta = self.client.post("/api/auth/login", json={
            "email": "nao_existe@example.com",
            "senha": "Senha@123"
        })
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 401)
        self.assertEqual(dados["erro"], "Email ou senha incorretos")

    def test_login_normaliza_email(self):
        """Garante que o login normaliza espacos e caixa do email."""
        self.client.post("/api/auth/registrar", json={
            "nome": "Teste Normaliza",
            "email": "normaliza@example.com",
            "senha": "Senha@123"
        })

        resposta = self.client.post("/api/auth/login", json={
            "email": "  Normaliza@Example.COM  ",
            "senha": "Senha@123"
        })
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertIn("token", dados)


class TestRegistroEdgeCases(BaseTestCase):
    """Testes adicionais para o endpoint de registro."""

    def test_registro_sem_corpo(self):
        """Garante 400 quando o corpo esta vazio/nulo."""
        resposta = self.client.post(
            "/api/auth/registrar",
            content_type="application/json",
            data="null"
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 400)
        self.assertIn("obrigatório", dados["erro"])

    def test_registro_campos_vazios(self):
        """Garante 400 quando campos existem mas estao vazios."""
        resposta = self.client.post("/api/auth/registrar", json={
            "nome": "",
            "email": "vazio@example.com",
            "senha": "Senha@123"
        })
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 400)
        self.assertIn("obrigatório", dados["erro"])

    def test_registro_email_sem_ponto(self):
        """Garante 400 quando o email tem @ mas nao tem ponto."""
        resposta = self.client.post("/api/auth/registrar", json={
            "nome": "Sem Ponto",
            "email": "usuario@sempontocom",
            "senha": "Senha@123"
        })
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 400)
        self.assertEqual(dados["erro"], "Formato de email inválido")
