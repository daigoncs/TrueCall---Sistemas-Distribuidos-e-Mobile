import logging
from flask import Blueprint, request, jsonify

from src.backend.db import get_db
from src.backend.auth import token_obrigatorio

logger = logging.getLogger(__name__)
denuncias_bp = Blueprint("denuncias", __name__, url_prefix="/api/denuncias")

# ---------------------------------------------------------------------------
# Listagem com paginação
# ---------------------------------------------------------------------------

@denuncias_bp.route("", methods=["GET"])
@token_obrigatorio
def listar_denuncias(usuario_id):
    """
    GET /api/denuncias?pagina=1&por_pagina=10
    Retorna denúncias do usuário autenticado com paginação.
    """
    db = get_db()

    try:
        pagina     = max(1, int(request.args.get("pagina", 1)))
        por_pagina = min(100, max(1, int(request.args.get("por_pagina", 10))))
    except ValueError:
        return jsonify({"erro": "Parâmetros de paginação inválidos"}), 400

    offset = (pagina - 1) * por_pagina

    total = db.execute(
        "SELECT COUNT(*) FROM denuncia WHERE usuario_id = ?", (usuario_id,)
    ).fetchone()[0]

    denuncias = db.execute(
        """
        SELECT
            d.id,
            d.telefone,
            d.descricao,
            d.data_denuncia,
            d.instituicao_personalizada,
            d.tipo_golpe_personalizado,
            d.instituicao_id,
            d.tipo_golpe_id,
            d.estado,
            i.nome AS instituicao,
            t.nome AS tipo_golpe,
            (SELECT COUNT(*) FROM voto_denuncia v WHERE v.denuncia_id = d.id) AS votos,
            EXISTS(
                SELECT 1 FROM voto_denuncia v
                WHERE v.denuncia_id = d.id AND v.usuario_id = ?
            ) AS votou
        FROM denuncia d
        JOIN instituicao i ON d.instituicao_id = i.id
        JOIN tipo_golpe t  ON d.tipo_golpe_id  = t.id
        WHERE d.usuario_id = ?
        ORDER BY d.data_denuncia DESC
        LIMIT ? OFFSET ?
        """,
        (usuario_id, usuario_id, por_pagina, offset)
    ).fetchall()

    resultado = [_serializar_denuncia(d) for d in denuncias]

    return jsonify({
        "dados": resultado,
        "paginacao": {
            "total": total,
            "paginas": max(1, -(-total // por_pagina)),  # divisão ceiling
            "pagina_atual": pagina,
            "por_pagina": por_pagina
        }
    }), 200


# ---------------------------------------------------------------------------
# Criar denúncia
# ---------------------------------------------------------------------------

@denuncias_bp.route("", methods=["POST"])
@token_obrigatorio
def criar_denuncia(usuario_id):
    dados = request.get_json()

    campos = ["telefone", "descricao", "instituicao_id", "tipo_golpe_id"]
    for campo in campos:
        if not dados or not dados.get(campo):
            return jsonify({"erro": f"Campo '{campo}' é obrigatório"}), 400

    telefone              = dados["telefone"].strip()
    descricao             = dados["descricao"].strip()
    instituicao_id        = dados["instituicao_id"]
    tipo_golpe_id         = dados["tipo_golpe_id"]
    instituicao_personalizada = dados.get("instituicao_personalizada")
    tipo_golpe_personalizado  = dados.get("tipo_golpe_personalizado")
    estado                    = dados.get("estado")

    if len(telefone) > 30:
        return jsonify({"erro": "O telefone deve ter no máximo 30 caracteres"}), 400
    if len(descricao) > 500:
        return jsonify({"erro": "A descrição deve ter no máximo 500 caracteres"}), 400

    if instituicao_personalizada:
        instituicao_personalizada = instituicao_personalizada.strip()
    if tipo_golpe_personalizado:
        tipo_golpe_personalizado = tipo_golpe_personalizado.strip()
    if estado:
        estado = estado.strip().upper()
        if len(estado) != 2:
            return jsonify({"erro": "O estado deve conter exatamente 2 caracteres (sigla UF)"}), 400

    db = get_db()

    if not db.execute("SELECT id FROM instituicao WHERE id = ?", (instituicao_id,)).fetchone():
        return jsonify({"erro": "Instituição não encontrada"}), 404

    if not db.execute("SELECT id FROM tipo_golpe WHERE id = ?", (tipo_golpe_id,)).fetchone():
        return jsonify({"erro": "Tipo de golpe não encontrado"}), 404

    try:
        cursor = db.execute(
            """
            INSERT INTO denuncia
                (telefone, descricao, usuario_id, instituicao_id,
                 instituicao_personalizada, tipo_golpe_id, tipo_golpe_personalizado, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (telefone, descricao, usuario_id, instituicao_id,
             instituicao_personalizada, tipo_golpe_id, tipo_golpe_personalizado, estado)
        )
        db.commit()
        logger.info("Denúncia criada: telefone=%s usuario=%s", telefone, usuario_id)

        return jsonify({
            "mensagem": "Denúncia registrada com sucesso",
            "denuncia": {
                "id": cursor.lastrowid,
                "telefone": telefone,
                "descricao": descricao,
                "instituicao_id": instituicao_id,
                "tipo_golpe_id": tipo_golpe_id,
                "tipo_golpe_personalizado": tipo_golpe_personalizado,
                "estado": estado
            }
        }), 201

    except db.IntegrityError:
        return jsonify({
            "erro": "Você já registrou uma denúncia para este número de telefone"
        }), 409


# ---------------------------------------------------------------------------
# Detalhe de denúncia
# ---------------------------------------------------------------------------

@denuncias_bp.route("/<int:denuncia_id>", methods=["GET"])
@token_obrigatorio
def detalhe_denuncia(denuncia_id, usuario_id):
    db = get_db()

    denuncia = _buscar_denuncia_do_usuario(db, denuncia_id, usuario_id)
    if not denuncia:
        return jsonify({"erro": "Denúncia não encontrada"}), 404

    return jsonify(_serializar_denuncia(denuncia)), 200


# ---------------------------------------------------------------------------
# Editar denúncia — NOVO
# ---------------------------------------------------------------------------

@denuncias_bp.route("/<int:denuncia_id>", methods=["PUT"])
@token_obrigatorio
def editar_denuncia(denuncia_id, usuario_id):
    """
    PUT /api/denuncias/<id>
    Permite editar a descrição, tipo de golpe, tipo de golpe personalizado,
    instituição e instituição personalizada de uma denúncia existente.
    """
    dados = request.get_json()
    if not dados:
        return jsonify({"erro": "Dados não fornecidos"}), 400

    db = get_db()

    denuncia = db.execute(
        "SELECT id FROM denuncia WHERE id = ? AND usuario_id = ?",
        (denuncia_id, usuario_id)
    ).fetchone()

    if not denuncia:
        return jsonify({"erro": "Denúncia não encontrada"}), 404

    campos_update = []
    valores = []

    if "descricao" in dados:
        desc = dados["descricao"]
        if desc is not None:
            desc = desc.strip()
        if not desc:
            return jsonify({"erro": "A descrição não pode ser vazia"}), 400
        campos_update.append("descricao = ?")
        valores.append(desc)

    if "tipo_golpe_id" in dados:
        tg_id = dados["tipo_golpe_id"]
        if not tg_id:
            return jsonify({"erro": "Tipo de golpe inválido"}), 400
        if not db.execute("SELECT id FROM tipo_golpe WHERE id = ?", (tg_id,)).fetchone():
            return jsonify({"erro": "Tipo de golpe não encontrado"}), 404
        campos_update.append("tipo_golpe_id = ?")
        valores.append(tg_id)

    if "tipo_golpe_personalizado" in dados:
        tgp = dados["tipo_golpe_personalizado"]
        if tgp is not None:
            tgp = tgp.strip()
        campos_update.append("tipo_golpe_personalizado = ?")
        valores.append(tgp)

    if "instituicao_id" in dados:
        inst_id = dados["instituicao_id"]
        if not inst_id:
            return jsonify({"erro": "Instituição inválida"}), 400
        if not db.execute("SELECT id FROM instituicao WHERE id = ?", (inst_id,)).fetchone():
            return jsonify({"erro": "Instituição não encontrada"}), 404
        campos_update.append("instituicao_id = ?")
        valores.append(inst_id)

    if "instituicao_personalizada" in dados:
        inst_p = dados["instituicao_personalizada"]
        if inst_p is not None:
            inst_p = inst_p.strip()
        campos_update.append("instituicao_personalizada = ?")
        valores.append(inst_p)

    if "estado" in dados:
        est = dados["estado"]
        if est is not None:
            est = est.strip().upper()
            if est and len(est) != 2:
                return jsonify({"erro": "O estado deve conter exatamente 2 caracteres (sigla UF)"}), 400
        campos_update.append("estado = ?")
        valores.append(est)

    if not campos_update:
        return jsonify({"erro": "Informe ao menos um campo válido para editar"}), 400

    valores.extend([denuncia_id, usuario_id])

    db.execute(
        f"UPDATE denuncia SET {', '.join(campos_update)} WHERE id = ? AND usuario_id = ?",
        valores
    )
    db.commit()
    logger.info("Denúncia editada: id=%s usuario=%s", denuncia_id, usuario_id)

    return jsonify({"mensagem": "Denúncia atualizada com sucesso"}), 200


# ---------------------------------------------------------------------------
# Deletar denúncia
# ---------------------------------------------------------------------------

@denuncias_bp.route("/<int:denuncia_id>", methods=["DELETE"])
@token_obrigatorio
def deletar_denuncia(denuncia_id, usuario_id):
    db = get_db()

    resultado = db.execute(
        "DELETE FROM denuncia WHERE id = ? AND usuario_id = ?",
        (denuncia_id, usuario_id)
    )
    db.commit()

    if resultado.rowcount == 0:
        return jsonify({"erro": "Denúncia não encontrada"}), 404

    return jsonify({"mensagem": "Denúncia removida com sucesso"}), 200


# ---------------------------------------------------------------------------
# Estatísticas — NOVO
# ---------------------------------------------------------------------------

@denuncias_bp.route("/stats", methods=["GET"])
@token_obrigatorio
def estatisticas(usuario_id):
    """
    GET /api/denuncias/stats
    Retorna totais agregados das denúncias do usuário.
    """
    db = get_db()

    total = db.execute(
        "SELECT COUNT(*) FROM denuncia WHERE usuario_id = ?", (usuario_id,)
    ).fetchone()[0]

    por_tipo = db.execute(
        """
        SELECT
            CASE WHEN t.nome = 'Outro' AND d.tipo_golpe_personalizado IS NOT NULL
                 THEN d.tipo_golpe_personalizado
                 ELSE t.nome
            END AS nome,
            COUNT(*) AS total
        FROM denuncia d
        JOIN tipo_golpe t ON d.tipo_golpe_id = t.id
        WHERE d.usuario_id = ?
        GROUP BY nome
        ORDER BY total DESC
        """,
        (usuario_id,)
    ).fetchall()

    por_instituicao = db.execute(
        """
        SELECT
            CASE WHEN i.nome = 'Outro' AND d.instituicao_personalizada IS NOT NULL
                 THEN d.instituicao_personalizada
                 ELSE i.nome
            END AS nome,
            COUNT(*) AS total
        FROM denuncia d
        JOIN instituicao i ON d.instituicao_id = i.id
        WHERE d.usuario_id = ?
        GROUP BY nome
        ORDER BY total DESC
        """,
        (usuario_id,)
    ).fetchall()

    por_mes = db.execute(
        """
        SELECT
            strftime('%Y-%m', data_denuncia) AS mes,
            COUNT(*) AS total
        FROM denuncia
        WHERE usuario_id = ?
        GROUP BY mes
        ORDER BY mes DESC
        LIMIT 12
        """,
        (usuario_id,)
    ).fetchall()

    por_estado = db.execute(
        """
        SELECT
            estado AS nome,
            COUNT(*) AS total
        FROM denuncia
        WHERE usuario_id = ? AND estado IS NOT NULL AND estado != ''
        GROUP BY nome
        ORDER BY total DESC
        """,
        (usuario_id,)
    ).fetchall()

    return jsonify({
        "total": total,
        "por_tipo": [{"nome": r["nome"], "total": r["total"]} for r in por_tipo],
        "por_instituicao": [{"nome": r["nome"], "total": r["total"]} for r in por_instituicao],
        "por_mes": [{"mes": r["mes"], "total": r["total"]} for r in por_mes],
        "por_estado": [{"nome": r["nome"], "total": r["total"]} for r in por_estado]
    }), 200


# ---------------------------------------------------------------------------
# Votos em denúncias — NOVO
# ---------------------------------------------------------------------------

@denuncias_bp.route("/<int:denuncia_id>/votar", methods=["POST"])
@token_obrigatorio
def votar_denuncia(denuncia_id, usuario_id):
    """
    POST /api/denuncias/<id>/votar
    Registra que o usuário autenticado confirma esta denúncia.
    Um usuário não pode votar na própria denúncia.
    """
    db = get_db()

    denuncia = db.execute(
        "SELECT usuario_id FROM denuncia WHERE id = ?", (denuncia_id,)
    ).fetchone()

    if not denuncia:
        return jsonify({"erro": "Denúncia não encontrada"}), 404

    if denuncia["usuario_id"] == usuario_id:
        return jsonify({"erro": "Você não pode votar na própria denúncia"}), 403

    try:
        db.execute(
            "INSERT INTO voto_denuncia (denuncia_id, usuario_id) VALUES (?, ?)",
            (denuncia_id, usuario_id)
        )
        db.commit()
    except db.IntegrityError:
        return jsonify({"erro": "Você já votou nesta denúncia"}), 409

    votos = db.execute(
        "SELECT COUNT(*) FROM voto_denuncia WHERE denuncia_id = ?", (denuncia_id,)
    ).fetchone()[0]

    return jsonify({"mensagem": "Voto registrado com sucesso", "votos": votos}), 201


@denuncias_bp.route("/<int:denuncia_id>/votar", methods=["DELETE"])
@token_obrigatorio
def remover_voto(denuncia_id, usuario_id):
    """
    DELETE /api/denuncias/<id>/votar
    Remove o voto do usuário autenticado nesta denúncia.
    """
    db = get_db()

    resultado = db.execute(
        "DELETE FROM voto_denuncia WHERE denuncia_id = ? AND usuario_id = ?",
        (denuncia_id, usuario_id)
    )
    db.commit()

    if resultado.rowcount == 0:
        return jsonify({"erro": "Voto não encontrado"}), 404

    votos = db.execute(
        "SELECT COUNT(*) FROM voto_denuncia WHERE denuncia_id = ?", (denuncia_id,)
    ).fetchone()[0]

    return jsonify({"mensagem": "Voto removido com sucesso", "votos": votos}), 200


# ---------------------------------------------------------------------------
# Consulta pública (com fix de segurança)
# ---------------------------------------------------------------------------

@denuncias_bp.route("/publico/verificar/<string:telefone>", methods=["GET"])
def verificar_telefone_publico(telefone):
    telefone_limpo = "".join([c for c in telefone if c.isdigit()])

    # Sanitização: máximo 15 dígitos (padrão E.164 internacional)
    if not telefone_limpo or len(telefone_limpo) > 15:
        return jsonify({"erro": "Número de telefone inválido"}), 400

    db = get_db()

    oficiais = db.execute(
        "SELECT DISTINCT instituicao, numero FROM numero_confiavel"
    ).fetchall()
    for o in oficiais:
        num_oficial_limpo = "".join([c for c in o["numero"] if c.isdigit()])
        coincide = False

        if num_oficial_limpo == telefone_limpo:
            coincide = True
        elif len(num_oficial_limpo) == 8 and len(telefone_limpo) >= 10 and telefone_limpo.endswith(num_oficial_limpo):
            coincide = True
        elif len(telefone_limpo) == 8 and len(num_oficial_limpo) >= 10 and num_oficial_limpo.endswith(telefone_limpo):
            coincide = True

        if coincide:
            return jsonify({
                "status": "confiavel",
                "detalhes": f"Este número é oficial do {o['instituicao']}."
            }), 200

    # FIX CRÍTICO: filtro no SQL em vez de carregar tudo em memória
    resultado = db.execute(
        """
        SELECT
            d.instituicao_personalizada,
            i.nome AS instituicao,
            COUNT(*) AS total,
            SUM(
                (SELECT COUNT(*) FROM voto_denuncia v WHERE v.denuncia_id = d.id)
            ) AS confirmacoes
        FROM denuncia d
        JOIN instituicao i ON d.instituicao_id = i.id
        WHERE REPLACE(REPLACE(REPLACE(REPLACE(d.telefone, '-', ''), ' ', ''), '(', ''), ')', '') = ?
        GROUP BY d.instituicao_id, d.instituicao_personalizada
        """,
        (telefone_limpo,)
    ).fetchone()

    if resultado and resultado["total"] > 0:
        inst = (
            resultado["instituicao_personalizada"]
            if resultado["instituicao"] == "Outro" and resultado["instituicao_personalizada"]
            else resultado["instituicao"]
        )
        inst_texto = f" se passando por {inst}" if inst and inst != "Outro" else ""
        confirmacoes = resultado["confirmacoes"] or 0

        # Busca os tipos de golpe distintos associados a este número
        tipos_bd = db.execute(
            """
            SELECT DISTINCT t.nome AS tipo_nome, d.tipo_golpe_personalizado
            FROM denuncia d
            JOIN tipo_golpe t ON d.tipo_golpe_id = t.id
            WHERE REPLACE(REPLACE(REPLACE(REPLACE(d.telefone, '-', ''), ' ', ''), '(', ''), ')', '') = ?
            """,
            (telefone_limpo,)
        ).fetchall()

        tipos = []
        for row in tipos_bd:
            if row["tipo_nome"] == "Outro" and row["tipo_golpe_personalizado"]:
                tipos.append(row["tipo_golpe_personalizado"])
            else:
                tipos.append(row["tipo_nome"])

        return jsonify({
            "status": "suspeito",
            "detalhes": (
                f"Atenção! Este número possui {resultado['total']} denúncia(s) de golpe "
                f"registrada(s){inst_texto}."
            ),
            "confirmacoes": confirmacoes,
            "tipos_golpe": tipos
        }), 200

    return jsonify({
        "status": "desconhecido",
        "detalhes": "Nenhum registro de golpe ou de canal oficial encontrado para este número."
    }), 200


@denuncias_bp.route("/publico/recentes", methods=["GET"])
def listar_denuncias_recentes_publico():
    db = get_db()
    recentes = db.execute(
        """
        SELECT 
            d.telefone,
            d.descricao,
            d.data_denuncia,
            d.estado,
            i.nome AS instituicao,
            d.instituicao_personalizada,
            t.nome AS tipo_golpe,
            d.tipo_golpe_personalizado
        FROM denuncia d
        JOIN instituicao i ON d.instituicao_id = i.id
        JOIN tipo_golpe t ON d.tipo_golpe_id = t.id
        ORDER BY d.data_denuncia DESC
        LIMIT 15
        """
    ).fetchall()

    resposta = []
    for r in recentes:
        inst = r["instituicao_personalizada"] if r["instituicao"] == "Outro" and r["instituicao_personalizada"] else r["instituicao"]
        tipo = r["tipo_golpe_personalizado"] if r["tipo_golpe"] == "Outro" and r["tipo_golpe_personalizado"] else r["tipo_golpe"]

        resposta.append({
            "telefone": r["telefone"],
            "descricao": r["descricao"],
            "data_denuncia": r["data_denuncia"],
            "estado": r["estado"],
            "instituicao": inst,
            "tipo_golpe": tipo
        })

    return jsonify(resposta), 200


# ---------------------------------------------------------------------------
# Helpers internos
# ---------------------------------------------------------------------------

def _buscar_denuncia_do_usuario(db, denuncia_id, usuario_id):
    return db.execute(
        """
        SELECT
            d.id, d.telefone, d.descricao, d.data_denuncia,
            d.instituicao_personalizada,
            d.tipo_golpe_personalizado,
            d.instituicao_id,
            d.tipo_golpe_id,
            d.estado,
            i.nome AS instituicao,
            t.nome AS tipo_golpe,
            (SELECT COUNT(*) FROM voto_denuncia v WHERE v.denuncia_id = d.id) AS votos,
            EXISTS(
                SELECT 1 FROM voto_denuncia v
                WHERE v.denuncia_id = d.id AND v.usuario_id = ?
            ) AS votou
        FROM denuncia d
        JOIN instituicao i ON d.instituicao_id = i.id
        JOIN tipo_golpe t  ON d.tipo_golpe_id  = t.id
        WHERE d.id = ? AND d.usuario_id = ?
        """,
        (usuario_id, denuncia_id, usuario_id)
    ).fetchone()


def _serializar_denuncia(d):
    return {
        "id": d["id"],
        "telefone": d["telefone"],
        "descricao": d["descricao"],
        "data_denuncia": d["data_denuncia"],
        "instituicao_id": d["instituicao_id"],
        "instituicao": d["instituicao"],
        "instituicao_personalizada": d["instituicao_personalizada"],
        "tipo_golpe_id": d["tipo_golpe_id"],
        "tipo_golpe": d["tipo_golpe"],
        "tipo_golpe_personalizado": d["tipo_golpe_personalizado"],
        "estado": d["estado"],
        "votos": d["votos"],
        "votou": bool(d["votou"])
    }
