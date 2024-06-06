from flask import Flask
from .config import Config
from .extensions import db, migrate, login_manager
from .blueprints.auth import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Инициализация расширений
    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Регистрация Blueprints
    app.register_blueprint(auth_bp)

    return app
