from flask import Flask, jsonify, render_template, request
import random
import time
from datetime import datetime
import os

app = Flask(__name__)


print("=" * 50)
print(f"Current directory: {os.getcwd()}")
print(f"Template folder exists: {os.path.exists('templates')}")
if os.path.exists('templates'):
    print(f"Files in templates/: {os.listdir('templates')}")
print("=" * 50)




history = []
analysis_running = True
MAX_HISTORY = 200

sim_settings = {
    "good_threshold": 800,
    "bad_threshold": 1200,
    "alert_threshold": 1400,
    "realistic_mode": True,
    "update_speed": 1,
    "base_value": 500,
    "trend": 0,
    "last_update": time.time()
}


def realistic_co2():
    current = time.time()
    
    if random.random() < 0.3:
        sim_settings["trend"] = min(sim_settings["trend"] + 0.2, 1.5)
    else:
        sim_settings["trend"] = max(sim_settings["trend"] - 0.1, 0)
    
    base = sim_settings["base_value"] + sim_settings["trend"] * 80
    ppm = int(base + random.uniform(-30, 50))
    
    sim_settings["last_update"] = current
    return max(400, min(2000, ppm))

def fake_read_co2():
    if sim_settings["realistic_mode"]:
        return realistic_co2()
    return random.randint(400, 2000)

def get_air_quality(ppm):
    if ppm < sim_settings["good_threshold"]:
        return "Bon"
    elif ppm < sim_settings["bad_threshold"]:
        return "Moyen"
    return "Mauvais"

# 1. ROOT ROUTE - DASHBOARD (MUST BE FIRST!)
@app.route("/")
def index():
    return render_template("index.html")  # Dashboard page

@app.route("/live")
def live_page():
    return render_template("live.html")  # Settings page

# 2. SETTINGS ROUTE
@app.route("/settings")
def settings_page():
    return render_template("settings.html")  # Settings page

# 3. API ROUTES
@app.route("/api/latest")
def api_latest():
    # Always send analysis_running
    if not analysis_running:
        return jsonify({
            "analysis_running": False,
            "ppm": None
        })

    ppm = fake_read_co2()
    quality = get_air_quality(ppm)

    history.append({"ppm": ppm, "quality": quality})
    if len(history) > MAX_HISTORY:
        history.pop(0)

    return jsonify({
        "analysis_running": True,
        "ppm": ppm,
        "quality": quality,
        "thresholds": {
            "good": sim_settings["good_threshold"],
            "bad": sim_settings["bad_threshold"]
        }
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
        
        if "good_threshold" in data:
            sim_settings["good_threshold"] = int(data["good_threshold"])
        if "bad_threshold" in data:
            sim_settings["bad_threshold"] = int(data["bad_threshold"])
        if "realistic_mode" in data:
            sim_settings["realistic_mode"] = bool(data["realistic_mode"])
        if "alert_threshold" in data:
            sim_settings["alert_threshold"] = int(data["alert_threshold"])
        if "update_speed" in data:
            sim_settings["update_speed"] = float(data["update_speed"])

        
        return jsonify({"status": "ok"})
    
    return jsonify({
        "analysis_running": analysis_running,
        "good_threshold": sim_settings["good_threshold"],
        "bad_threshold": sim_settings["bad_threshold"],
        "alert_threshold": sim_settings["alert_threshold"],
        "realistic_mode": sim_settings["realistic_mode"],
        "update_speed": sim_settings["update_speed"]
    })


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)