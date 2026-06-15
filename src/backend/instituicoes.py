import logging

from flask import Blueprint, jsonify, request

from src.backend.db import get_db
from src.backend.auth import token_obrigatorio

logger = logging.getLogger(__name__)

instituicoes_bp = Blueprint("instituicoes", __name__, url_prefix="/api/instituicoes")

NUMEROS_PADRAO = [
    { "instituicao": "Banco do Brasil", "numero": "(11) 4004-0001" },
    { "instituicao": "Bradesco", "numero": "(11) 3335-0237" },
    { "instituicao": "Caixa", "numero": "0800 104 0104" },
    { "instituicao": "Itaú", "numero": "(11) 4004-4828" },
    { "instituicao": "Santander", "numero": "(11) 4004-3535" },
    { "instituicao": "Nubank", "numero": "(11) 4020-0185" },
    { "instituicao": "Inter", "numero": "(31) 3003-4070" },
    { "instituicao": "Mercado Pago", "numero": "(11) 96172-0262" },
    { "instituicao": "PicPay", "numero": "(11) 97631-1656" }
]

@instituicoes_bp.route("", methods=["GET"])
def listar_instituicoes():
    db = get_db()

    instituicoes = db.execute(
        "SELECT id, nome FROM instituicao ORDER BY nome"
    ).fetchall()

    resultado = [{"id": i["id"], "nome": i["nome"]} for i in instituicoes]

    return jsonify(resultado), 200

@instituicoes_bp.route("/confiaveis", methods=["GET"])
@token_obrigatorio
def listar_confiaveis(usuario_id):
    db = get_db()

    numeros = db.execute(
        "SELECT id, instituicao, numero FROM numero_confiavel WHERE usuario_id = ? ORDER BY id",
        (usuario_id,)
    ).fetchall()

    if not numeros:
        for item in NUMEROS_PADRAO:
            try:
                db.execute(
                    "INSERT INTO numero_confiavel (instituicao, numero, usuario_id) VALUES (?, ?, ?)",
                    (item["instituicao"], item["numero"], usuario_id)
                )
            except db.IntegrityError:
                pass
            except Exception as e:
                logger.warning("Erro ao inserir número padrão '%s': %s", item["instituicao"], e)
        db.commit()

        numeros = db.execute(
            "SELECT id, instituicao, numero FROM numero_confiavel WHERE usuario_id = ? ORDER BY id",
            (usuario_id,)
        ).fetchall()

    resultado = [{"id": n["id"], "instituicao": n["instituicao"], "numero": n["numero"]} for n in numeros]
    return jsonify(resultado), 200

@instituicoes_bp.route("/confiaveis", methods=["POST"])
@token_obrigatorio
def adicionar_confiavel(usuario_id):
    dados = request.get_json()

    if not dados or not dados.get("instituicao") or not dados.get("numero"):
        return jsonify({"erro": "Campos 'instituição' e 'número' são obrigatórios"}), 400

    instituicao = dados["instituicao"].strip()
    numero = dados["numero"].strip()

    db = get_db()

    try:
        cursor = db.execute(
            "INSERT INTO numero_confiavel (instituicao, numero, usuario_id) VALUES (?, ?, ?)",
            (instituicao, numero, usuario_id)
        )
        db.commit()

        return jsonify({
            "mensagem": "Número confiável adicionado com sucesso",
            "id": cursor.lastrowid,
            "instituicao": instituicao,
            "numero": numero
        }), 201

    except db.IntegrityError:
        return jsonify({"erro": "Este número já está cadastrado para esta instituição"}), 409

    except Exception as e:
        logger.exception("Erro ao adicionar número confiável: %s", e)
        return jsonify({"erro": "Erro interno ao adicionar número confiável"}), 500

@instituicoes_bp.route("/confiaveis/<int:id>", methods=["DELETE"])
@token_obrigatorio
def deletar_confiavel(id, usuario_id):
    db = get_db()

    try:
        resultado = db.execute(
            "DELETE FROM numero_confiavel WHERE id = ? AND usuario_id = ?",
            (id, usuario_id)
        )
        db.commit()
    except Exception as e:
        logger.exception("Erro ao deletar número confiável id=%s: %s", id, e)
        return jsonify({"erro": "Erro interno ao remover número confiável"}), 500

    if resultado.rowcount == 0:
        return jsonify({"erro": "Número confiável não encontrado"}), 404

    return jsonify({"mensagem": "Número confiável removido com sucesso"}), 200
