from app.rutas.auth import registrar_rutas_auth
from app.rutas.usuarios import registrar_rutas_usuarios
from app.rutas.asignaturas import registrar_rutas_asignaturas
from app.rutas.temas import registrar_rutas_temas
from app.rutas.ejercicios import registrar_rutas_ejercicios
from app.rutas.entregas import registrar_rutas_entregas

def registrar_rutas(app):
    registrar_rutas_auth(app)
    registrar_rutas_usuarios(app)
    registrar_rutas_asignaturas(app)
    registrar_rutas_temas(app)
    registrar_rutas_ejercicios(app)
    registrar_rutas_entregas(app)
