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
