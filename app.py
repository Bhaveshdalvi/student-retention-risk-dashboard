# =============================================================================
# ⚠️  DEPRECATED — DO NOT USE IN PRODUCTION
# This file is the legacy Flask development server.
# Production uses serverless handlers in /api/*.py (Vercel).
#
# For local development only:   python app.py
# For production:               vercel dev  OR  vercel --prod
# =============================================================================

from flask_cors import CORS
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load model
model = joblib.load(os.path.join(BASE_DIR, "student_retention_model.pkl"))

# Load DISPLAY file (NOT encoded one)
df_display = pd.read_csv(os.path.join(BASE_DIR, "display_student_data.csv"))

# Load PROCESSED file for prediction
df_encoded = pd.read_csv(os.path.join(BASE_DIR, "processed_student_data.csv"))

features = [
    "attendance",
    "avg_gpa",
    "has_backlog",
    "backlog_count",
    "event_score",
    "gender",
    "course",
    "year",
    "age"
]

FEATURE_LABELS = {
    "attendance":    "Attendance",
    "avg_gpa":       "Avg GPA",
    "has_backlog":   "Has Backlog",
    "backlog_count": "Backlog Count",
    "event_score":   "Event Score",
    "gender":        "Gender",
    "course":        "Course",
    "year":          "Year",
    "age":           "Age",
}

# ── Students ────────────────────────────────────────────────────────────────
@app.route("/students", methods=["GET"])
@app.route("/api/students", methods=["GET"])   # production-matching path
def get_students():
    return df_display.to_json(orient="records")

# ── Predict ──────────────────────────────────────────────────────────────────
@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])   # production-matching path
def predict():
    data = request.json
    name = data["name"]

    student = df_encoded[df_encoded["name"] == name]

    if student.empty:
        return jsonify({"error": "Student not found"})

    X_input = student[features]
    probability = model.predict_proba(X_input)[0][1]

    return jsonify({
        "probability": float(probability)
    })

# ── Feature Importance ───────────────────────────────────────────────────────
@app.route("/feature-importance", methods=["GET"])
@app.route("/api/feature-importance", methods=["GET"])   # production-matching path
def feature_importance():
    importances = model.feature_importances_
    total = importances.sum() or 1.0
    result = [
        {
            "feature": FEATURE_LABELS.get(feat, feat),
            "importance": round(float(imp / total) * 100, 2)
        }
        for feat, imp in zip(features, importances)
    ]
    result.sort(key=lambda x: x["importance"], reverse=True)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)