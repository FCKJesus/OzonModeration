import os
import secrets



class Config(object):
    SECRET_KEY = secrets.token_hex(16)
    


    

class ProductionConfig(Config):
    DEBUG = False

class DevelopConfig(Config):
    DEBUG = True
    ASSETS_DEBUG = True