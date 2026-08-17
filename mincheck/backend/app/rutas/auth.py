from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app import db, login_manager
from app.modelos import Usuario
import datetime

def registrar_rutas_auth(app):
    @app.route('/registro', methods=['POST'])
    def registro():
        datos = request.get_json()

        nombre = datos.get('nombre')
        correo = datos.get('correo')
        contrasena = datos.get('contrasena')
        rol = datos.get('rol')
        centro = datos.get('centro')

        #si falta alguno de los campos requeridos, se devuelve un error
        if not nombre or not correo or not contrasena or not rol:
            return jsonify(
                {'mensaje': 'Faltan campos requeridos'}
            ), 400
        
        #si ya existe un correo registrado, no se puede crear
        if Usuario.query.filter_by(correo=correo).first():
            return jsonify(
                {'mensaje': 'El correo ya está registrado'}
            ), 400
        
        usuario = Usuario(nombre_completo=nombre, correo=correo, rol=rol, fecha_creacion=datetime.datetime.now(), universidad = centro)
        usuario.password = contrasena  # Esto activa el setter de password

        db.session.add(usuario)
        db.session.commit()

        token = create_access_token(identity=usuario.id)
        return jsonify(
            {'token': token, 
             'rol': usuario.rol, 
             'nombre': usuario.nombre_completo, 
             'id': usuario.id}
        ), 201

    @app.route('/login', methods=['POST'])
    def login():
        datos = request.get_json()

        correo = datos.get('correo')
        contrasena = datos.get('contrasena')

        if not correo or not contrasena:
            return jsonify(
                {'mensaje': 'Faltan campos requerids'}
            ), 400
        
        usuario_loggeado = Usuario.query.filter_by(correo=correo).first()

        if not usuario_loggeado or not usuario_loggeado.check_password(contrasena):
            return jsonify(
                {'mensaje': 'Correo o contraseña incorrectos'}
            ), 400
        
        token = create_access_token(identity=usuario_loggeado.id)
        return jsonify(
            {'token': token,
             'rol': usuario_loggeado.rol,
             'nombre': usuario_loggeado.nombre_completo,
             'id': usuario_loggeado.id}
        ), 200
