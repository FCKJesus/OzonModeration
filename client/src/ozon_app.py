import tkinter as tk
from tkinter import ttk
import os
import threading
from src.browser import OzonBrowser
from src.config_manager import ConfigManager
from src.gui.side_panel import SidePanel
from src.gui.main_frame import MainFrame

class OzonApp(tk.Tk):
    def __init__(self):
        super().__init__()

        self.browser = None

        self.title("OzonGang 3.0")
        self.geometry("960x520")
        self.configure(bg="#212121")

        # Запрет изменения размеров окна
        self.resizable(False, False)
        self.maxsize(960, 520)
        self.minsize(960, 520)

        # Настройка grid для основного окна
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Путь к конфигурационному файлу
        config_file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'config.json')
        self.config_manager = ConfigManager(config_file_path)

        # Загрузка списка слов из конфигурационного файла
        self.words = self.config_manager.load_config().get("words", [])

        # Создание сайд-панели
        self.side_panel = SidePanel(self, self)
        self.side_panel.grid(row=0, column=0, rowspan=2, sticky="ns")

        # Метка для отображения заголовка страницы
        self.title_label = ttk.Label(self, text="No Browser", wraplength=300)
        self.title_label.grid(row=0, column=1, padx=20, pady=5, sticky="ew")

        # Создание основного фрейма
        self.main_frame = MainFrame(self, self)
        self.main_frame.grid(row=1, column=1, padx=20, pady=10, sticky="nsew")

        # Обновление заголовка страницы
        self.update_title_label()

    def open_browser(self):
        # Открытие браузера
        if self.browser is None or self.browser.driver is None:
            self.browser = OzonBrowser()
            threading.Thread(target=self.browser.open_browser).start()

    def close_browser(self):
        # Закрытие браузера
        if self.browser is not None:
            self.browser.close_browser()

    def toggle_browser_headless(self):
        # Переключение режима headless
        if self.browser is not None:
            self.browser.toggle_headless()

    def highlight_words(self):
        # Подсветка слов в браузере
        self.browser.highlight_words(self.words)

    def update_title_label(self):
        # Обновление метки заголовка страницы
        if self.browser is not None:
            title = self.browser.get_title()
            self.title_label.config(text=title)
        self.after(1000, self.update_title_label)  # Обновление каждую секунду