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
        import os

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
                'detalleError': e.detalle_error,
                'contraejemplo': e.contraejemplo_input,
            })

        
        
        ultimo_codigo = None
        if entregas:
            ultima = entregas[0] # Cogemos solo el último intento
            
            # Comprobamos si la url contiene la palabra uploads
            if ultima.codigo_url and 'uploads' in ultima.codigo_url:
                UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
                
                # Extraemos solo el nombre del archivo, ignorando si tiene / delante o no
                nombre_archivo = ultima.codigo_url.split('uploads/')[-1].lstrip('/')
                ruta = os.path.join(UPLOAD_FOLDER, nombre_archivo)
                
                try:
                    with open(ruta, 'r', encoding='utf-8', errors='replace') as f:
                        ultimo_codigo = f.read() # Leemos el código real
                except FileNotFoundError:
                    ultimo_codigo = "// Error: Archivo no encontrado en el servidor."
            else:
                # Por si hay entregas muy antiguas guardadas como texto directo
                ultimo_codigo = ultima.codigo_url
        

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
        from werkzeug.utils import secure_filename
        import datetime, os, json, requests

        ejercicio = Ejercicio.query.get(ejercicio_id)
        if not ejercicio:
            return jsonify({'mensaje': 'Ejercicio no encontrado'}), 404

        alumno_id = request.form.get('alumnoId')
        archivo = request.files.get('codigo')

        if not alumno_id or not archivo:
            return jsonify({'mensaje': 'Faltan datos'}), 400

        UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        timestamp = int(datetime.datetime.now().timestamp())
        #todos los archivos comparten la misma carpeta uploads/. Si dos alumnos suben un archivo llamado solucion.cpp, sin ese prefijo el segundo sobreescribiría el del primero. 
        # Con el prefijo cada entrega es única.
        fname = f'entrega_{ejercicio_id}_{alumno_id}_{timestamp}_{secure_filename(archivo.filename)}'
        ruta_guardada = os.path.join(UPLOAD_FOLDER, fname)
        archivo.save(ruta_guardada)

        extension = os.path.splitext(fname)[1].lstrip('.')

        casos_prueba = [
            {'input': c.input, 'output_esperado': c.output_esperado}
            for c in ejercicio.casos_prueba
        ]

        resultado = 'incorrecto'
        error_principal = 'No se pudo evaluar la entrega'
        detalle_error = None
        try:
            with open(ruta_guardada, 'rb') as f:
                respuesta = requests.post(
                    'http://localhost:8001/juzgar/entrega',
                    files={'codigo': (fname, f)},
                    data={'casos': json.dumps(casos_prueba), 'tiempo_limite': ejercicio.tiempo_limite},
                    timeout=30,
                )
            if respuesta.ok:
                datos_juicio = respuesta.json()
                resultado = datos_juicio['resultado']
                error_principal = datos_juicio['error_principal']
                detalle_error = datos_juicio.get('detalle_error')
        except requests.exceptions.RequestException:
            pass

        contraejemplo_input = None
        if resultado == 'incorrecto' and error_principal == 'Salida incorrecta':
            if ejercicio.solucion_nombre and ejercicio.estructura_json:
                try:
                    ruta_solucion = os.path.join(UPLOAD_FOLDER, ejercicio.solucion_nombre)
                    with open(ruta_guardada, 'rb') as f_alumno, open(ruta_solucion, 'rb') as f_solucion:
                        respuesta_ce = requests.post(
                            'http://localhost:8001/juzgar/contraejemplo',
                            files={
                                'codigo': (fname, f_alumno),
                                'solucion': (ejercicio.solucion_nombre, f_solucion),
                            },
                            data={'estructura': ejercicio.estructura_json, 'tiempo_limite': ejercicio.tiempo_limite},
                            timeout=60,
                        )
                    if respuesta_ce.ok:
                        contraejemplo = respuesta_ce.json().get('contraejemplo')
                        if contraejemplo:
                            contraejemplo_input = contraejemplo['input']
                except requests.exceptions.RequestException:
                    pass


        entrega = Entrega(
            alumno_id=alumno_id,
            ejercicio_id=ejercicio_id,
            codigo_url=f'/uploads/{fname}',
            codigo_lenguaje=extension,
            resultado=resultado,
            error_principal=error_principal,
            detalle_error=detalle_error,
            fecha_hora=datetime.datetime.now(),
            contraejemplo_input=contraejemplo_input,
        )
        db.session.add(entrega)
        db.session.commit()

        return jsonify({
            'id': entrega.id,
            'resultado': entrega.resultado,
            'fechaHora': entrega.fecha_hora.strftime('%d/%m/%Y %H:%M'),
            'errorPrincipal': entrega.error_principal,
            'detalleError': entrega.detalle_error,
            'contraejemplo': entrega.contraejemplo_input,
        }), 201

    @app.route('/entrega/<int:entrega_id>/codigo', methods=['GET'])
    def obtener_codigo_entrega(entrega_id):
        from app.modelos import Entrega
        import os

        entrega = Entrega.query.get(entrega_id)
        if not entrega:
            return jsonify({'mensaje': 'Entrega no encontrada'}), 404

        UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')

        if entrega.codigo_url and entrega.codigo_url.startswith('/uploads/'):
            nombre_archivo = entrega.codigo_url.replace('/uploads/', '', 1)
            ruta = os.path.join(UPLOAD_FOLDER, nombre_archivo)
            with open(ruta, 'r', encoding='utf-8', errors='replace') as f:
                codigo = f.read()
        else:
            # entregas antiguas, guardadas como texto plano directamente en codigo_url
            codigo = entrega.codigo_url or ''
            nombre_archivo = f'entrega_{entrega.id}.{entrega.codigo_lenguaje or "txt"}'

        return jsonify({
            'codigo': codigo,
            'nombreArchivo': nombre_archivo,
            'alumno': entrega.alumno.nombre_completo,
        }), 200

    @app.route('/entrega/<int:entrega_id>/visualizacion', methods=['GET'])
    def visualizar_entrega(entrega_id):
        from app.modelos import Entrega
        import os, requests

        entrega = Entrega.query.get(entrega_id)
        if not entrega:
            return jsonify({'mensaje': 'Entrega no encontrada'}), 404

        UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        nombre_archivo = entrega.codigo_url.replace('/uploads/', '', 1)
        ruta = os.path.join(UPLOAD_FOLDER, nombre_archivo)

        lenguaje = 'cpp' if entrega.codigo_lenguaje in ('cpp', 'cc') else 'c'

        try:
            with open(ruta, 'rb') as f:
                respuesta = requests.post(
                    'http://localhost:8001/visualizar/entrega',
                    files={'codigo': (nombre_archivo, f)},
                    data={'lenguaje': lenguaje},
                    timeout=20,
                )
            return jsonify(respuesta.json()), 200
        except requests.exceptions.RequestException:
            return jsonify({'mensaje': 'No se pudo generar la visualización'}), 502


    
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