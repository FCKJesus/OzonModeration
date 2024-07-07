import threading
import time
from flask import current_app as app
from selenium.webdriver.common.by import By

import logging
import os
import datetime

# Настройка логирования
log_dir = "logs"
os.makedirs(log_dir, exist_ok=True)
log_filename = os.path.join(log_dir, datetime.datetime.now().strftime("%Y-%m-%d") + ".log")

logging.basicConfig(
    filename=log_filename,
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    filemode='a'
)
logger = logging.getLogger(__name__)

class Worker:
    def __init__(self, browser_id):
        self.browser_manager = app.config['browser_manager']
        self.browser_id = browser_id
        self.browser = self.browser_manager.browsers.get(browser_id)
        if not self.browser:
            logger.error(f"Браузер с ID {browser_id} не найден")
            raise ValueError(f"Браузер с ID {browser_id} не найден")
        self.running = False
        self.thread = None

    def start(self):
        """Запускает воркера в отдельном потоке"""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self.run)
            self.thread.start()
            logger.info(f"Воркер запущен для браузера с ID: {self.browser_id}")

    def stop(self):
        """Останавливает воркера"""
        if self.running:
            self.running = False
            if self.thread:
                self.thread.join()
            logger.info(f"Воркер остановлен для браузера с ID: {self.browser_id}")

    def run(self):
        """Основной цикл воркера"""
        while self.running:
            try:
                # Здесь будет ваш функционал воркера
                self.highlight_correct_answer()
                time.sleep(1)  # Пауза между итерациями, измените по необходимости
            except Exception as e:
                logger.error(f"Ошибка в воркере: {e}")

    def highlight_correct_answer(self):
        """Пример функции подсветки правильного ответа, добавьте вашу логику здесь"""
        # Пример кода для подсветки правильного ответа
        try:
            correct_answer = self.browser.driver.find_element(By.CLASS_NAME, "result passed")
            self.browser.driver.execute_script("arguments[0].style.backgroundColor = 'yellow'", correct_answer)
        except Exception as e:
            logger.error(f"Ошибка при подсветке ответа: {e}")
