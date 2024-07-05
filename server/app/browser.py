from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import os
import json


class OzonBrowser():
    def __init__(self):
        self.driver = None
        self.url = "https://bot.sannysoft.com"  # URL для проверки
        self.is_headless =  False


    def open_browser(self):
        chrome_options = Options()

        # Общие настройки
        if self.is_headless:
            chrome_options.add_argument("--headless")  # Запускаем браузер в headless режиме
        chrome_options.add_argument('--no-sandbox')  # Отключаем песочницу (для Linux)
        chrome_options.add_argument('--disable-gpu')  # Отключаем GPU
        chrome_options.add_argument('--disable-extensions')  # Отключаем расширения
        chrome_options.add_argument('--disable-dev-shm-usage')  # Отключаем использование /dev/shm (для Linux)
        chrome_options.add_argument("--disable-blink-features")  # Отключаем Blink features
        chrome_options.add_argument('--disable-application-cache')  # Отключаем кэш приложений
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")  # Отключение автоматизации

        # Настройки производительности
        chrome_options.add_argument('--disable-backgrounding-occluded-windows')  # Отключаем рендеринг фоновых окон
        #chrome_options.add_argument('--disable-preconnect')  # Отключаем предзагрузку страниц
        #chrome_options.add_argument('--blink-settings=imagesEnabled=false')  # Отключаем загрузку изображений через Blink settings
        chrome_options.add_argument('--disable-background-networking')  # Отключаем фоновую сетевую активность
        chrome_options.add_argument('--disable-hang-monitor')  # Отключаем монитор зависаний
        chrome_options.add_argument('--disable-ipc-flooding-protection')  # Отключаем защиту от наводнения IPC
        chrome_options.add_argument('--disable-renderer-backgrounding')  # Отключаем фоновый рендеринг
        chrome_options.add_argument('--disable-background-timer-throttling')  # Отключаем ограничение таймеров в фоне
        chrome_options.add_argument('--disable-sync')  # Отключаем синхронизацию
        chrome_options.add_argument('--disable-features=NetworkService,NetworkServiceInProcess')  # Отключаем сетевой сервис
        chrome_options.add_argument('--log-level=3')  # Устанавливаем минимальный уровень журнала (ERROR)
        
        # Установка экспериментальных опций для маскировки
        chrome_options.add_experimental_option('useAutomationExtension', False)
        chrome_options.add_experimental_option('excludeSwitches', ['enable-automation', 'enable-logging'])
        chrome_options.add_experimental_option('prefs', {
                'disk-cache-size': 0,  # Устанавливаем размер дискового кэша в 0
            })

        # Установка пользовательского агента
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36")
        
        # Установка стратегии загрузки страницы
        chrome_options.page_load_strategy = 'eager'  # Стратегия загрузки страницы

        # Создаем драйвер Chrome
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

        # Установка значений для WebGL
        self.driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
            "source": """
                Object.defineProperty(WebGLRenderingContext.prototype, 'getParameter', {
                    value: function(parameter) {
                        // UNMASKED_VENDOR_WEBGL
                        if (parameter === 37445) {
                            return 'Intel Inc.';
                        }
                        // UNMASKED_RENDERER_WEBGL
                        if (parameter === 37446) {
                            return 'Intel Iris OpenGL Engine';
                        }
                        return WebGLRenderingContext.prototype.getParameter.call(this, parameter);
                    }
                });
            """
        })

        # Переход на заданный URL
        self.driver.get(self.url)


    def get_title(self):
        if self.driver:
            return self.driver.title
        return "No Browser"
    

    def toggle_headless(self):
        self.is_headless = not self.is_headless
        if self.driver:
            self.close_browser()
            self.open_browser()


    def highlight_words(self, words):
        script_path = os.path.join(os.path.dirname(__file__), 'extensions', 'highlight.js')
        with open(script_path, "r") as file:
            js_code = file.read()
        
        words_to_highlight_json = json.dumps(words)
        self.driver.execute_script(js_code, words_to_highlight_json)  # Загружаем JavaScript код


    def close_browser(self):
        if self.driver:
            self.driver.quit()
            self.driver = None