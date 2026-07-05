"""
Dashboard BMW BEV — Línea 3 (Autotek México)
Servidor Flask.

Uso:
    pip install flask
    python app.py
    -> abrir http://127.0.0.1:5000/
"""
from flask import Flask, render_template

app = Flask(__name__, template_folder="template", static_folder="static")


@app.route("/")
def index():
    return render_template("Dashboard.html")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
