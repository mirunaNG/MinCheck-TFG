from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app import db, login_manager
from app.modelos import Usuario
import datetime

def registrar_rutas_usuarios(app):
    @app.route('/usuario/<int:usuario_id>', methods=['GET'])
    def obtener_perfil(usuario_id):
        usuario = db.session.get(Usuario, usuario_id)
        if not usuario:
            return jsonify({'mensaje': 'Usuario no encontrado'}), 404
        return jsonify({
            'nombre': usuario.nombre_completo,
            'correo': usuario.correo,
            'universidad': usuario.universidad or '',
            'rol': usuario.rol,
            'notificacionesAyuda': usuario.notificaciones_ayuda,
        }), 200

    @app.route('/usuario/<int:usuario_id>', methods=['PUT'])
    def actualizar_perfil(usuario_id):
        usuario = db.session.get(Usuario, usuario_id)
        if not usuario:
            return jsonify({'mensaje': 'Usuario no encontrado'}), 404
        datos = request.get_json()
        if 'nombre' in datos:
            usuario.nombre_completo = datos['nombre']
        if 'correo' in datos:
            existente = Usuario.query.filter_by(correo=datos['correo']).first()
            if existente and existente.id != usuario_id:
                return jsonify({'mensaje': 'El correo ya está en uso'}), 400
            usuario.correo = datos['correo']
        if 'universidad' in datos:
            usuario.universidad = datos['universidad']
        if 'notificacionesAyuda' in datos:
            usuario.notificaciones_ayuda = datos['notificacionesAyuda']
        db.session.commit()
        return jsonify({'nombre': usuario.nombre_completo}), 200
    
    @app.route('/usuario/<int:usuario_id>/contrasena', methods=['PUT'])
    def cambiar_contrasena(usuario_id):
        usuario = db.session.get(Usuario, usuario_id)
        if not usuario:
            return jsonify({'mensaje': 'Usuario no encontrado'}), 404
        datos = request.get_json()
        actual = datos.get('contrasenaActual')
        nueva = datos.get('contrasenaNueva')
        if not actual or not nueva:
            return jsonify({'mensaje': 'Faltan campos'}), 400
        if not usuario.check_password(actual):
            return jsonify({'mensaje': 'La contraseña actual es incorrecta'}), 400
        usuario.password = nueva
        db.session.commit()
        return jsonify({'mensaje': 'Contraseña actualizada'}), 200