import os
from dotenv import load_dotenv

load_dotenv(override=True)


class ConfiguracionFlask:
    """
    Clase con todas las variables de configuraciones de Flask
    """

    # Secret key: string largo para configurar la proteccion
    # de ciertos componentes de la app
    SECRET_KEY = os.environ.get('SECRET_KEY')

    # Ponemos track modifications de sqlalchemy a False
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Hacemos que se muestren las consultas que se realizan
    SQLALCHEMY_ECHO = True

    # Si ponemos el flag DEBUG a true, Flask se ejecutará en modo 'debug'.
    # En este modo, se muestra el log de los errores que se produzcan.
    # NO USAR EN PRODUCCION
    DEBUG = True

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', '')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-secret-cambiame-en-produccion')
