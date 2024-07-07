from flask import Flask

from app.browser import browser_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object('config.DevelopConfig')

    app.register_blueprint(browser_bp, url_prefix='/browser')

    
    return app