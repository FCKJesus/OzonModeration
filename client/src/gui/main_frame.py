import tkinter as tk
from tkinter import messagebox

class MainFrame(tk.Frame):
    def __init__(self, parent, controller):
        super().__init__(parent, bg="#212121")
        self.controller = controller

        # Настройка grid для MainFrame
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Создание фрейма для ввода слов
        self.entry_frame = tk.Frame(self, bg="#212121")
        self.entry_frame.grid(row=0, column=0, padx=10, pady=10, sticky="ew")

        # Поле ввода для добавления слов
        self.entry = tk.Entry(self.entry_frame, width=30)
        self.entry.grid(row=0, column=0, padx=(0, 10))

        # Кнопка для добавления слов
        add_button = tk.Button(self.entry_frame, text="Добавить", command=self.add_word)
        add_button.grid(row=0, column=1)

        # Кнопка для удаления слов
        delete_button = tk.Button(self.entry_frame, text="Удалить", command=self.delete_word)
        delete_button.grid(row=0, column=2, padx=(10, 0))

        # Список для отображения слов с ограничением ширины
        self.listbox = tk.Listbox(self, width=32, height=15)  # Ограничение ширины
        self.listbox.grid(row=1, column=0, padx=10, pady=(0, 10), sticky="nsew")

        # Кнопка для сохранения слов
        save_button = tk.Button(self, text="Сохранить", command=self.save_words)
        save_button.grid(row=2, column=0, pady=10)

        # Загрузка начальных слов в список
        self._load_initial_words()

    def _load_initial_words(self):
        # Загрузка слов в listbox
        for word in self.controller.words:
            self.listbox.insert(tk.END, word)

    def add_word(self):
        # Добавление слова в список
        word = self.entry.get()
        if word:
            self.listbox.insert(tk.END, word)
            self.entry.delete(0, tk.END)
        else:
            messagebox.showwarning("Предупреждение", "Введите слово")

    def delete_word(self):
        # Удаление выбранного слова из списка
        selected = self.listbox.curselection()
        if selected:
            self.listbox.delete(selected)
        else:
            messagebox.showwarning("Предупреждение", "Выберите слово для удаления")

    def save_words(self):
        # Сохранение слов в конфигурационный файл
        words = self.listbox.get(0, tk.END)
        self.controller.config_manager.save_config(words)
        messagebox.showinfo("Информация", "Слова сохранены в config.json")
