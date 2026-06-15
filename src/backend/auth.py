import re
import logging
import functools
from datetime import datetime, timedelta, timezone

import jwt
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from src.backend.db import get_db

logger = logging.getLogger(__name__)
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Regex de senha forte: mín. 8 chars, 1 maiúscula, 1 número, 1 especial
_SENHA_RE = re.compile(r"^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]).{8,}$")


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

    nome  = dados["nome"].strip()
    email = dados["email"].strip().lower()
    senha = dados["senha"]

    if len(nome) > 150:
        return jsonify({"erro": "O nome deve ter no máximo 150 caracteres"}), 400

    if len(email) > 254:
        return jsonify({"erro": "O email deve ter no máximo 254 caracteres"}), 400

    if "@" not in email or "." not in email:
        return jsonify({"erro": "Formato de email inválido"}), 400

    if not _SENHA_RE.match(senha):
        return jsonify({
            "erro": (
                "A senha deve ter no mínimo 8 caracteres, "
                "incluindo 1 letra maiúscula, 1 número e 1 caractere especial "
                "(!@#$%^&* etc.)"
            )
        }), 400

    senha_hash = generate_password_hash(senha)
    db = get_db()

    try:
        cursor = db.execute(
            "INSERT INTO usuario (nome, email, senha_hash) VALUES (?, ?, ?)",
            (nome, email, senha_hash)
        )
        db.commit()
        logger.info("Novo usuário registrado: %s", email)

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
    """
    Endpoint de login.
    Rate limit: aplicado via flask-limiter no main.py ao registrar o blueprint.
    Máximo: 10 tentativas por minuto por IP.
    """
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
        logger.warning("Tentativa de login falhou para: %s", email)
        return jsonify({"erro": "Email ou senha incorretos"}), 401

    token = jwt.encode(
        {
            "usuario_id": usuario["id"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    logger.info("Login realizado com sucesso: %s", email)
    return jsonify({
        "mensagem": "Login realizado com sucesso",
        "token": token,
        "usuario": {
            "id": usuario["id"],
            "nome": usuario["nome"],
            "email": usuario["email"]
        }
    }), 200
