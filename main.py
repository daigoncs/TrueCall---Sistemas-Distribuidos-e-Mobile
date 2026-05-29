import os

from flask import Flask
from flask_cors import CORS

from src.db import close_db, init_db
from src.auth import auth_bp
from src.denuncias import denuncias_bp
from src.instituicoes import instituicoes_bp
from src.tipos_golpe import tipos_golpe_bp

def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY", "golpezero-chave-secreta-dev"
    )

    CORS(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(denuncias_bp)
    app.register_blueprint(instituicoes_bp)
    app.register_blueprint(tipos_golpe_bp)

    app.teardown_appcontext(close_db)

    @app.route("/")
    def index():
        return {
            "aplicacao": "GolpeZero API",
            "versao": "1.0.0",
            "descricao": "API para denúncia de golpes de falsas centrais de atendimento",
            "endpoints": {
                "auth": "/api/auth",
                "denuncias": "/api/denuncias",
                "instituicoes": "/api/instituicoes",
                "tipos_golpe": "/api/tipos-golpe"
            }
        }

    init_db()

    return app

if __name__ == "__main__":
    app = create_app()

    app.run(debug=True, port=5000)
