import tkinter as tk
from tkinter import ttk
import threading

from .browser import OzonBrowser

class OzonApp(tk.Tk):
    def __init__(self):
        super().__init__()

        self.browser = None

        self.title("OzonGang 3.0")
        self.geometry("960x520")
        self.configure(bg="#212121")

        # Запрет изменения размеров окна
        self.resizable(False, False)

        # Установка фиксированного размера окна
        self.maxsize(960, 520)
        self.minsize(960, 520)

        # Создание сайд-панели
        self.side_panel = tk.Frame(self, width=200, bg="#171717")
        self.side_panel.pack(side="left", fill="y")


        # Создание контейнера для кнопок
        self.button_frame = tk.Frame(self.side_panel, bg="#171717")
        self.button_frame.pack(side="bottom", fill="x", pady=20)

        # Определение стиля кнопок
        button_style = ttk.Style()
        button_style.configure("TButton", padding=6, relief="flat", background="#171717", foreground="white")
        button_style.map("TButton", background=[('active', '#333333')])

        
        # Кнопка для включения браузера
        self.open_button = ttk.Button(self.button_frame, text="Open Browser", command=self.open_browser, style="TButton")
        self.open_button.pack(fill="x", padx=20, pady=5)

        # Кнопка для выключения браузера
        self.close_button = ttk.Button(self.button_frame, text="Close Browser", command=self.close_browser, style="TButton")
        self.close_button.pack(fill="x", padx=20, pady=5)

        # Кнопка для переключения видимости браузера
        self.toggle_visibility_button = ttk.Button(self.button_frame, text="Toggle Browser Visibility", command=self.toggle_browser_headless, style="TButton")
        self.toggle_visibility_button.pack(fill="x", padx=20, pady=5)

        # Метка для отображения заголовка страницы
        self.title_label = ttk.Label(self, text="No Browser", wraplength=300)
        self.title_label.pack(fill="x", padx=20, pady=5)

        # Обновление заголовка страницы
        self.update_title_label()


    

    def open_browser(self):
        if self.browser is None or self.browser.driver is None:
            self.browser = OzonBrowser()
            threading.Thread(target=self.browser.open_browser).start()

    def close_browser(self):
        if self.browser is not None:
            self.browser.close_browser()

    def toggle_browser_headless(self):
        if self.browser is not None:
            self.browser.toggle_headless()


    def update_title_label(self):
        if self.browser is not None:
            title = self.browser.get_title()
            self.title_label.config(text=title)
        self.after(1000, self.update_title_label)  # Обновление каждую секунду


