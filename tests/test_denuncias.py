import json
import sqlite3
from tests.base import BaseTestCase

class TestDenunciasAPI(BaseTestCase):
    def test_listar_denuncias_sem_token(self):
        """Garante que a rota de listagem de denúncias recusa requisições sem token (erro 401)."""
        resposta = self.client.get("/api/denuncias")
        self.assertEqual(resposta.status_code, 401)

    def test_criar_denuncia_sucesso(self):
        """Garante o cadastro de uma denúncia com sucesso utilizando token válido."""
        token = self.registrar_e_logar()
        
        resposta = self.client.post("/api/denuncias", 
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 99999-9999",
                "descricao": "Ligaram fingindo ser do suporte do banco.",
                "instituicao_id": 1, # Banco do Brasil (seed)
                "tipo_golpe_id": 1  # Falsa Central Bancária (seed)
            }
        )
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(dados["mensagem"], "Denúncia registrada com sucesso")
        self.assertIn("denuncia", dados)
        self.assertEqual(dados["denuncia"]["telefone"], "(11) 99999-9999")

    def test_criar_denuncia_campos_obrigatorios(self):
        """Garante erro 400 se campos obrigatórios da denúncia estiverem em falta."""
        token = self.registrar_e_logar()
        
        resposta = self.client.post("/api/denuncias", 
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 99999-9999",
                "descricao": "Falta instituição e tipo"
            }
        )
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 400)
        self.assertIn("erro", dados)
        self.assertIn("obrigatório", dados["erro"])

    def test_excluir_denuncia_sucesso(self):
        """Valida a exclusão de uma denúncia cadastrada."""
        token = self.registrar_e_logar()
        
        # Cria denúncia
        res_criar = self.client.post("/api/denuncias", 
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 98888-8888",
                "descricao": "Tentativa de golpe",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]
        
        # Deleta a denúncia
        res_deletar = self.client.delete(f"/api/denuncias/{denuncia_id}", 
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(res_deletar.status_code, 200)
        
        # Verifica se de fato sumiu da lista
        res_listar = self.client.get("/api/denuncias", 
            headers={"Authorization": f"Bearer {token}"}
        )
        lista = res_listar.get_json()
        self.assertEqual(len(lista), 0)

    def test_verificar_telefone_publico_desconhecido(self):
        """Garante que um telefone sem denúncias ou registros oficiais retorne desconhecido."""
        resposta = self.client.get("/api/denuncias/publico/verificar/11911112222")
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(dados["status"], "desconhecido")
        self.assertIn("Nenhum registro", dados["detalhes"])

    def test_verificar_telefone_publico_suspeito(self):
        """Garante que um telefone denunciado retorne status suspeito com a quantidade de denúncias."""
        token = self.registrar_e_logar()
        
        # Cadastra denúncia para o número
        self.client.post("/api/denuncias", 
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 97777-7777",
                "descricao": "Pix falso",
                "instituicao_id": 1,
                "tipo_golpe_id": 2 # PIX Fraudulento (seed)
            }
        )
        
        # Consulta sem login
        resposta = self.client.get("/api/denuncias/publico/verificar/11977777777")
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(dados["status"], "suspeito")
        self.assertIn("Atenção! Este número possui 1 denúncia", dados["detalhes"])

    def test_verificar_telefone_publico_confiavel(self):
        """Garante que um número confiável retorne status confiavel."""
        token = self.registrar_e_logar()
        
        # Cadastra número confiável na tabela do usuário
        self.client.post("/api/instituicoes/confiaveis",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "instituicao": "Banco Central Oficial",
                "numero": "0800 999 9999"
            }
        )
        
        # Consulta pública do número limpo
        resposta = self.client.get("/api/denuncias/publico/verificar/08009999999")
        dados = resposta.get_json()
        
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(dados["status"], "confiavel")
        self.assertIn("oficial do Banco Central Oficial", dados["detalhes"])
