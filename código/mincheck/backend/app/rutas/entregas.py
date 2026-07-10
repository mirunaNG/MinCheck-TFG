from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app import db, login_manager
from app.modelos import Usuario
import datetime

def registrar_rutas_entregas(app):
    @app.route('/alumno/<int:alumno_id>/entregas', methods=['GET'])
    def entregas_alumno(alumno_id):
        from app.modelos import Entrega
        from sqlalchemy.orm import joinedload
        limite = request.args.get('limite', 4, type=int)
        entregas = (
            Entrega.query.filter_by(alumno_id = alumno_id)
            .options(joinedload(Entrega.ejercicio))
            .order_by(Entrega.fecha_hora.desc())
            .limit(limite)
            .all()
        )

        res = []
        for e in entregas:
            res.append({
                'id': e.id,
                'ejercicio': e.ejercicio.nombre,
                'resultado': e.resultado,
                'errorPrincipal': e.error_principal,
            })
        return jsonify(res), 200
    
    @app.route('/ejercicio/<int:ejercicio_id>/alumno/<int:alumno_id>/intentos', methods=['GET'])
    def intentos_alumno_ejercicio(ejercicio_id, alumno_id):
        from app.modelos import Ejercicio, Entrega
        ejercicio = Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404
        
        tema = ejercicio.tema
        entregas = (
            Entrega.query
            .filter_by(alumno_id=alumno_id, ejercicio_id=ejercicio_id)
            .order_by(Entrega.fecha_hora.desc())
            .all()
        )

        intentos = []
        for e in entregas:
            intentos.append({
                'id': e.id,
                'resultado': e.resultado,
                'fechaHora': e.fecha_hora.strftime('%d/%m/%Y %H:%M') if e.fecha_hora else '-',
                'errorPrincipal': e.error_principal,
            })
        
        ultimo_codigo=entregas[0].codigo_url if entregas else None

        return jsonify({
            'ejercicio': {
                'id': ejercicio.id,
                'nombre': ejercicio.nombre,
                'tema': tema.nombre,
                'enunciadoNombre': ejercicio.enunciado_nombre,
                'enunciadoURL': ejercicio.enunciado_url,
            },
            'intentos': intentos,
            'ultimoCodigo': ultimo_codigo,
        }), 200
    
    @app.route('/ejercicio/<int:ejercicio_id>/entregas', methods=['POST'])
    def guardar_entrega(ejercicio_id):
        from app.modelos import Ejercicio, Entrega
        import datetime
        ejercicio = Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404
        
        datos = request.get_json()
        alumno_id = datos.get('alumnoId')
        codigo = datos.get('codigo', '')

        if not alumno_id:
            return jsonify({'mensaje': 'Faltan datos'}), 400
        
        entrega = Entrega(
            alumno_id=alumno_id,
            ejercicio_id=ejercicio_id,
            codigo_url=codigo,
            resultado='correcto',
            fecha_hora = datetime.datetime.now(),
        )
        db.session.add(entrega)
        db.session.commit()

        return jsonify({
            'id': entrega.id,
            'resultado': entrega.resultado,
            'fechaHora': entrega.fecha_hora.strftime('%d/%m/%Y %H:%M'),
            'errorPrincipal': None,
        }), 201
    
    @app.route('/alumno/<int:alumno_id>/historialEntregas', methods=['GET'])
    def historial_entregas_alumno(alumno_id):
        from app.modelos import Matricula, Entrega
        from sqlalchemy.orm import joinedload

        matriculas = Matricula.query.filter_by(alumno_id=alumno_id).all()
        res = []
        for m in matriculas:
            a = m.asignatura
            ejercicio_ids = [e.id for t in a.temas for e in t.ejercicios]
            if not ejercicio_ids:
                continue
            entregas = (
                Entrega.query
                .filter(Entrega.alumno_id == alumno_id, Entrega.ejercicio_id.in_(ejercicio_ids))
                .options(joinedload(Entrega.ejercicio))
                .order_by(Entrega.fecha_hora.desc())
                .all()
            )
            if not entregas:
                continue
            res.append({
                'asignatura': {
                    'id': a.id,
                    'nombre': a.nombre,
                    'color': a.color or '#4d7cfe',
                },
                'entregas': [
                    {
                        'id': e.id,
                        'ejercicio': e.ejercicio.nombre,
                        'fechaHora': e.fecha_hora.strftime('%d/%m/%Y %H:%M') if e.fecha_hora else '-',
                        'resultado': e.resultado,
                    }
                    for e in entregas
                ],
            })
        return jsonify(res), 200