# =============================================================================
# /api/predict.py — Vercel Serverless Handler
# Accepts POST { name } and returns { probability }.
# Model + encoded CSV loaded globally for warm-start reuse.
# =============================================================================
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app, origins=["*"])

# ── Global init ───────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_model = joblib.load(os.path.join(BASE_DIR, "..", "student_retention_model.pkl"))
_df_encoded = pd.read_csv(os.path.join(BASE_DIR, "..", "processed_student_data.csv"))

FEATURES = [
    "attendance",
    "avg_gpa",
    "has_backlog",
    "backlog_count",
    "event_score",
    "gender",
    "course",
    "year",
    "age",
]


# ── Route ─────────────────────────────────────────────────────────────────────
@app.route("/api/predict", methods=["POST", "OPTIONS"])
@app.route("/", methods=["POST", "OPTIONS"])
def predict():
    if request.method == "OPTIONS":
        return "", 204

    data = request.get_json(force=True)
    name = data.get("name", "")
    student = _df_encoded[_df_encoded["name"] == name]

    if student.empty:
        return jsonify({"error": "Student not found"}), 404

    probability = float(_model.predict_proba(student[FEATURES])[0][1])
    return jsonify({"probability": probability})

# NO app.run()
