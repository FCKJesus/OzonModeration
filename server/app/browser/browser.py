from app.browser import browser_bp
from flask import Blueprint, request, jsonify


from app.src.browser import BrowserManager

browser_manager = BrowserManager()

@browser_bp.route('/ping', methods=['GET'])
def ping():
    return jsonify(message="pong")

@browser_bp.route('/open', methods=['POST'])
def open_browser():
    browser_id = browser_manager.open_browser()
    return jsonify(message="Browser opened", browser_id=browser_id)

@browser_bp.route('/close/<browser_id>', methods=['POST'])
def close_browser(browser_id):
    success = browser_manager.close_browser(browser_id)
    if success:
        return jsonify(message="Browser closed")
    else:
        return jsonify(message="Browser not found", error=True)

@browser_bp.route('/title/<browser_id>', methods=['GET'])
def get_title(browser_id):
    title = browser_manager.get_title(browser_id)
    if title:
        return jsonify(title=title)
    else:
        return jsonify(message="Browser not found", error=True)

@browser_bp.route('/highlight/<browser_id>', methods=['POST'])
def highlight_words(browser_id):
    words = request.json.get('words', [])
    success = browser_manager.highlight_words(browser_id, words)
    if success:
        return jsonify(message="Words highlighted")
    else:
        return jsonify(message="Browser not found or error occurred", error=True)

@browser_bp.route('/toggle_headless/<browser_id>', methods=['POST'])
def toggle_headless(browser_id):
    success = browser_manager.toggle_headless(browser_id)
    if success:
        return jsonify(message="Headless mode toggled")
    else:
        return jsonify(message="Browser not found or error occurred", error=True)

@browser_bp.route('/browsers', methods=['GET'])
def get_all_browsers():
    browsers = browser_manager.get_all_browsers()
    return jsonify(browsers=browsers)