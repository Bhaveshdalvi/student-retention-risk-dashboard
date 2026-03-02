from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = joblib.load(os.path.join(BASE_DIR, "student_retention_model.pkl"))
df_data = pd.read_csv(os.path.join(BASE_DIR, "processed_student_data.csv"))

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

@app.route("/students", methods=["GET"])
def get_students():
    return df_data.to_json(orient="records")

@app.route("/predict", methods=["POST"])
def predict():

    data = request.json
    name = data["name"]

    student = df_data[df_data["name"] == name]

    if student.empty:
        return jsonify({"error": "Student not found"})

    X_input = student[features]

    probability = model.predict(X_input)[0]

    probability = max(0, min(1, probability))

    return jsonify({
        "risk_probability": round(float(probability), 2)
    })

if __name__ == "__main__":
    app.run(debug=True)