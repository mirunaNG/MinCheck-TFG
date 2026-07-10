from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app import db, login_manager
from app.modelos import Usuario
import datetime

def registrar_rutas_temas(app):
    @app.route('/asignatura/<int:asignatura_id>/temas', methods=['GET'])
    def temas_asignatura(asignatura_id):
        from app.modelos import Asignatura, Entrega
        asignatura = Asignatura.query.get(asignatura_id)
        if not asignatura:
            return jsonify({'mensaje': 'Asignatura no encontrada'})
        
        res = []
        for tema in asignatura.temas:
            ejercicios = []
            for ej in tema.ejercicios:
                num_entregas = Entrega.query.filter_by(ejercicio_id=ej.id).count()
                ejercicios.append({
                    'id': ej.id,
                    'nombre': ej.nombre,
                    'entregas': num_entregas
                })

            res.append({
                'id': tema.id,
                'nombre': tema.nombre,
                'color': tema.color,
                'ejercicios': ejercicios
            })
        return jsonify(res), 200
    
    @app.route('/asignatura/<int:asignatura_id>/temas', methods=['POST'])
    def crear_tema(asignatura_id):
        from app.modelos import Asignatura, Tema
        asignatura = Asignatura.query.get(asignatura_id)
        if not asignatura:
            return jsonify({'mensaje': 'Asignatura no encontrada'})
        
        datos = request.get_json()
        nombre = datos.get('nombre')
        color = datos.get('color')
        if not nombre or not color:
            return jsonify({'mensaje': 'Faltan campos'}), 400
        
        tema = Tema(asignatura_id=asignatura_id, nombre=nombre, color=color)
        db.session.add(tema)
        db.session.commit()

        return jsonify({
            'id': tema.id,
            'nombre': tema.nombre,
            'color': tema.color,
            'ejercicios': []
        }), 201
    
    @app.route('/tema/<int:tema_id>', methods=['DELETE'])
    def eliminar_tema(tema_id):
        from app.modelos import Tema
        tema = Tema.query.get(tema_id)
        if not tema:
            return jsonify({'mensaje': 'Tema no encontrado'}), 404
        
        db.session.delete(tema)
        db.session.commit()
        return jsonify({'mensaje': 'Tema eliminado'}), 200
    
    @app.route('/asignatura/<int:asignatura_id>/alumno/<int:alumno_id>/temas', methods=['GET'])
    def temas_asignatura_alumno(asignatura_id, alumno_id):
        from app.modelos import Asignatura, Entrega
        import datetime

        asignatura = Asignatura.query.get(asignatura_id)
        if not asignatura:
            return jsonify({'mensaje': 'Asignatura no encontrada'}), 404
        
        res = []
        for tema in asignatura.temas:
            ejercicios_tema = []
            resueltos = 0
            for ej in tema.ejercicios:
                if not ej.visible:
                    continue
                ahora = datetime.datetime.now()
                cerrado = ej.fecha_limite is not None and ahora.date() > ej.fecha_limite
                entregas_ej = (
                    Entrega.query
                    .filter_by(alumno_id=alumno_id, ejercicio_id=ej.id)
                    .order_by(Entrega.id.desc())
                    .all()
                )
                intentos = len(entregas_ej)
                ultima_entrega = entregas_ej[0] if entregas_ej else None
                estado = ultima_entrega.resultado if ultima_entrega else 'pendiente'
                if estado == 'correcto':
                    resueltos += 1
                ejercicios_tema.append({
                    'id': ej.id,
                    'nombre': ej.nombre,
                    'estado': estado,
                    'intentos': intentos,
                    'cerrado': cerrado,
                    'fechaLimite': ej.fecha_limite.isoformat() if ej.fecha_limite else None,
                })


            res.append({
                'id': tema.id,
                'nombre': tema.nombre,
                'color': tema.color or '#4d7cfe',
                'ejercicios': ejercicios_tema,
                'resueltos': resueltos,
                'total': len(ejercicios_tema),
            })

        return jsonify(res), 200