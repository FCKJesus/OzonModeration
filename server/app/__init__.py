from flask import Flask
from app.extensions import login_manager

from app.auth import auth_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object('config.DevelopConfig')


    login_manager.init_app(app)
    app.register_blueprint(auth_bp, url_prefix='/auth')

    
    return app