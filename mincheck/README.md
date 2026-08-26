#MinCheck
Herramienta de generación de contraejemplos mínimos para estudiantes.

## Requisitos previos
- [Node.js] (https://nodejs.org) (con npm)
- [Python 3](https://www.python.org/downloads/)
- [Git](https://git-scm.com/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (necesario para el visualizador de estructuras)
- Un compilador de C++ (g++) accesible desde el PATH. Comprueba si ya lo tienes con: g++ --version

Si no aparece nada:
  - **macOS:** `xcode-select --install`
  - **Linux:** instala `build-essential` (Debian/Ubuntu) o el paquete equivalente de tu distribución
  - **Windows:** descarga [WinLibs](https://winlibs.com) (build UCRT, Win64, `.zip`), descomprime en una ruta permanente (p. ej. `C:\mingw64`) y añade su carpeta `bin` al PATH del sistema


## Instalación
1. Instala las dependencias del frontend: npm install

2. Desde `/backend`, crea un entorno virtual e instala las dependencias de Python:
```bash
    cd backend
   python -m venv mincheck
   # Windows:
   mincheck\Scripts\activate
   # macOS/Linux:
   source mincheck/bin/activate

   pip install -r requirements.txt
```

3. Crea una base de datos en [Supabase](https://supabase.com):
   - Regístrate y crea un proyecto nuevo, elige una contraseña para la BBDD.
   - Ve a **Project Settings -> Database -> Connection string** y copia la cadena de conexión.
   - Crea un fichero `.env` dentro de `backend/` y pega las cerdenciales, algo del estilo:  DATABASE_URL=postgresql://usuario:contraseña@host:puerto/basedatos

   Las tablas se crearán automáticamente la primera vez que se arranque Flask

4. Instala [Ollama] (https://ollama.com) y descarga el modelo usado en el proyecto:
```bash
   ollama pull qwen2.5-coder:7b
```

## Puesta en marcha
1. Abre **Docker Desktop** (puede estar en segundo plano)

2. Desde la raíz del proyecto:
```bash
    npm run dev
```

3. Con el entorno virtual activado, desde ``/backend``:
```bash
    python scripts/server.py
```

4. Con el entorno virtual activado, desde ``/backend``:
```bash
    python mincheck.py
```

5. Con el entorno virtual activado, desde ``/backend``:
```bash
    ollama serve
```