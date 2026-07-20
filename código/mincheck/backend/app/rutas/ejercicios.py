from flask import request, jsonify
from app import db


def registrar_rutas_ejercicios(app):
    @app.route('/tema/<int:tema_id>/ejercicios', methods=['POST'])
    def crear_ejercicio(tema_id):
        from app.modelos import Ejercicio, Tema
        import datetime, os
        from werkzeug.utils import secure_filename

        tema = Tema.query.get(tema_id)
        if not tema:
            return jsonify({'mensaje': 'Tema no encontrado'}), 404
        
        nombre = request.form.get('nombre')
        if not nombre:
            return jsonify({'mensaje': 'falta el nombre del tema '}), 400
        
        UPLOAD_FOLDER=os.path.join(os.path.dirname(__file__), '..', 'uploads')
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        enunciado_nombre = None
        enunciado_url = None
        solucion_nombre = None
        solucion_url = None

        if 'enunciado' in request.files:
            f = request.files['enunciado']
            fname = secure_filename(f.filename)
            f.save(os.path.join(UPLOAD_FOLDER, fname))
            enunciado_nombre = fname
            enunciado_url = f'/uploads/{fname}'

        if 'solucion' in request.files:
            f = request.files['solucion']
            fname = secure_filename(f.filename)
            f.save(os.path.join(UPLOAD_FOLDER, fname))
            solucion_nombre = fname
            solucion_url = f'/uploads/{fname}'


        ejercicio = Ejercicio(
            nombre=nombre,
            tema_id=tema_id,
            enunciado_nombre=enunciado_nombre,
            enunciado_url=enunciado_url,
            solucion_nombre=solucion_nombre,
            solucion_url=solucion_url,
            fecha_creacion=datetime.datetime.now()
        )
        
        db.session.add(ejercicio)
        db.session.commit()
        return jsonify({
            'id': ejercicio.id,
            'nombre': ejercicio.nombre,
            'entregas': 0,
        }), 201
    

    @app.route('/ejercicio/<int:ejercicio_id>', methods=['DELETE'])
    def eliminar_ejercicio_ruta(ejercicio_id):
        from app.modelos import Ejercicio
        ejercicio = Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404
        
        db.session.delete(ejercicio)
        db.session.commit()
        return jsonify({'mensaje': 'Ejercicio eliminado'}), 200   
    

    @app.route('/ejercicio/<int:ejercicio_id>/errores', methods=['GET'])
    def errores_ejercicio(ejercicio_id):
        from app.modelos import Ejercicio, Entrega
        from sqlalchemy import func
        ejercicio = Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404
        total = Entrega.query.filter_by(ejercicio_id=ejercicio_id).count()
        if total == 0:
            return jsonify([]), 200
        filas = (
            db.session.query(Entrega.error_principal, func.count(Entrega.id).label('n'))
            .filter(Entrega.ejercicio_id == ejercicio_id, Entrega.error_principal != None, Entrega.error_principal != '')
            .group_by(Entrega.error_principal)
            .order_by(func.count(Entrega.id).desc())
            .all()
        )
        return jsonify([{'error': f.error_principal, 'porcentaje': round((f.n / total) * 100)} for f in filas]), 200


    @app.route('/ejercicio/<int:ejercicio_id>', methods=['GET'])
    def detalle_ejercicio(ejercicio_id):
        from app.modelos import Ejercicio

        ejercicio=Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404
        
        tema = ejercicio.tema
        asignatura = tema.asignatura

        casos_prueba=[
            {
                'id': c.id,
                'input': c.input,
                'outputEsperado': c.output_esperado,
            }
            for c in ejercicio.casos_prueba
        ]

        entregas = []
        for e in ejercicio.entregas:
            entregas.append({
                'id': e.id,
                'alumno': e.alumno.nombre_completo,
                'fechaHora': e.fecha_hora.strftime('%d/%m/%Y %H:%M') if e.fecha_hora else '-',
                'resultado': e.resultado,
                'errorPrincipal': e.error_principal,
            })

        return jsonify({
            'id': ejercicio.id,
            'nombre': ejercicio.nombre,
            'tema': {'id': tema.id, 'nombre': tema.nombre},
            'asignatura': {'id': asignatura.id, 'nombre': asignatura.nombre},
            'enunciadoNombre': ejercicio.enunciado_nombre,
            'enunciadoURL': ejercicio.enunciado_url,
            'solucionNombre': ejercicio.solucion_nombre,
            'solucionURL': ejercicio.solucion_url,
            'casosPrueba': casos_prueba,
            'entregas': entregas,
            'visible': ejercicio.visible,
            'fechaLimite': ejercicio.fecha_limite.isoformat() if ejercicio.fecha_limite else None,
        }), 200
    
    @app.route('/ejercicio/<int:ejercicio_id>/configuracion', methods=['PUT'])
    def guardar_configuracion_ejercicio(ejercicio_id):
        from app.modelos import Ejercicio
        import datetime
        ejercicio = Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404
        datos = request.get_json()
        ejercicio.visible = datos.get('visible', ejercicio.visible)
        fecha_str = datos.get('fechaLimite')
        ejercicio.fecha_limite = datetime.datetime.fromisoformat(fecha_str) if fecha_str else None
        db.session.commit()
        return jsonify({'mensaje': 'Configuración guardada'}), 200

    
    @app.route('/ejercicio/<int:ejercicio_id>/feedback', methods=['GET'])
    def cargar_feedback_ejercicio(ejercicio_id):
        from app.modelos import Ejercicio
        ejerciio = Ejercicio.query.get(ejercicio_id)
        if not ejerciio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404
        
        config = ejerciio.configuracion_feedback
        if not config:
            return jsonify({
                'tipoError': True,
                'lineaFallo': True,
                'mensajeExplicativo': False,
                'comparacionSalidas': True,
                'contraejemplo': True,
                'visualizacionEstructuras': True,
                'activarPistas': True,
                'textoPista': '',
                'mostrarTras': 2,
            }), 200

        return jsonify({
            'tipoError': config.tipo_error,
            'lineaFallo': config.linea_fallo,
            'mensajeExplicativo': config.mensaje_explicativo,
            'comparacionSalidas': config.comparacion_salidas,
            'contraejemplo': config.contraejemplo,
            'visualizacionEstructuras': config.visualizacion_estructuras,
            'activarPistas': config.activar_pistas,
            'textoPista': config.texto_pista or '',
            'mostrarTras': config.mostrar_tras or 2,
        }), 200
    
    @app.route('/ejercicio/<int:ejercicio_id>/feedback', methods=['PUT'])
    def guardar_feedback(ejercicio_id):
        from app.modelos import Ejercicio, Configuracion_feedback
        ejercicio = Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404
        
        datos = request.get_json()
        config = ejercicio.configuracion_feedback
        if not config:
            config = Configuracion_feedback(ejercicio_id=ejercicio_id)
            db.session.add(config)

        config.tipo_error=datos.get('tipoError', True)
        config.linea_fallo=datos.get('lineaFallo', True)
        config.mensaje_explicativo=datos.get('mensajeExplicativo', False)
        config.comparacion_salidas=datos.get('comparacionSalidas', True)
        config.contraejemplo = datos.get('contraejemplo', True)
        config.visualizacion_estructuras=datos.get('visualizacionEstructuras', True)
        config.activar_pistas = datos.get('activarPistas', True)
        config.texto_pista = datos.get('textoPista', '')
        config.mostrar_tras = datos.get('mostrarTras', 2)

        db.session.commit()
        return jsonify({'mensaje': 'Configuracion guardada'}), 200
    

    @app.route('/ejercicio/<int:ejercicio_id>/archivos', methods=['PUT'])
    def actualizar_archivos_ej(ejercicio_id):
        from app.modelos import Ejercicio
        from werkzeug.utils import secure_filename
        import os

        ejercicio = Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404
        
        UPLOAD_FOLDER=os.path.join(os.path.dirname(__file__), '..', 'uploads')
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        if 'enunciado' in request.files:
            f = request.files['enunciado']
            fname = secure_filename(f.filename)
            f.save(os.path.join(UPLOAD_FOLDER, fname))
            ejercicio.enunciado_nombre = fname
            ejercicio.enunciado_url = f'/uploads/{fname}'

        if 'solucion' in request.files:
            f = request.files['solucion']
            fname = secure_filename(f.filename)
            f.save(os.path.join(UPLOAD_FOLDER, fname))
            ejercicio.solucion_nombre = fname
            ejercicio.solucion_url = f'/uploads/{fname}'

        db.session.commit()
        return jsonify({'mensaje': 'Archivos actualizados'}), 200
    
    @app.route('/uploads/<path:nombre_archivo>', methods=['GET'])
    def servir_archivo_subido(nombre_archivo):
        from flask import send_from_directory
        import os
        UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        return send_from_directory(UPLOAD_FOLDER, nombre_archivo)

    @app.route('/ejercicio/<int:ejercicio_id>/casos', methods=['POST'])
    def guardar_casos_prueba(ejercicio_id):
        from app.modelos import Ejercicio, Caso_Prueba

        ejercicio = Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404

        datos = request.get_json()
        casos = datos.get('casos', [])

        nuevos = []
        for c in casos:
            caso = Caso_Prueba(
                ejercicio_id=ejercicio_id,
                input=c.get('input', ''),
                output_esperado=c.get('outputEsperado', ''),
            )
            db.session.add(caso)
            nuevos.append(caso)

        db.session.commit()

        return jsonify({
            'casos': [{'id': c.id, 'input': c.input, 'outputEsperado': c.output_esperado} for c in nuevos]
        }), 201
