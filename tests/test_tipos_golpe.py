from tests.base import BaseTestCase


class TestTiposGolpeAPI(BaseTestCase):

    def test_listar_tipos_golpe_publico(self):
        """Garante que a listagem de tipos de golpe e acessivel sem token."""
        resposta = self.client.get("/api/tipos-golpe")
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertIsInstance(dados, list)
        self.assertGreater(len(dados), 0)

    def test_listar_tipos_golpe_estrutura(self):
        """Garante que cada item retornado possui 'id' e 'nome'."""
        resposta = self.client.get("/api/tipos-golpe")
        dados = resposta.get_json()

        for item in dados:
            self.assertIn("id", item)
            self.assertIn("nome", item)

    def test_listar_tipos_golpe_conteudo_seed(self):
        """Garante que os tipos de golpe do seed estao presentes."""
        resposta = self.client.get("/api/tipos-golpe")
        dados = resposta.get_json()
        nomes = [t["nome"] for t in dados]

        esperados = [
            "Falsa Central Bancária",
            "PIX Fraudulento",
            "Cartão Clonado",
            "Empréstimo Falso",
            "Outro",
        ]
        for esperado in esperados:
            self.assertIn(esperado, nomes)

    def test_listar_tipos_golpe_ordenacao_por_nome(self):
        """Garante que a lista e retornada em ordem alfabetica pelo nome."""
        resposta = self.client.get("/api/tipos-golpe")
        dados = resposta.get_json()
        nomes = [t["nome"] for t in dados]

        self.assertEqual(nomes, sorted(nomes))

    def test_listar_tipos_golpe_metodo_nao_permitido(self):
        """Garante que POST em /api/tipos-golpe retorna 405."""
        resposta = self.client.post("/api/tipos-golpe", json={"nome": "Novo"})
        self.assertEqual(resposta.status_code, 405)
