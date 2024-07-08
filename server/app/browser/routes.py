from flask import jsonify, request, current_app as app
from . import browser_bp
from app.src.pom.worker import Worker
import logging
import datetime
import os

# Настройка логирования
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)
log_filename = os.path.join(log_dir, datetime.datetime.now().strftime("%Y-%m-%d") + ".log")

logging.basicConfig(
    filename=log_filename,
    level=logging.INFO,
    format='%(asctime)s %(levellevel)s %(message)s',
    filemode='a'
)
logger = logging.getLogger(__name__)

workers = {}


@browser_bp.route('/ping', methods=['GET'])
def ping():
    logger.info("Получен запрос на /ping")
    return jsonify(message="понг")


@browser_bp.route('/open', methods=['POST'])
def open_browser():
    browser_manager = app.config['browser_manager']
    browser_id = browser_manager.open_browser()
    logger.info(f"Браузер открыт с ID: {browser_id}")
    return jsonify(message="Браузер открыт", browser_id=browser_id)


@browser_bp.route('/close/<browser_id>', methods=['POST'])
def close_browser(browser_id):
    browser_manager = app.config['browser_manager']
    success = browser_manager.close_browser(browser_id)
    if success:
        logger.info(f"Браузер закрыт с ID: {browser_id}")
        return jsonify(message="Браузер закрыт")
    else:
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return jsonify(message="Браузер не найден", error=True)


@browser_bp.route('/title/<browser_id>', methods=['GET'])
def get_title(browser_id):
    browser_manager = app.config['browser_manager']
    title = browser_manager.get_title(browser_id)
    if title:
        logger.info(f"Получен заголовок для браузера с ID: {browser_id}")
        return jsonify(title=title)
    else:
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return jsonify(message="Браузер не найден", error=True)


@browser_bp.route('/toggle_headless/<browser_id>', methods=['POST'])
def toggle_headless(browser_id):
    browser_manager = app.config['browser_manager']
    success = browser_manager.toggle_headless(browser_id)
    if success:
        logger.info(f"Режим headless переключен для браузера с ID: {browser_id}")
        return jsonify(message="Режим headless переключен")
    else:
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return jsonify(message="Браузер не найден или произошла ошибка", error=True)


@browser_bp.route('/browsers', methods=['GET'])
def get_all_browsers():
    browser_manager = app.config['browser_manager']
    browsers = browser_manager.get_all_browsers()
    logger.info("Получен список всех открытых браузеров")
    return jsonify(browsers=browsers)


@browser_bp.route('/get_cookies/<browser_id>', methods=['GET'])
def get_cookies(browser_id):
    browser_manager = app.config['browser_manager']
    cookies = browser_manager.get_cookies(browser_id)
    if cookies:
        logger.info(f"Куки сохранены для браузера с ID: {browser_id}")
        return jsonify(message="Куки сохранены", cookies=cookies)
    else:
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return jsonify(message="Браузер не найден или произошла ошибка", error=True)


@browser_bp.route('/load_cookies/<browser_id>', methods=['POST'])
def load_cookies(browser_id):
    data = request.get_json()
    cookies = data['cookies']
    browser_manager = app.config['browser_manager']
    success = browser_manager.load_cookies(browser_id, cookies)
    if success:
        logger.info(f"Куки загружены для браузера с ID: {browser_id}")
        return jsonify(message="Куки загружены")
    else:
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return jsonify(message="Браузер не найден или произошла ошибка", error=True)


@browser_bp.route('/worker/start/<browser_id>', methods=['POST'])
def start_worker(browser_id):
    logger.debug(f"Попытка запуска воркера для браузера с ID: {browser_id}")
    browser_manager = app.config['browser_manager']
    if browser_id in browser_manager.browsers:
        worker = Worker(browser_id)
        worker.start()
        workers[browser_id] = worker
        logger.info(f"Воркер запущен для браузера с ID: {browser_id}")
        return jsonify(message="Воркер запущен")
    else:
        logger.error(f"Браузер не найден с ID: {browser_id}. Существующие браузеры: {browser_manager.browsers.keys()}")
        return jsonify(message="Браузер не найден", error=True)


@browser_bp.route('/worker/stop/<browser_id>', methods=['POST'])
def stop_worker(browser_id):
    if browser_id in workers:
        workers[browser_id].stop()
        del workers[browser_id]
        logger.info(f"Воркер остановлен для браузера с ID: {browser_id}")
        return jsonify(message="Воркер остановлен")
    else:
        logger.error(f"Воркер не найден с ID: {browser_id}")
        return jsonify(message="Воркер не найден", error=True)
