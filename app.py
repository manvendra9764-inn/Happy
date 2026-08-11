from flask import Flask, render_template, request, jsonify
from datetime import datetime, timezone
import sqlite3, os

app = Flask(__name__)
DB = os.path.join(os.path.dirname(__file__), "visitors.db")

def init_db():
    with sqlite3.connect(DB) as con:
        con.execute("""CREATE TABLE IF NOT EXISTS visits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT,
            user_agent TEXT,
            platform TEXT,
            browser TEXT,
            screen TEXT,
            language TEXT,
            timezone TEXT
        )""")

@app.route("/")
def index():
    return render_template("index.html")

@app.post("/api/visit")
def visit():
    data = request.get_json(silent=True) or {}
    allowed = bool(data.get("consent"))
    if not allowed:
        return jsonify({"ok": False, "error": "Consent required"}), 400

    row = (
        datetime.now(timezone.utc).isoformat(),
        str(data.get("userAgent", ""))[:1000],
        str(data.get("platform", ""))[:200],
        str(data.get("browser", ""))[:200],
        str(data.get("screen", ""))[:100],
        str(data.get("language", ""))[:100],
        str(data.get("timezone", ""))[:200],
    )
    with sqlite3.connect(DB) as con:
        con.execute("""INSERT INTO visits
            (created_at,user_agent,platform,browser,screen,language,timezone)
            VALUES (?,?,?,?,?,?,?)""", row)
    return jsonify({"ok": True})

@app.get("/admin")
def admin():
    with sqlite3.connect(DB) as con:
        con.row_factory = sqlite3.Row
        rows = con.execute("SELECT * FROM visits ORDER BY id DESC").fetchall()
    return render_template("admin.html", rows=rows)

if __name__ == "__main__":
    init_db()
    app.run(host="127.0.0.1", port=5000, debug=False)
