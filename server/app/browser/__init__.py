from flask import Blueprint


browser_bp = Blueprint('browser_bp', __name__,)


from app.browser import browser