# DASHBOARD BMW BEV — Línea 3 (Autotek México)

```
DASHBOARD BMW BEV/
├── app.py                  ← Servidor Flask (Backend)
├── _preview.html           ← Previsualización estática local (Rutas relativas)
├── template/               ← Vistas HTML
│   ├── index.html          ← Contenedor principal (Incluye partials)
│   └── partials/           ← Marcado modular y <template>s para JS
│       ├── calendario.html
│       ├── hora.html
│       ├── acceso.html
│       └── tacometro.html
└── static/                 ← Assets estáticos
    ├── css/                ← Estilos independientes por módulo
    ├── js/                 ← Lógica pura de control y renderizado
    └── img/                ← Logos institucionales

```
## Instalacion y Despliegue 

# 1. Acceder al directorio del proyecto
cd "DASHBOARD BMW BEV"

# 2. Crear el entorno virtual
python -m venv env

# 3. Activar el entorno virtual
# Windows:
env\Scripts\activate
# macOS / Linux:
source env/bin/activate

# 4. Instalar dependencias
pip install flask

# 5. Iniciar el servidor
python app.py