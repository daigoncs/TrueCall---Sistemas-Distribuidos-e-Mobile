from flask import Blueprint, request, jsonify

from src.backend.db import get_db
from src.backend.auth import token_obrigatorio

denuncias_bp = Blueprint("denuncias", __name__, url_prefix="/api/denuncias")

@denuncias_bp.route("", methods=["GET"])
@token_obrigatorio
def listar_denuncias(usuario_id):
    db = get_db()

    denuncias = db.execute(
        """
        SELECT
            d.id,
            d.telefone,
            d.descricao,
            d.data_denuncia,
            d.instituicao_personalizada,
            i.nome AS instituicao,
            t.nome AS tipo_golpe
        FROM denuncia d
        JOIN instituicao i ON d.instituicao_id = i.id
        JOIN tipo_golpe t  ON d.tipo_golpe_id = t.id
        WHERE d.usuario_id = ?
        ORDER BY d.data_denuncia DESC
        """,
        (usuario_id,)
    ).fetchall()

    resultado = []
    for d in denuncias:
        resultado.append({
            "id": d["id"],
            "telefone": d["telefone"],
            "descricao": d["descricao"],
            "data_denuncia": d["data_denuncia"],
            "instituicao": d["instituicao"],
            "instituicao_personalizada": d["instituicao_personalizada"],
            "tipo_golpe": d["tipo_golpe"]
        })

    return jsonify(resultado), 200

@denuncias_bp.route("", methods=["POST"])
@token_obrigatorio
def criar_denuncia(usuario_id):
    dados = request.get_json()

    campos = ["telefone", "descricao", "instituicao_id", "tipo_golpe_id"]
    for campo in campos:
        if not dados or not dados.get(campo):
            return jsonify({"erro": f"Campo '{campo}' é obrigatório"}), 400

    telefone = dados["telefone"].strip()
    descricao = dados["descricao"].strip()
    instituicao_id = dados["instituicao_id"]
    tipo_golpe_id = dados["tipo_golpe_id"]
    instituicao_personalizada = dados.get("instituicao_personalizada")

    if instituicao_personalizada:
        instituicao_personalizada = instituicao_personalizada.strip()

    db = get_db()

    inst = db.execute(
        "SELECT id FROM instituicao WHERE id = ?", (instituicao_id,)
    ).fetchone()
    if not inst:
        return jsonify({"erro": "Instituição não encontrada"}), 404

    tipo = db.execute(
        "SELECT id FROM tipo_golpe WHERE id = ?", (tipo_golpe_id,)
    ).fetchone()
    if not tipo:
        return jsonify({"erro": "Tipo de golpe não encontrado"}), 404

    try:
        cursor = db.execute(
            """
            INSERT INTO denuncia
                (telefone, descricao, usuario_id, instituicao_id,
                 instituicao_personalizada, tipo_golpe_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (telefone, descricao, usuario_id, instituicao_id,
             instituicao_personalizada, tipo_golpe_id)
        )
        db.commit()

        return jsonify({
            "mensagem": "Denúncia registrada com sucesso",
            "denuncia": {
                "id": cursor.lastrowid,
                "telefone": telefone,
                "descricao": descricao,
                "instituicao_id": instituicao_id,
                "tipo_golpe_id": tipo_golpe_id
            }
        }), 201

    except db.IntegrityError:
        return jsonify({
            "erro": "Você já registrou uma denúncia para este número de telefone"
        }), 409

@denuncias_bp.route("/<int:denuncia_id>", methods=["GET"])
@token_obrigatorio
def detalhe_denuncia(denuncia_id, usuario_id):
    db = get_db()

    denuncia = db.execute(
        """
        SELECT
            d.id,
            d.telefone,
            d.descricao,
            d.data_denuncia,
            d.instituicao_personalizada,
            i.nome AS instituicao,
            t.nome AS tipo_golpe
        FROM denuncia d
        JOIN instituicao i ON d.instituicao_id = i.id
        JOIN tipo_golpe t  ON d.tipo_golpe_id = t.id
        WHERE d.id = ? AND d.usuario_id = ?
        """,
        (denuncia_id, usuario_id)
    ).fetchone()

    if not denuncia:
        return jsonify({"erro": "Denúncia não encontrada"}), 404

    return jsonify({
        "id": denuncia["id"],
        "telefone": denuncia["telefone"],
        "descricao": denuncia["descricao"],
        "data_denuncia": denuncia["data_denuncia"],
        "instituicao": denuncia["instituicao"],
        "instituicao_personalizada": denuncia["instituicao_personalizada"],
        "tipo_golpe": denuncia["tipo_golpe"]
    }), 200

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

@denuncias_bp.route("/publico/verificar/<string:telefone>", methods=["GET"])
def verificar_telefone_publico(telefone):
    telefone_limpo = "".join([c for c in telefone if c.isdigit()])

    if not telefone_limpo:
        return jsonify({"erro": "Número de telefone inválido"}), 400

    db = get_db()

    oficiais = db.execute("SELECT instituicao, numero FROM numero_confiavel").fetchall()
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

    denuncias = db.execute("""
        SELECT d.telefone, d.instituicao_personalizada, i.nome AS instituicao
        FROM denuncia d
        JOIN instituicao i ON d.instituicao_id = i.id
    """).fetchall()

    count_ocorrencias = 0
    instituicao_alvo = None

    for d in denuncias:
        d_tel_limpo = "".join([c for c in d["telefone"] if c.isdigit()])
        if d_tel_limpo == telefone_limpo:
            count_ocorrencias += 1
            if not instituicao_alvo:
                instituicao_alvo = d["instituicao_personalizada"] if d["instituicao"] == "Outro" else d["instituicao"]

    if count_ocorrencias > 0:
        inst_texto = f" se passando por {instituicao_alvo}" if instituicao_alvo else ""
        return jsonify({
            "status": "suspeito",
            "detalhes": f"Atenção! Este número possui {count_ocorrencias} denúncia(s) de golpe registrada(s){inst_texto}."
        }), 200

    return jsonify({
        "status": "desconhecido",
        "detalhes": "Nenhum registro de golpe ou de canal oficial encontrado para este número."
    }), 200
