# Flask backend for the Student Retention Risk Dashboard
# This file sets up the API that the React frontend communicates with.
# Run this with: python app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import os
from config import FEATURES, FEATURE_LABELS

app = Flask(__name__)
CORS(app)  # allow requests from the React frontend running on a different port

# Use the directory of this file as base so paths work on any machine
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the trained model and datasets once at startup
# (No need to reload these on every request — that would be slow)
model      = joblib.load(os.path.join(BASE_DIR, "student_retention_model.pkl"))
df_display = pd.read_csv(os.path.join(BASE_DIR, "display_student_data.csv"))
df_encoded = pd.read_csv(os.path.join(BASE_DIR, "processed_student_data.csv"))




# Route: Get all students
# Returns the full display dataset as JSON — used to populate the dashboard table
@app.route("/students", methods=["GET"])
@app.route("/api/students", methods=["GET"])
def get_students():
    return df_display.to_json(orient="records")


# Route: Predict risk for a single student
# Receives student name in POST body, looks them up in encoded data, runs model prediction
@app.route("/predict", methods=["POST"])
@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.json
    name = data.get("name", "")

    student_row = df_encoded[df_encoded["name"] == name]

    if student_row.empty:
        return jsonify({"error": "Student not found"}), 404

    X_input = student_row[FEATURES]
    risk_score = float(model.predict(X_input)[0])
    risk_score = round(max(0.0, min(1.0, risk_score)), 4)  # clip to [0, 1]

    return jsonify({"probability": risk_score})


# Route: Feature importance
# Returns which features the model relies on most — shown as a bar chart in the dashboard
@app.route("/feature-importance", methods=["GET"])
@app.route("/api/feature-importance", methods=["GET"])
def feature_importance():
    importances = model.feature_importances_
    total = importances.sum() if importances.sum() > 0 else 1.0

    result = []
    for feat, imp in zip(FEATURES, importances):
        result.append({
            "feature":    FEATURE_LABELS.get(feat, feat),
            "importance": round(float(imp / total) * 100, 2)
        })

    result.sort(key=lambda x: x["importance"], reverse=True)
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)