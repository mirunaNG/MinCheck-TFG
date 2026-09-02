from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import ConfiguracionFlask

db = SQLAlchemy()
login_manager = LoginManager()
jwt = JWTManager()

#igual que en ABD:

@login_manager.user_loader
def carga_usuario(id_usuario):
    from app.modelos import Usuario
    return db.session.get(Usuario, int(id_usuario))


def create_app() -> Flask:
    app = Flask(__name__)
    app.config.from_object(ConfiguracionFlask())

    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

    db.init_app(app)
    login_manager.init_app(app)
    jwt.init_app(app)

    with app.app_context():
        from app import modelos
        db.create_all()
        from app import rutas
        rutas.registrar_rutas(app)
    return app