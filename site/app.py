from flask import Flask, jsonify, render_template
from data.fake_co2 import read_co2, air_quality, alert

app = Flask(__name__)

history = []  # in-memory for now (SQLite later)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/latest")
def api_latest():
    ppm = read_co2()
    data = {
        "ppm": ppm,
        "quality": air_quality(ppm),
        "alert": alert(ppm)
    }
    history.append(data)
    return jsonify(data)

@app.route("/api/history")
def api_history():
    return jsonify(history[-50:])  # last 50 values

if __name__ == "__main__":
    app.run(debug=True)
