from flask import Flask
from app.browser import browser_bp
from app.src.browser import BrowserManager  # Импортируем BrowserManager

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.DevelopConfig')

    # Создаем глобальный экземпляр BrowserManager
    app.config['browser_manager'] = BrowserManager()

    app.register_blueprint(browser_bp, url_prefix='/browser')

    return app