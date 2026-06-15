import os
import logging

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from src.backend.db import close_db, init_db
from src.backend.auth import auth_bp
from src.backend.denuncias import denuncias_bp
from src.backend.instituicoes import instituicoes_bp
from src.backend.tipos_golpe import tipos_golpe_bp

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=[])

def create_app(test_config=None):
    app = Flask(__name__)

    if test_config and test_config.get("TESTING"):
        app.config["SECRET_KEY"] = test_config.get("SECRET_KEY", "chave-de-teste-segura")
    else:
        secret = os.environ.get("SECRET_KEY")
        if not secret:
            raise RuntimeError(
                "SECRET_KEY não definida. "
                "Crie um arquivo .env com SECRET_KEY=<valor> ou defina a variável de ambiente."
            )
        app.config["SECRET_KEY"] = secret

    if test_config:
        app.config.update(test_config)

    # CORREÇÃO AGRESSIVA DE CORS: Força a liberação de todas as rotas e métodos (GET, POST, OPTIONS, etc)
    CORS(
        app, 
        resources={r"/*": {"origins": "*"}}, 
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"]
    )
    app.config['CORS_HEADERS'] = 'Content-Type'

    limiter.init_app(app)

    @app.errorhandler(500)
    def erro_interno(e):
        logger.exception("Erro interno não tratado: %s", e)
        return {"erro": "Erro interno do servidor"}, 500

    @app.errorhandler(404)
    def rota_nao_encontrada(e):
        return {"erro": "Recurso não encontrado"}, 404

    @app.errorhandler(405)
    def metodo_nao_permitido(e):
        return {"erro": "Método não permitido"}, 405

    @app.errorhandler(429)
    def limite_excedido(e):
        return {"erro": "Limite de requisições excedido. Tente novamente mais tarde."}, 429

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(denuncias_bp, url_prefix="/api/denuncias")
    app.register_blueprint(instituicoes_bp, url_prefix="/api/instituicoes")
    app.register_blueprint(tipos_golpe_bp, url_prefix="/api/tipos-golpe")

    limiter.limit("10 per minute")(app.view_functions["auth.login"])

    app.teardown_appcontext(close_db)

    @app.route("/")
    def index():
        return {
            "aplicacao": "TrueCall API",
            "versao": "1.1.0",
            "descricao": "API para denúncia de golpes de falsas centrais de atendimento",
            "endpoints": {
                "auth": "/api/auth",
                "denuncias": "/api/denuncias",
                "instituicoes": "/api/instituicoes",
                "tipos_golpe": "/api/tipos-golpe"
            }
        }

    init_db(app)
    return app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)