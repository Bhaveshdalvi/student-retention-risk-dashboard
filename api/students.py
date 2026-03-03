# =============================================================================
# /api/students.py — Vercel Serverless Handler
# Serves the full student display dataset.
# Model-free: no .pkl loaded here, only the display CSV.
# =============================================================================
from flask import Flask
from flask_cors import CORS
import pandas as pd
import os

app = Flask(__name__)
CORS(app, origins=["*"])

# ── Global init (runs once per cold start, cached for warm invocations) ──────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_df = pd.read_csv(os.path.join(BASE_DIR, "..", "display_student_data.csv"))
_json_cache = _df.to_json(orient="records")  # pre-serialised for speed


# ── Route (registered at both paths for Vercel + local Flask compat) ─────────
@app.route("/api/students", methods=["GET"])
@app.route("/", methods=["GET"])
def students():
    return _json_cache, 200, {"Content-Type": "application/json"}

# NO app.run() — Vercel uses `app` as the WSGI callable directly
