from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app import db, login_manager
from app.modelos import Usuario
import datetime

#en ABD usabamos render_template() pero porque usabamos HTML, ahora con nextJS tiene que recibir JSON

#para devolver los datos a nextJS, se utiliza jsonify para convertir los datos a formato JSON y luego se devuelve la respuesta 
# con el código de estado correspondiente.
def registrar_rutas(app):

    @login_manager.user_loader
    def carga_usuario(id_usuario):
        return db.session.get(Usuario, int(id_usuario))

    @app.route('/api/registro', methods=['POST'])
    def registro():
        datos = request.get_json()

        nombre = datos.get('nombre')
        correo = datos.get('correo')
        contrasena = datos.get('contrasena')
        rol = datos.get('rol')

        #si falta alguno de los campos requeridos, se devuelve un error
        if not nombre or not correo or not contrasena or not rol:
            return jsonify({'mensaje': 'Faltan campos requeridos'}), 400
        
        #si ya existe un correo registrado, no se puede crear
        if Usuario.query.filter_by(correo=correo).first():
            return jsonify({'mensaje': 'El correo ya está registrado'}), 400
        
        usuario = Usuario(nombre_completo=nombre, correo=correo, rol=rol, fecha_registro=datetime.datetime.now())
        usuario.password = contrasena  # Esto activa el setter de password

        db.session.add(usuario)
        db.session.commit()

        token = create_access_token(identity=usuario.id_usuario)
        return jsonify({'token': token, 'rol': usuario.rol, 'nombre': usuario.nombre_completo}), 201

    @app.route('/api/login', methods=['POST'])
    def login():
        ...
