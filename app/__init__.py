from flask import Flask

from app.routes.lobby import lobby_bp
from app.routes.greenhouse import greenhouse_bp
from app.routes.monitoring import monitoring_bp


def create_app():
    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static",
    )

    app.register_blueprint(lobby_bp, url_prefix="/lobby")
    app.register_blueprint(greenhouse_bp, url_prefix="/greenhouse")
    app.register_blueprint(monitoring_bp, url_prefix="/monitoring")

    return app
