import os

from flask import Flask
from flask_cors import CORS

from src.backend.db import close_db, init_db
from src.backend.auth import auth_bp
from src.backend.denuncias import denuncias_bp
from src.backend.instituicoes import instituicoes_bp
from src.backend.tipos_golpe import tipos_golpe_bp

def create_app(test_config=None):
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY", "golpezero-chave-secreta-dev"
    )

    if test_config:
        app.config.update(test_config)

    CORS(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(denuncias_bp, url_prefix="/api/denuncias")
    app.register_blueprint(instituicoes_bp, url_prefix="/api/instituicoes")
    app.register_blueprint(tipos_golpe_bp, url_prefix="/api/tipos-golpe")

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

    init_db(app)

    return app

if __name__ == "__main__":
    app = create_app()

    app.run(debug=True, port=5000)
