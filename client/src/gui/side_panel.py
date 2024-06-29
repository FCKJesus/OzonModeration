import tkinter as tk
from tkinter import ttk

class SidePanel(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, width=200, bg="#171717")
        self.pack_propagate(False)
        self.controller = controller

        # Создание контейнера для кнопок
        self.button_frame = tk.Frame(self, bg="#171717")
        self.button_frame.pack(side="bottom", fill="x", pady=20)

        # Определение стиля кнопок
        button_style = ttk.Style()
        button_style.configure("TButton", padding=6, relief="flat", background="#171717", foreground="white")
        button_style.map("TButton", background=[('active', '#333333')])

        # Кнопка для включения браузера
        self.open_button = ttk.Button(self.button_frame, text="Open Browser", command=self.controller.open_browser, style="TButton")
        self.open_button.pack(fill="x", padx=20, pady=5)

        # Кнопка для выключения браузера
        self.close_button = ttk.Button(self.button_frame, text="Close Browser", command=self.controller.close_browser, style="TButton")
        self.close_button.pack(fill="x", padx=20, pady=5)

        # Кнопка для переключения видимости браузера
        self.toggle_visibility_button = ttk.Button(self.button_frame, text="Toggle Browser Visibility", command=self.controller.toggle_browser_headless, style="TButton")
        self.toggle_visibility_button.pack(fill="x", padx=20, pady=5)

        # Кнопка для подсветки слов
        self.highlight_button = ttk.Button(self.button_frame, text="Highlight Words", command=self.controller.highlight_words, style="TButton")
        self.highlight_button.pack(fill="x", padx=20, pady=5)
