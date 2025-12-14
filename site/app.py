from flask import Flask, jsonify, render_template
import sqlite3
import random
import time
import threading

app = Flask(__name__)
DB_PATH = "./data/history.db"

# --- DB utils ---
def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            co2 INTEGER NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def insert_random_data():
    while True:
        co2 = random.randint(400, 2000)
        conn = sqlite3.connect(DB_PATH)
        conn.execute("INSERT INTO readings (co2) VALUES (?)", (co2,))
        conn.commit()
        conn.close()
        time.sleep(3)


def query_db(query, one=False):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.execute(query)
    rows = cur.fetchall()
    conn.close()
    return (rows[0] if rows else None) if one else rows

# --- Routes ---
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/latest")
def latest():
    row = query_db("SELECT * FROM readings ORDER BY id DESC LIMIT 1", one=True)
    return jsonify(dict(row)) if row else {}

@app.route("/api/history")
def history():
    rows = query_db("SELECT * FROM readings ORDER BY id DESC LIMIT 50")
    return jsonify([dict(r) for r in rows])


if __name__ == "__main__":
    init_db()
    threading.Thread(target=insert_random_data, daemon=True).start()
    app.run(debug=True)