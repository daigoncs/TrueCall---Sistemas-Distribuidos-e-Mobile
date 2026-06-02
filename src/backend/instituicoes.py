from flask import Blueprint, jsonify

from src.db import get_db

instituicoes_bp = Blueprint("instituicoes", __name__, url_prefix="/api/instituicoes")

@instituicoes_bp.route("", methods=["GET"])
def listar_instituicoes():
    db = get_db()

    instituicoes = db.execute(
        "SELECT id, nome FROM instituicao ORDER BY nome"
    ).fetchall()

    resultado = [{"id": i["id"], "nome": i["nome"]} for i in instituicoes]

    return jsonify(resultado), 200
