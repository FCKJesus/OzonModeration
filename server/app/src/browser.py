from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import os
import uuid
import pickle
import logging
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

class OzonBrowser:
    def __init__(self, url="https://bot.sannysoft.com", is_headless=False):
        self.driver = None
        self.url = url
        self.is_headless = is_headless

    def open_browser(self):
        chrome_options = Options()
        if self.is_headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument("--disable-blink-features")
        chrome_options.add_argument('--disable-application-cache')
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_argument('--disable-backgrounding-occluded-windows')
        chrome_options.add_argument('--disable-background-networking')
        chrome_options.add_argument('--disable-hang-monitor')
        chrome_options.add_argument('--disable-ipc-flooding-protection')
        chrome_options.add_argument('--disable-renderer-backgrounding')
        chrome_options.add_argument('--disable-background-timer-throttling')
        chrome_options.add_argument('--disable-sync')
        chrome_options.add_argument('--disable-features=NetworkService,NetworkServiceInProcess')
        chrome_options.add_argument('--log-level=3')
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_experimental_option('excludeSwitches', ['enable-automation', 'enable-logging'])
        chrome_options.add_experimental_option('prefs', {
            'disk-cache-size': 0,
        })
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
        chrome_options.page_load_strategy = 'eager'

        # Создаем драйвер Chrome
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        
        # Устанавливаем значения для WebGL
        self.driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(WebGLRenderingContext.prototype, 'getParameter', {
                    value: function(parameter) {
                        if (parameter === 37445) {
                            return 'Intel Inc.';
                        }
                        if (parameter === 37446) {
                            return 'Intel Iris OpenGL Engine';
                        }
                        return WebGLRenderingContext.prototype.getParameter.call(this, parameter);
                    }
                });
            """
        })

        # Переходим на заданный URL
        self.driver.get(self.url)

    def get_title(self):
        if self.driver:
            return self.driver.title
        return "Нет браузера"

    def toggle_headless(self):
        self.is_headless = not self.is_headless
        if self.driver:
            self.close_browser()
            self.open_browser()
        return self.is_headless

    def save_cookies(self, file_path):
        # Сохраняем куки в файл
        if self.driver:
            cookies = self.driver.get_cookies()
            with open(file_path, 'wb') as file:
                pickle.dump(cookies, file)
            return True
        return False

    def load_cookies(self, file_path):
        # Загружаем куки из файла
        if self.driver:
            with open(file_path, 'rb') as file:
                cookies = pickle.load(file)
            for cookie in cookies:
                self.driver.add_cookie(cookie)
            return True
        return False

    def close_browser(self):
        if self.driver:
            self.driver.quit()
            self.driver = None

class BrowserManager:
    def __init__(self):
        self.browsers = {}

    def open_browser(self):
        # Открываем новый браузер и сохраняем его ID
        browser_id = str(uuid.uuid4())
        browser = OzonBrowser()
        browser.open_browser()
        self.browsers[browser_id] = browser
        logger.info(f"Браузер открыт с ID: {browser_id}. Все браузеры: {self.browsers.keys()}")
        return browser_id

    def close_browser(self, browser_id):
        # Закрываем браузер по ID
        if browser_id in self.browsers:
            self.browsers[browser_id].close_browser()
            del self.browsers[browser_id]
            logger.info(f"Браузер закрыт с ID: {browser_id}")
            return True
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return False

    def get_title(self, browser_id):
        # Получаем заголовок страницы по ID браузера
        if browser_id in self.browsers:
            title = self.browsers[browser_id].get_title()
            logger.info(f"Получен заголовок для браузера с ID: {browser_id}: {title}")
            return title
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return None

    def toggle_headless(self, browser_id):
        # Переключаем режим headless в браузере по ID
        if browser_id in self.browsers:
            is_headless = self.browsers[browser_id].toggle_headless()
            logger.info(f"Режим headless переключен для браузера с ID: {browser_id} на {is_headless}")
            return is_headless
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return False

    def save_cookies(self, browser_id):
        # Сохраняем куки в файл по ID браузера
        if browser_id in self.browsers:
            file_path = f"{browser_id}.pkl"
            success = self.browsers[browser_id].save_cookies(file_path)
            if success:
                logger.info(f"Куки сохранены для браузера с ID: {browser_id} в файл {file_path}")
            else:
                logger.error(f"Не удалось сохранить куки для браузера с ID: {browser_id}")
            return success
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return False

    def load_cookies(self, browser_id):
        # Загружаем куки из файла по ID браузера
        if browser_id in self.browsers:
            file_path = f"{browser_id}.pkl"
            success = self.browsers[browser_id].load_cookies(file_path)
            if success:
                logger.info(f"Куки загружены для браузера с ID: {browser_id} из файла {file_path}")
            else:
                logger.error(f"Не удалось загрузить куки для браузера с ID: {browser_id}")
            return success
        logger.error(f"Браузер не найден с ID: {browser_id}")
        return False

    def get_all_browsers(self):
        print(self.browsers)
        # Возвращаем список всех открытых браузеров
        return list(self.browsers.keys())
