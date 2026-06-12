from tests.base import BaseTestCase

class TestDenunciasAPI(BaseTestCase):

    # ------------------------------------------------------------------
    # Listagem e paginação
    # ------------------------------------------------------------------

    def test_listar_denuncias_sem_token(self):
        """Garante que a rota de listagem recusa requisições sem token (401)."""
        resposta = self.client.get("/api/denuncias")
        self.assertEqual(resposta.status_code, 401)

    def test_listar_denuncias_com_paginacao(self):
        """Garante que a resposta inclui metadados de paginação."""
        token = self.registrar_e_logar()

        resposta = self.client.get(
            "/api/denuncias?pagina=1&por_pagina=5",
            headers={"Authorization": f"Bearer {token}"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertIn("dados", dados)
        self.assertIn("paginacao", dados)
        self.assertEqual(dados["paginacao"]["pagina_atual"], 1)
        self.assertEqual(dados["paginacao"]["por_pagina"], 5)

    # ------------------------------------------------------------------
    # Criar
    # ------------------------------------------------------------------

    def test_criar_denuncia_sucesso(self):
        """Garante o cadastro de uma denúncia com sucesso."""
        token = self.registrar_e_logar()

        resposta = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 99999-9999",
                "descricao": "Ligaram fingindo ser do suporte do banco.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(dados["mensagem"], "Denúncia registrada com sucesso")
        self.assertEqual(dados["denuncia"]["telefone"], "(11) 99999-9999")

    def test_criar_denuncia_campos_obrigatorios(self):
        """Garante erro 400 se campos obrigatórios estiverem em falta."""
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
        self.assertIn("obrigatório", dados["erro"])

    # ------------------------------------------------------------------
    # Editar — NOVO
    # ------------------------------------------------------------------

    def test_editar_denuncia_sucesso(self):
        """Valida que o dono da denúncia consegue editar a descrição."""
        token = self.registrar_e_logar()

        res_criar = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 91111-1111",
                "descricao": "Descrição original.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]

        resposta = self.client.put(f"/api/denuncias/{denuncia_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={"descricao": "Descrição corrigida."}
        )
        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(resposta.get_json()["mensagem"], "Denúncia atualizada com sucesso")

    def test_editar_denuncia_de_outro_usuario(self):
        """Garante que um usuário não edita denúncia de outro (404)."""
        token_a = self.registrar_e_logar(email="a@test.com")
        token_b = self.registrar_e_logar(email="b@test.com")

        res_criar = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token_a}"},
            json={
                "telefone": "(11) 92222-2222",
                "descricao": "Denúncia do usuário A.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]

        resposta = self.client.put(f"/api/denuncias/{denuncia_id}",
            headers={"Authorization": f"Bearer {token_b}"},
            json={"descricao": "Tentativa de edição pelo usuário B."}
        )
        self.assertEqual(resposta.status_code, 404)

    def test_editar_denuncia_sem_campos(self):
        """Garante que PUT sem campos válidos retorna 400."""
        token = self.registrar_e_logar()

        res_criar = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 93333-3333",
                "descricao": "Descrição.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]

        resposta = self.client.put(f"/api/denuncias/{denuncia_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={}
        )
        self.assertEqual(resposta.status_code, 400)

    # ------------------------------------------------------------------
    # Deletar
    # ------------------------------------------------------------------

    def test_excluir_denuncia_sucesso(self):
        """Valida a exclusão de uma denúncia cadastrada."""
        token = self.registrar_e_logar()

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

        res_deletar = self.client.delete(f"/api/denuncias/{denuncia_id}",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(res_deletar.status_code, 200)

        res_listar = self.client.get("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"}
        )
        lista = res_listar.get_json()
        self.assertEqual(len(lista["dados"]), 0)

    # ------------------------------------------------------------------
    # Estatísticas — NOVO
    # ------------------------------------------------------------------

    def test_stats_retorna_estrutura_correta(self):
        """Garante que /stats retorna as chaves esperadas."""
        token = self.registrar_e_logar()

        resposta = self.client.get("/api/denuncias/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertIn("total", dados)
        self.assertIn("por_tipo", dados)
        self.assertIn("por_instituicao", dados)
        self.assertIn("por_mes", dados)

    def test_stats_contabiliza_denuncia(self):
        """Garante que a denúncia criada aparece corretamente nas stats."""
        token = self.registrar_e_logar()

        self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 94444-4444",
                "descricao": "Golpe de Pix.",
                "instituicao_id": 1,
                "tipo_golpe_id": 2
            }
        )

        resposta = self.client.get("/api/denuncias/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        dados = resposta.get_json()

        self.assertEqual(dados["total"], 1)
        self.assertEqual(dados["por_tipo"][0]["nome"], "PIX Fraudulento")
        self.assertEqual(dados["por_tipo"][0]["total"], 1)

    # ------------------------------------------------------------------
    # Votos — NOVO
    # ------------------------------------------------------------------

    def test_votar_denuncia_sucesso(self):
        """Usuário B vota na denúncia do usuário A com sucesso."""
        token_a = self.registrar_e_logar(email="votante_a@test.com")
        token_b = self.registrar_e_logar(email="votante_b@test.com")

        res_criar = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token_a}"},
            json={
                "telefone": "(11) 95555-5555",
                "descricao": "Golpe denunciado por A.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]

        resposta = self.client.post(f"/api/denuncias/{denuncia_id}/votar",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(dados["votos"], 1)

    def test_votar_propria_denuncia_proibido(self):
        """Garante que o dono não vota na própria denúncia (403)."""
        token = self.registrar_e_logar()

        res_criar = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 96666-6666",
                "descricao": "Tentativa.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]

        resposta = self.client.post(f"/api/denuncias/{denuncia_id}/votar",
            headers={"Authorization": f"Bearer {token}"}
        )
        self.assertEqual(resposta.status_code, 403)

    def test_voto_duplicado_proibido(self):
        """Garante que o mesmo usuário não vota duas vezes (409)."""
        token_a = self.registrar_e_logar(email="duplo_a@test.com")
        token_b = self.registrar_e_logar(email="duplo_b@test.com")

        res_criar = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token_a}"},
            json={
                "telefone": "(11) 97777-7777",
                "descricao": "Denúncia.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]

        self.client.post(f"/api/denuncias/{denuncia_id}/votar",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        resposta = self.client.post(f"/api/denuncias/{denuncia_id}/votar",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        self.assertEqual(resposta.status_code, 409)

    def test_remover_voto_sucesso(self):
        """Garante que o voto pode ser removido com DELETE."""
        token_a = self.registrar_e_logar(email="rem_a@test.com")
        token_b = self.registrar_e_logar(email="rem_b@test.com")

        res_criar = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token_a}"},
            json={
                "telefone": "(11) 90000-0000",
                "descricao": "Denúncia.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]

        self.client.post(f"/api/denuncias/{denuncia_id}/votar",
            headers={"Authorization": f"Bearer {token_b}"}
        )

        resposta = self.client.delete(f"/api/denuncias/{denuncia_id}/votar",
            headers={"Authorization": f"Bearer {token_b}"}
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(dados["votos"], 0)

    # ------------------------------------------------------------------
    # Verificação pública
    # ------------------------------------------------------------------

    def test_verificar_telefone_publico_desconhecido(self):
        """Telefone sem denúncias retorna desconhecido."""
        resposta = self.client.get("/api/denuncias/publico/verificar/11911112222")
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(dados["status"], "desconhecido")

    def test_verificar_telefone_publico_suspeito(self):
        """Telefone denunciado retorna suspeito."""
        token = self.registrar_e_logar()

        self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 97654-3210",
                "descricao": "Pix falso",
                "instituicao_id": 1,
                "tipo_golpe_id": 2
            }
        )

        resposta = self.client.get("/api/denuncias/publico/verificar/11976543210")
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(dados["status"], "suspeito")
        self.assertIn("1 denúncia", dados["detalhes"])
        self.assertIn("tipos_golpe", dados)
        self.assertEqual(dados["tipos_golpe"], ["PIX Fraudulento"])

    def test_verificar_telefone_publico_confiavel(self):
        """Número confiável cadastrado retorna confiavel."""
        token = self.registrar_e_logar()

        self.client.post("/api/instituicoes/confiaveis",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "instituicao": "Banco Central Oficial",
                "numero": "0800 999 9999"
            }
        )

        resposta = self.client.get("/api/denuncias/publico/verificar/08009999999")
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertEqual(dados["status"], "confiavel")

    def test_verificar_telefone_muito_longo(self):
        """Telefone com mais de 15 dígitos retorna erro 400 (sanitização)."""
        resposta = self.client.get("/api/denuncias/publico/verificar/1234567890123456")
        self.assertEqual(resposta.status_code, 400)

    def test_listar_denuncias_recentes_publico(self):
        """Garante a listagem pública de denúncias recentes de forma anônima."""
        token = self.registrar_e_logar()

        # Cadastra uma denúncia de teste
        self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 95555-4444",
                "descricao": "Golpe do Pix recente",
                "instituicao_id": 1,
                "tipo_golpe_id": 2,
                "estado": "SP"
            }
        )

        resposta = self.client.get("/api/denuncias/publico/recentes")
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertIsInstance(dados, list)
        self.assertTrue(len(dados) > 0)

        # Garante que os dados do golpe e do telefone estão presentes
        primeira = dados[0]
        self.assertEqual(primeira["telefone"], "(11) 95555-4444")
        self.assertEqual(primeira["descricao"], "Golpe do Pix recente")
        self.assertEqual(primeira["tipo_golpe"], "PIX Fraudulento")

        # Garante que nenhum dado do denunciante foi vazado
        self.assertNotIn("usuario_id", primeira)
        self.assertNotIn("usuario", primeira)

    def test_criar_denuncia_tipo_golpe_personalizado(self):
        """Garante a criação de denúncia com tipo de golpe personalizado."""
        token = self.registrar_e_logar()

        # Tipo de golpe 5 é "Outro" de acordo com o seed.sql
        resposta = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 98765-4321",
                "descricao": "Ligação suspeita.",
                "instituicao_id": 1,
                "tipo_golpe_id": 5,
                "tipo_golpe_personalizado": "Golpe do Falso Envio"
            }
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(dados["denuncia"]["tipo_golpe_personalizado"], "Golpe do Falso Envio")

        # Verifica na listagem se o tipo personalizado é retornado
        lista_res = self.client.get("/api/denuncias", headers={"Authorization": f"Bearer {token}"})
        lista_dados = lista_res.get_json()
        self.assertEqual(lista_dados["dados"][0]["tipo_golpe_personalizado"], "Golpe do Falso Envio")

    def test_editar_denuncia_todos_os_campos(self):
        """Garante a edição de todos os campos editáveis da denúncia."""
        token = self.registrar_e_logar()

        res_criar = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 98111-2222",
                "descricao": "Descrição antiga.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]

        resposta = self.client.put(f"/api/denuncias/{denuncia_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "descricao": "Descrição totalmente nova.",
                "instituicao_id": 2,
                "tipo_golpe_id": 5,
                "tipo_golpe_personalizado": "Novo Golpe Customizado"
            }
        )
        self.assertEqual(resposta.status_code, 200)

        # Busca detalhe da denúncia e valida os valores atualizados
        detalhe_res = self.client.get(f"/api/denuncias/{denuncia_id}", headers={"Authorization": f"Bearer {token}"})
        detalhe_dados = detalhe_res.get_json()
        self.assertEqual(detalhe_dados["descricao"], "Descrição totalmente nova.")
        self.assertEqual(detalhe_dados["instituicao_id"], 2)
        self.assertEqual(detalhe_dados["tipo_golpe_id"], 5)
        self.assertEqual(detalhe_dados["tipo_golpe_personalizado"], "Novo Golpe Customizado")

    def test_criar_denuncia_com_estado(self):
        """Garante a criação de denúncia contendo o estado (UF)."""
        token = self.registrar_e_logar()

        resposta = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 98222-3333",
                "descricao": "Ligação fraudulenta recebida em SP.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1,
                "estado": "sp"
            }
        )
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 201)
        self.assertEqual(dados["denuncia"]["estado"], "SP")

    def test_criar_denuncia_com_estado_invalido(self):
        """Garante que siglas de estado inválidas (tamanho != 2) retornam 400."""
        token = self.registrar_e_logar()

        resposta = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 98333-4444",
                "descricao": "Teste com estado longo.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1,
                "estado": "SAO"
            }
        )
        dados = resposta.get_json()
        self.assertEqual(resposta.status_code, 400)
        self.assertIn("erro", dados)

    def test_editar_denuncia_estado(self):
        """Garante a edição do campo estado na denúncia."""
        token = self.registrar_e_logar()

        res_criar = self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 98444-5555",
                "descricao": "Descrição.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1,
                "estado": "RJ"
            }
        )
        denuncia_id = res_criar.get_json()["denuncia"]["id"]

        resposta = self.client.put(f"/api/denuncias/{denuncia_id}",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "estado": "MG"
            }
        )
        self.assertEqual(resposta.status_code, 200)

        detalhe_res = self.client.get(f"/api/denuncias/{denuncia_id}", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(detalhe_res.get_json()["estado"], "MG")

    def test_estatisticas_por_estado(self):
        """Garante que a contagem por estado é retornada corretamente nas estatísticas."""
        token = self.registrar_e_logar()

        # Cria denúncia no estado SP
        self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(11) 98555-6666",
                "descricao": "Descrição 1.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1,
                "estado": "SP"
            }
        )

        # Cria denúncia no estado RJ
        self.client.post("/api/denuncias",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "telefone": "(21) 98666-7777",
                "descricao": "Descrição 2.",
                "instituicao_id": 1,
                "tipo_golpe_id": 1,
                "estado": "RJ"
            }
        )

        resposta = self.client.get("/api/denuncias/stats", headers={"Authorization": f"Bearer {token}"})
        dados = resposta.get_json()

        self.assertEqual(resposta.status_code, 200)
        self.assertIn("por_estado", dados)
        
        # Filtra os estados retornados e valida a contagem
        estados_retornados = {item["nome"]: item["total"] for item in dados["por_estado"]}
        self.assertEqual(estados_retornados.get("SP"), 1)
        self.assertEqual(estados_retornados.get("RJ"), 1)

