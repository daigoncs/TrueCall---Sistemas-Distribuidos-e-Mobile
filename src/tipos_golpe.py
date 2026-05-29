from flask import Blueprint, jsonify

from src.db import get_db

tipos_golpe_bp = Blueprint("tipos_golpe", __name__, url_prefix="/api/tipos-golpe")

@tipos_golpe_bp.route("", methods=["GET"])
def listar_tipos_golpe():
    db = get_db()

    tipos = db.execute(
        "SELECT id, nome FROM tipo_golpe ORDER BY nome"
    ).fetchall()

    resultado = [{"id": t["id"], "nome": t["nome"]} for t in tipos]

    return jsonify(resultado), 200
