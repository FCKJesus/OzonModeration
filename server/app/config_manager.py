import json
import os

class ConfigManager:
    def __init__(self, config_file_path):
        self.config_file_path = config_file_path

    def load_config(self):
        if os.path.exists(self.config_file_path):
            with open(self.config_file_path, 'r', encoding='utf-8') as file:
                return json.load(file)
        return {"words": []}

    def save_config(self, words):
        with open(self.config_file_path, 'w', encoding='utf-8') as file:
            json.dump({"words": words}, file, indent=4, ensure_ascii=False)
