from flask import Flask, jsonify, render_template, request
import random

app = Flask(__name__)

history = []
analysis_running = True
MAX_HISTORY = 200


def fake_read_co2():
    return random.randint(400, 2000)


def get_air_quality(ppm):
    if ppm < 800:
        return "Bon"
    elif ppm < 1200:
        return "Moyen"
    return "Mauvais"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/settings")
def settings_page():
    return render_template("settings.html")


@app.route("/api/latest")
def api_latest():
    if not analysis_running:
        return jsonify({"paused": True})

    ppm = fake_read_co2()
    quality = get_air_quality(ppm)

    history.append({"ppm": ppm, "quality": quality})
    if len(history) > MAX_HISTORY:
        history.pop(0)

    return jsonify({
        "ppm": ppm,
        "quality": quality
    })


@app.route("/api/history")
def api_history():
    return jsonify(history[-20:])


@app.route("/api/settings", methods=["GET", "POST"])
def api_settings():
    global analysis_running

    if request.method == "POST":
        data = request.json
        analysis_running = data.get("analysis_running", True)
        return jsonify({"status": "ok"})

    return jsonify({
        "analysis_running": analysis_running
    })


if __name__ == "__main__":
    app.run(debug=True)
