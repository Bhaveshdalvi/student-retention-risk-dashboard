from flask import Flask, request, jsonify
from flask_cors import CORS
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

# ==========================
# GET STUDENTS (Readable)
# ==========================
@app.route("/students", methods=["GET"])
def get_students():
    return df_display.to_json(orient="records")

# ==========================
# PREDICT
# ==========================
@app.route("/predict", methods=["POST"])
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

if __name__ == "__main__":
    app.run(debug=True)