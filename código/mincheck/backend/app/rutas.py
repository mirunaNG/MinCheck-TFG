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

    @app.route('/registro', methods=['POST'])
    def registro():
        datos = request.get_json()

        nombre = datos.get('nombre')
        correo = datos.get('correo')
        contrasena = datos.get('contrasena')
        rol = datos.get('rol')

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
        
        usuario = Usuario(nombre_completo=nombre, correo=correo, rol=rol, fecha_creacion=datetime.datetime.now())
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
    
    @app.route('/alumno/<int:alumno_id>/asignaturasAlumno', methods=['GET'])
    def asignaturas_alumno(alumno_id):
        from app.modelos import Matricula, Ejercicio
        matriculas = Matricula.query.filter_by(alumno_id=alumno_id).all()
        res = []
        for m in matriculas:
            a = m.asignatura
            total_alumnos = Matricula.query.filter_by(asignatura_id=a.id).count()

            tema_ids = [t.id for t in a.temas]
            total_ejercicios = Ejercicio.query.filter(Ejercicio.tema_id.in_(tema_ids)).count()
            res.append({
                'id': a.id,
                'nombre': a.nombre,
                'color': a.color,
                'profesor': a.profesor.nombre_completo,
                'alumnos': total_alumnos,
                'ejercicios': total_ejercicios,
            })
        return jsonify(res), 200
    
    @app.route('/alumno/<int:alumno_id>/entregas', methods=['GET'])
    def entregas_alumno(alumno_id):
        from app.modelos import Entrega
        from sqlalchemy.orm import joinedload
        limite = request.args.get('limite', 4, type=int)
        entregas = (
            Entrega.query.filter_by(alumno_id = alumno_id)
            .options(joinedload(Entrega.ejercicio))
            .order_by(Entrega.fecha_entrega.desc())
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

    @app.route('/matriculas', methods=['POST'])
    def unirse_asignatura():
        from app.modelos import Matricula, Asignatura, Ejercicio
        datos = request.get_json()
        alumno_id = datos.get('alumno_id')
        codigo_asignatura = datos.get('codigo_asignatura')

        if not alumno_id or not codigo_asignatura:
            return jsonify({'mensaje': 'Faltan datos'}), 400
        
        asignatura = Asignatura.query.filter_by(codigo_asignatura=codigo_asignatura.upper()).first()
        
        if not asignatura:
            return jsonify({'mensaje': 'No existe ninguna asignatura con ese código'}), 404

        ya_matriculado = Matricula.query.filter_by(alumno_id = alumno_id, asignatura_id = asignatura.id).first()
        if ya_matriculado:
            return jsonify({'mensaje': 'Ya estás matriculado en esta asignatura'}), 400
        
        nueva_matricula = Matricula(alumno_id=alumno_id, asignatura_id=asignatura.id, fecha_matricula=datetime.datetime.now())
        db.session.add(nueva_matricula)
        db.session.commit()

        tema_ids = [t.id for t in asignatura.temas]
        total_ejercicios = Ejercicio.query.filter(Ejercicio.tema_id.in_(tema_ids)).count()
        total_alumnos = Matricula.query.filter_by(asignatura_id=asignatura.id).count()

        return jsonify({
            'id': asignatura.id,
            'nombre': asignatura.nombre,
            'color': asignatura.color,
            'profesor': asignatura.profesor.nombre_completo,
            'alumnos': total_alumnos,
            'ejercicios': total_ejercicios,
        }), 201
    
    @app.route('/profesor/<int:profesor_id>/asignaturasProfesor', methods=['GET'])
    def asignaturas_profesor(profesor_id):
        from app.modelos import Asignatura, Matricula, Ejercicio
        asignaturas = Asignatura.query.filter_by(profesor_id=profesor_id).all()
        if not asignaturas:
            return jsonify({'mensaje': 'No has creado ninguna asignatura aún'}), 404
        res = []

        for a in asignaturas:
            total_alumnos = Matricula.query.filter_by(asignatura_id=a.id).count()
            tema_ids = [t.id for t in a.temas]
            total_ejercios = Ejercicio.query.filter(Ejercicio.tema_id.in_(tema_ids)).count()

            res.append({
                'id': a.id,
                'nombre': a.nombre,
                'color': a.color,
                'alumnos': total_alumnos,
                'ejercicios': total_ejercios,
            })
        return jsonify(res), 201
        
    @app.route('/asignaturasProfesor', methods=['POST'])
    def crear_asignatura():
        from app.modelos import Asignatura
        import secrets, string

        datos = request.get_json()
        nombre = datos.get('nombre')
        profesor_id = datos.get('profesor_id')

        if not nombre or not profesor_id:
            return jsonify({'mensaje': 'Faltan datos'}), 400
        
        chars = string.ascii_uppercase + string.digits
        while True:
            codigo_asignatura = ''.join(secrets.choice(chars) for _ in range(6))
            if not Asignatura.query.filter_by(codigo_asignatura=codigo_asignatura).first():
                break
        asignatura_nueva = Asignatura(
            nombre=nombre,
            profesor_id = profesor_id,
            codigo_asignatura = codigo_asignatura,
            curso = '25-26',
            fecha_creacion = datetime.datetime.now()
        )
        db.session.add(asignatura_nueva)
        db.session.commit()

        return jsonify({
            'id': asignatura_nueva.id,
            'nombre': asignatura_nueva.nombre,
            'color': asignatura_nueva.color,
            'codigoAsignatura': asignatura_nueva.codigo_asignatura,
            'alumnos': 0,
            'ejercicios': 0,
        }), 201
    
    @app.route('/profesor/<int:profesor_id>/erroresComunes', methods=['GET'])
    def errores_comunes_profesro(profesor_id):
        from app.modelos import Ejercicio, Asignatura, Entrega
        from sqlalchemy import func

        asignaturas = Asignatura.query.filter_by(profesor_id=profesor_id).all()

        ejericicos_ids = []
        for a in asignaturas:
            for tema in a.temas:
                for ej in tema.ejercicios:
                    ejericicos_ids.append(ej.id)

        if not ejericicos_ids:
            return jsonify({'mensaje': 'No hay datos suficientes'}), 200
        
        #cuantas entregas tiene cada error por ejercicio
        contador = (
            db.session.query(
                Entrega.ejercicio_id, 
                Entrega.error_principal,
                func.count(Entrega.id).label('con_error')
            )
            .filter (
                Entrega.ejercicio_id.in_(ejericicos_ids),
                Entrega.error_principal != None,
                Entrega.error_principal != ''
            )
            .group_by(Entrega.ejercicio_id, Entrega.error_principal)
            .all()
        )

        entregas_totales = (
            db.session.query(
                Entrega.ejercicio_id,
                func.count(Entrega.id).label('total')
            )
            .filter(Entrega.ejercicio_id.in_(ejericicos_ids))
            .group_by(Entrega.ejercicio_id)
            .all()
        )
        totales_dict = {t.ejercicio_id: t.total for t in entregas_totales}

        res = []
        for c in contador:
            ejercicio = Ejercicio.query.get(c.ejercicio_id)
            total = totales_dict.get(c.ejercicio_id, 1)
            porcentaje = round((c.con_error / total) * 100)
            color = ejercicio.tema.color or '#4d7cfe'

            res.append({
                'ejercicio': ejercicio.nombre,
                'descripcion': c.error_principal,
                'porcentaje': porcentaje,
                'color': color,
            })
            res.sort(key=lambda x: x['porcentaje'], reverse=True)

        return jsonify(res[:5]), 200

    @app.route('/asignatura/<int:asignatura_id>', methods=['GET'])
    def detalle_asignatura(asignatura_id):
        from app.modelos import Asignatura
        asignatura = Asignatura.query.get(asignatura_id)
        if not asignatura:
            return jsonify({'mensaje': 'Asignatura no encontrada'}), 404
        
        return jsonify({
            'id': asignatura.id,
            'nombre': asignatura.nombre,
            'curso': asignatura.curso,
            'codigoAsignatura': asignatura.codigo_asignatura,
            'color': asignatura.color or '#4d7cfe',
            'profesor': asignatura.profesor.nombre_completo,
        }), 200
    
    @app.route('/asignatura/<int:asignatura_id>/alumnos', methods=['GET'])
    def alumnos_asignatura(asignatura_id):
        from app.modelos import Matricula, Ejercicio, Entrega, Asignatura
        asignatura = Asignatura.query.get(asignatura_id)
        if not asignatura:
            return jsonify({'mensaje': 'Asignatura no encontrada'}), 404
        
        tema_ids = [t.id for t in asignatura.temas]
        total_ejercicios= Ejercicio.query.filter(Ejercicio.tema_id.in_(tema_ids)).count()
        ejercicio_ids = [e.id for t in asignatura.temas for e in t.ejercicios]

        matriculas = Matricula.query.filter_by(asignatura_id=asignatura_id).all()
        res = []
        for m in matriculas:
            if ejercicio_ids:
                completados = Entrega.query.filter(
                    Entrega.alumno_id==m.alumno_id,
                    Entrega.ejercicio_id.in_(ejercicio_ids),
                    Entrega.resultado=='correcto'
                ).count()
            else:
                completados=0
            res.append({
                'id': m.alumno_id,
                'nombreCompleto': m.alumno.nombre_completo,
                'completados': completados,
                'total': total_ejercicios,
            })

        return jsonify({
            'alumnos': res, 
            'totalEjercicios': total_ejercicios
        }), 200
    
    @app.route('/asignatura/<int:asignatura_id>/ultimasEntregas', methods=['GET'])
    def ultimas_entregas_asignatura(asignatura_id):
        from app.modelos import Entrega, Ejercicio, Asignatura
        from sqlalchemy.orm import joinedload

        asignatura = Asignatura.query.get(asignatura_id)
        if not asignatura:
            return jsonify({'mensaje': 'Asignatura no encontrada'}), 400

        ejercicio_ids = [e.id for t in asignatura.temas for e in t.ejercicios]
        entregas = (
            Entrega.query.filter(Entrega.ejercicio_id.in_(ejercicio_ids))
            .options(joinedload(Entrega.alumno), joinedload(Entrega.ejercicio))
            .order_by(Entrega.fecha_hora.desc())
            .limit(10)
            .all()
        )

        res = []
        for e in entregas:
            res.append({
                'id': e.id,
                'alumno': e.alumno.nombre_completo,
                'fechaHora': e.fecha_hora.strftime('%d/%m/%Y %H:%M') if e.fecha_entrega else '',
                'correcto': e.resultado == 'correcto',
            })
        
        return jsonify(res), 200
    
# TEMAS GESTION DE MATERIAL
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
    
# EJERCICIOS POR TEMA EN GESTION DE MATERIAL
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
        
        UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
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



