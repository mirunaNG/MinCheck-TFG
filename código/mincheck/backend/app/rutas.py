from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app import db, login_manager
from app.modelos import Usuario
import datetime


def registrar_rutas(app):

    @login_manager.user_loader
    def carga_usuario(id_usuario):
        return db.session.get(Usuario, int(id_usuario))

    @app.route('/api/registro', methods=['POST'])
    def registro():
        ...

    @app.route('/api/login', methods=['POST'])
    def login():
        ...
