import functools
from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from src.backend.db import get_db

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

def token_obrigatorio(f):
    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        header = request.headers.get("Authorization", "")

        if not header.startswith("Bearer "):
            return jsonify({"erro": "Token não fornecido"}), 401

        token = header.split(" ")[1]

        try:
            payload = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=["HS256"]
            )
            kwargs["usuario_id"] = payload["usuario_id"]

        except jwt.ExpiredSignatureError:
            return jsonify({"erro": "Token expirado"}), 401

        except jwt.InvalidTokenError:
            return jsonify({"erro": "Token inválido"}), 401

        return f(*args, **kwargs)

    return wrapper

@auth_bp.route("/registrar", methods=["POST"])
def registrar():
    dados = request.get_json()

    campos = ["nome", "email", "senha"]
    for campo in campos:
        if not dados or not dados.get(campo):
            return jsonify({"erro": f"Campo '{campo}' é obrigatório"}), 400

    nome = dados["nome"].strip()
    email = dados["email"].strip().lower()
    senha = dados["senha"]

    if "@" not in email or "." not in email:
        return jsonify({"erro": "Formato de email inválido"}), 400

    if len(senha) < 6:
        return jsonify({"erro": "A senha deve ter no mínimo 6 caracteres"}), 400

    senha_hash = generate_password_hash(senha)

    db = get_db()

    try:
        cursor = db.execute(
            "INSERT INTO usuario (nome, email, senha_hash) VALUES (?, ?, ?)",
            (nome, email, senha_hash)
        )
        db.commit()

        return jsonify({
            "mensagem": "Usuário registrado com sucesso",
            "usuario": {
                "id": cursor.lastrowid,
                "nome": nome,
                "email": email
            }
        }), 201

    except db.IntegrityError:
        return jsonify({"erro": "Este email já está cadastrado"}), 409

@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json()

    if not dados or not dados.get("email") or not dados.get("senha"):
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    email = dados["email"].strip().lower()
    senha = dados["senha"]

    db = get_db()
    usuario = db.execute(
        "SELECT * FROM usuario WHERE email = ?", (email,)
    ).fetchone()

    if not usuario or not check_password_hash(usuario["senha_hash"], senha):
        return jsonify({"erro": "Email ou senha incorretos"}), 401

    token = jwt.encode(
        {
            "usuario_id": usuario["id"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return jsonify({
        "mensagem": "Login realizado com sucesso",
        "token": token,
        "usuario": {
            "id": usuario["id"],
            "nome": usuario["nome"],
            "email": usuario["email"]
        }
    }), 200
