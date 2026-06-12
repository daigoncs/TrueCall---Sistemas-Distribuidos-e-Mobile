from tests.base import BaseTestCase

class TestInstituicoesAPI(BaseTestCase):

    def test_listar_instituicoes_publico(self):
        """Garante que a listagem de instituições é acessível sem token."""
        resposta = self.client.get("/api/instituicoes")
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertIsInstance(dados, list)
        self.assertGreater(len(dados), 0)
        self.assertIn("id", dados[0])
        self.assertIn("nome", dados[0])

    def test_listar_confiaveis_sem_token(self):
        """Garante que números confiáveis exigem autenticação (401)."""
        resposta = self.client.get("/api/instituicoes/confiaveis")
        self.assertEqual(resposta.status_code, 401)

    def test_listar_confiaveis_popula_padrao(self):
        """No primeiro acesso, os números padrão devem ser inseridos automaticamente."""
        token = self.registrar_e_logar()

        resposta = self.client.get("/api/instituicoes/confiaveis",
            headers={"Authorization": f"Bearer {token}"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertIsInstance(dados, list)
        # Deve ter ao menos os números padrão (9 configurados no backend)
        self.assertGreaterEqual(len(dados), 9)

    def test_adicionar_confiavel_sucesso(self):
        """Valida a adição de um número confiável personalizado."""
        token = self.registrar_e_logar()

        resposta = self.client.post("/api/instituicoes/confiaveis",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "instituicao": "Banco Teste",
                "numero": "0800 123 4567"
            }
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(dados["mensagem"], "Número confiável adicionado com sucesso")
        self.assertEqual(dados["instituicao"], "Banco Teste")

    def test_adicionar_confiavel_campos_obrigatorios(self):
        """Garante erro 400 se campos obrigatórios estiverem ausentes."""
        token = self.registrar_e_logar()

        resposta = self.client.post("/api/instituicoes/confiaveis",
            headers={"Authorization": f"Bearer {token}"},
            json={"instituicao": "Só instituição"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 400)
        self.assertIn("erro", dados)

    def test_adicionar_confiavel_duplicado(self):
        """Garante que número duplicado para a mesma instituição retorna 409."""
        token = self.registrar_e_logar()

        payload = {"instituicao": "Banco Duplo", "numero": "0800 111 2222"}

        self.client.post("/api/instituicoes/confiaveis",
            headers={"Authorization": f"Bearer {token}"},
            json=payload
        )
        resposta = self.client.post("/api/instituicoes/confiaveis",
            headers={"Authorization": f"Bearer {token}"},
            json=payload
        )
        self.assertEqual(resposta.status_code, 409)

    def test_deletar_confiavel_sucesso(self):
        """Valida a remoção de um número confiável."""
        token = self.registrar_e_logar()

        # Adiciona
        res_add = self.client.post("/api/instituicoes/confiaveis",
            headers={"Authorization": f"Bearer {token}"},
            json={"instituicao": "Banco Excluir", "numero": "0800 999 8888"}
        )
        numero_id = res_add.get_json()["id"]

        # Remove
        resposta = self.client.delete(f"/api/instituicoes/confiaveis/{numero_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resposta.status_code, 200)
        self.assertIn("removido", resposta.get_json()["mensagem"])

    def test_deletar_confiavel_de_outro_usuario(self):
        """Garante que o usuário B não deleta número do usuário A (404)."""
        token_a = self.registrar_e_logar(email="inst_a@test.com")
        token_b = self.registrar_e_logar(email="inst_b@test.com")

        res_add = self.client.post("/api/instituicoes/confiaveis",
            headers={"Authorization": f"Bearer {token_a}"},
            json={"instituicao": "Banco A", "numero": "0800 777 6666"}
        )
        numero_id = res_add.get_json()["id"]

        resposta = self.client.delete(f"/api/instituicoes/confiaveis/{numero_id}",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        self.assertEqual(resposta.status_code, 404)
