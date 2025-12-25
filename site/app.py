from flask import Flask, jsonify, render_template, request, make_response
import random
import time
from datetime import datetime, date
import os
from database import get_db, init_db
import json
from flask import send_file
import io
from weasyprint import HTML

from fake_co2 import generate_co2, save_reading


app = Flask(__name__)

init_db()

def load_settings():
    db = get_db()
    rows = db.execute("SELECT key, value FROM settings").fetchall()
    db.close()

    settings = DEFAULT_SETTINGS.copy()
    for r in rows:
        settings[r["key"]] = json.loads(r["value"])

    return settings

print("=" * 50)
print(f"Current directory: {os.getcwd()}")
print(f"Template folder exists: {os.path.exists('templates')}")
if os.path.exists('templates'):
    print(f"Files in templates/: {os.listdir('templates')}")
print("=" * 50)

DEFAULT_SETTINGS = {
    "analysis_running": True,
    "good_threshold": 800,
    "bad_threshold": 1200,
    "alert_threshold": 1400,
    "realistic_mode": True,
    "update_speed": 1,
}

def save_settings(data):
    db = get_db()
    for k, v in data.items():
        db.execute(
            "REPLACE INTO settings (key, value) VALUES (?, ?)",
            (k, json.dumps(v))
        )
    db.commit()
    db.close()

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

@app.route("/analytics")
def analytics():
    return render_template("analytics.html")

@app.route("/api/history/<range>")
def history_range(range):
    db = get_db()

    if range == "today":
        rows = db.execute("""
            SELECT ppm, timestamp
            FROM co2_readings
            WHERE date(timestamp) = date('now')
            ORDER BY timestamp
        """).fetchall()

    elif range == "7d":
        rows = db.execute("""
            SELECT ppm, timestamp
            FROM co2_readings
            WHERE timestamp >= datetime('now', '-7 days')
            ORDER BY timestamp
        """).fetchall()

    elif range == "30d":
        rows = db.execute("""
            SELECT ppm, timestamp
            FROM co2_readings
            WHERE timestamp >= datetime('now', '-30 days')
            ORDER BY timestamp
        """).fetchall()

    else:
        db.close()
        return jsonify({"error": "Invalid range"}), 400

    db.close()
    return jsonify([dict(r) for r in rows])

# 3. API ROUTES
@app.route("/api/latest")
def api_latest():
    settings = load_settings()

    if not settings["analysis_running"]:
        resp = make_response(jsonify({
            "analysis_running": False,
            "ppm": None
        }))
        resp.headers["Cache-Control"] = "no-store"
        return resp

    ppm = generate_co2(settings["realistic_mode"])
    save_reading(ppm)

    resp = make_response(jsonify({
        "analysis_running": True,
        "ppm": ppm,
        "timestamp": datetime.utcnow().isoformat()
    }))
    resp.headers["Cache-Control"] = "no-store"
    return resp

@app.route("/api/history/today")
def api_history_today():
    db = get_db()
    rows = db.execute("""
        SELECT ppm, timestamp
        FROM co2_readings
        WHERE date(timestamp) = date('now')
        ORDER BY timestamp
    """).fetchall()
    db.close()

    return jsonify([dict(r) for r in rows])

def get_today_history():
    db = get_db()
    rows = db.execute("""
        SELECT ppm, timestamp
        FROM co2_readings
        WHERE date(timestamp) = date('now')
        ORDER BY timestamp
    """).fetchall()
    db.close()

    return [dict(r) for r in rows]


@app.route("/api/settings", methods=["GET", "POST", "DELETE"])
def api_settings():
    if request.method == "POST":
        save_settings(request.json)
        return jsonify({"status": "ok"})

    if request.method == "DELETE":
        db = get_db()
        db.execute("DELETE FROM settings")
        db.commit()
        db.close()
        return jsonify(DEFAULT_SETTINGS)

    return jsonify(load_settings())

@app.route("/api/history/latest/<int:limit>")
def api_history_latest(limit):
    db = get_db()
    rows = db.execute("""
        SELECT id, ppm, timestamp
        FROM co2_readings
        ORDER BY id DESC
        LIMIT ?
    """, (limit,)).fetchall()
    db.close()

    # reverse so oldest → newest
    return jsonify([dict(r) for r in reversed(rows)])


def generate_pdf(html):
    pdf_io = io.BytesIO()

    HTML(
        string=html,
        base_url=os.path.abspath(".")
    ).write_pdf(
        target=pdf_io,
        presentational_hints=True
    )

    pdf_io.seek(0)

    return send_file(
        pdf_io,
        mimetype="application/pdf",
        as_attachment=False,
        download_name="daily_report.pdf"
    )


@app.route("/api/report/daily/pdf")
def export_daily_pdf():
    data = get_today_history()
    settings = load_settings()

    if not data:
        return "No data", 400

    values = [d["ppm"] for d in data]

    avg = round(sum(values) / len(values))
    max_ppm = max(values)
    min_ppm = min(values)

    # ⏱ minutes above bad threshold
    bad_minutes = sum(1 for v in values if v >= settings["bad_threshold"])

    # ✅ EXPOSURE BREAKDOWN (THIS IS YOUR QUESTION)
    good = sum(1 for v in values if v < settings["good_threshold"])
    medium = sum(
        1 for v in values
        if settings["good_threshold"] <= v < settings["bad_threshold"]
    )
    bad = sum(1 for v in values if v >= settings["bad_threshold"])
    total = len(values)

    good_pct = round(good / total * 100)
    medium_pct = round(medium / total * 100)
    bad_pct = round(bad / total * 100)

    with open("static/css/report.css", "r", encoding="utf-8") as f:
        report_css = f.read()

    html = render_template(
        "report_daily.html",
        date=date.today().strftime("%d %B %Y"),
        avg=avg,
        max=max_ppm,
        min=min_ppm,
        bad_minutes=bad_minutes,
        good_pct=good_pct,
        medium_pct=medium_pct,
        bad_pct=bad_pct,
        good_threshold=settings["good_threshold"],
        bad_threshold=settings["bad_threshold"],
        generated_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        report_css=report_css
    )

    return generate_pdf(html)




if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)