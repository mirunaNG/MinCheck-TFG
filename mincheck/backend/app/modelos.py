#definición de tablas
from typing import List, Optional
import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import String, Float, Integer, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

class Usuario(db.Model):
    __tablename__ = 'usuarios'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    nombre_completo: Mapped[str] = mapped_column(Text, nullable=False)
    correo: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    contrasena_hash: Mapped[str] = mapped_column(String(256), nullable=False)
    rol: Mapped[str] = mapped_column(Text, nullable=False)
    fecha_creacion: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    universidad: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notificaciones_ayuda: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)

    # Relaciones: un usuario puede ser profesor de muchas asignaturas,
    # estar matriculado en muchas asignaturas y tener muchas entregas
    asignaturas_profesor: Mapped[List["Asignatura"]] = relationship(back_populates="profesor")
    matriculas: Mapped[List["Matricula"]] = relationship(back_populates="alumno")
    entregas: Mapped[List["Entrega"]] = relationship(back_populates="alumno")

    # Con property, especificamos que password se puede acceder como un atributo,
    # de la forma usuario.password. Es un getter encubierto
    @property
    def password(self):
        raise AttributeError('No se puede leer el atributo password')

    # Especificando `nombre_propiedad.setter`, definimos la función setter. Esta función
    # se invoca siempre que asignemos al atributo un nuevo valor. En este caso, cuando hagamos usuario.password
    @password.setter
    def password(self, password: str) -> None:
        self.contrasena_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.contrasena_hash, password)

    def __repr__(self):
        return f'<Usuario {self.nombre_completo}>'


class Asignatura(db.Model):
    __tablename__ = 'asignaturas'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    nombre: Mapped[str] = mapped_column(Text, nullable=False)
    codigo_asignatura: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    profesor_id: Mapped[int] = mapped_column(Integer, ForeignKey('usuarios.id'), nullable=False)
    color: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    imagen: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    curso: Mapped[str] = mapped_column(Text, nullable=False)
    fecha_creacion: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    # Relaciones: cada asignatura pertenece a un profesor,
    # tiene muchos temas y muchas matrículas
    profesor: Mapped["Usuario"] = relationship(back_populates="asignaturas_profesor")
    temas: Mapped[List["Tema"]] = relationship(back_populates="asignatura", cascade="all, delete-orphan")
    matriculas: Mapped[List["Matricula"]] = relationship(back_populates="asignatura", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Asignatura {self.nombre}>'


class Tema(db.Model):
    __tablename__ = 'temas'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    asignatura_id: Mapped[int] = mapped_column(Integer, ForeignKey('asignaturas.id'), nullable=False)
    color: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    nombre: Mapped[str] = mapped_column(Text, nullable=False)

    # Relaciones: cada tema pertenece a una asignatura y tiene muchos ejercicios
    asignatura: Mapped["Asignatura"] = relationship(back_populates="temas")
    ejercicios: Mapped[List["Ejercicio"]] = relationship(back_populates="tema", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Tema {self.nombre}>'


class Matricula(db.Model):
    __tablename__ = 'matriculas'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    alumno_id: Mapped[int] = mapped_column(Integer, ForeignKey('usuarios.id'), nullable=False)
    asignatura_id: Mapped[int] = mapped_column(Integer, ForeignKey('asignaturas.id'), nullable=False)
    fecha_matricula: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

    # Relaciones: cada matrícula pertenece a un alumno y a una asignatura
    alumno: Mapped["Usuario"] = relationship(back_populates="matriculas")
    asignatura: Mapped["Asignatura"] = relationship(back_populates="matriculas")

    def __repr__(self):
        return f'<Matricula Alumno {self.alumno_id} Asignatura {self.asignatura_id}>'


class Ejercicio(db.Model):
    __tablename__ = 'ejercicios'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    nombre: Mapped[str] = mapped_column(Text, nullable=False)
    tema_id: Mapped[int] = mapped_column(Integer, ForeignKey('temas.id'), nullable=False)
    enunciado_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    enunciado_nombre: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    solucion_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    solucion_nombre: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fecha_creacion: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    fecha_limite: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    tiempo_limite: Mapped[float] = mapped_column(Float, nullable=False, default=5.0)
    estructura_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relaciones: cada ejercicio pertenece a un tema, tiene muchos casos de prueba,
    # muchas entregas y una configuración de feedback
    tema: Mapped["Tema"] = relationship(back_populates="ejercicios")
    casos_prueba: Mapped[List["Caso_Prueba"]] = relationship(back_populates="ejercicio", cascade="all, delete-orphan")
    entregas: Mapped[List["Entrega"]] = relationship(back_populates="ejercicio", cascade="all, delete-orphan")
    configuracion_feedback: Mapped[Optional["Configuracion_feedback"]] = relationship(back_populates="ejercicio", cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Ejercicio {self.nombre}>'


class Caso_Prueba(db.Model):
    __tablename__ = 'casos_prueba'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    ejercicio_id: Mapped[int] = mapped_column(Integer, ForeignKey('ejercicios.id'), nullable=False)
    input: Mapped[str] = mapped_column(Text, nullable=False)
    output_esperado: Mapped[str] = mapped_column(Text, nullable=False)

    # Relaciones: cada caso de prueba pertenece a un ejercicio
    ejercicio: Mapped["Ejercicio"] = relationship(back_populates="casos_prueba")

    def __repr__(self):
        return f'<Caso_Prueba Ejercicio {self.ejercicio_id}>'


class Entrega(db.Model):
    __tablename__ = 'entregas'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    alumno_id: Mapped[int] = mapped_column(Integer, ForeignKey('usuarios.id'), nullable=False)
    ejercicio_id: Mapped[int] = mapped_column(Integer, ForeignKey('ejercicios.id'), nullable=False)
    codigo_url: Mapped[str] = mapped_column(Text, nullable=False)
    codigo_lenguaje: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resultado: Mapped[str] = mapped_column(Text, nullable=False)
    error_principal: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    fecha_hora: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    detalle_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    contraejemplo_input: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relaciones: cada entrega pertenece a un alumno y a un ejercicio
    alumno: Mapped["Usuario"] = relationship(back_populates="entregas")
    ejercicio: Mapped["Ejercicio"] = relationship(back_populates="entregas")

    def __repr__(self):
        return f'<Entrega Alumno {self.alumno_id} Ejercicio {self.ejercicio_id}>'


class Configuracion_feedback(db.Model):
    __tablename__ = 'configuracion_feedback'

    id: Mapped[int] = mapped_column(Integer, autoincrement=True, primary_key=True)
    ejercicio_id: Mapped[int] = mapped_column(Integer, ForeignKey('ejercicios.id'), unique=True, nullable=False)
    tipo_error: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=True)
    linea_fallo: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=True)
    mensaje_explicativo: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=True)
    comparacion_salidas: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=True)
    contraejemplo: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=True)
    visualizacion_estructuras: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=True)
    activar_pistas: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True, default=True)
    texto_pista: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    mostrar_tras: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=True)

    # Relaciones: cada configuración de feedback pertenece a un ejercicio (1 a 1)
    ejercicio: Mapped["Ejercicio"] = relationship(back_populates="configuracion_feedback")

    def __repr__(self):
        return f'<Configuracion_feedback Ejercicio {self.ejercicio_id}>'
