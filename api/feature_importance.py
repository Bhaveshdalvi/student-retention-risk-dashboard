# =============================================================================
# /api/feature_importance.py — Vercel Serverless Handler
# Returns sorted feature importance from the RandomForest model.
# Importance is computed ONCE at module load and cached — O(0) per request.
# =============================================================================
from flask import Flask, jsonify
from flask_cors import CORS
import joblib
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from config import FEATURES, FEATURE_LABELS

app = Flask(__name__)
CORS(app, origins=["*"])

# ── Global init ───────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_model = joblib.load(os.path.join(BASE_DIR, "..", "student_retention_model.pkl"))



# Pre-compute at cold start — reused for every warm request at zero cost
_raw = _model.feature_importances_
_total = _raw.sum() or 1.0
_CACHED_IMPORTANCE = sorted(
    [
        {
            "feature": FEATURE_LABELS.get(f, f),
            "importance": round(float(imp / _total) * 100, 2),
        }
        for f, imp in zip(FEATURES, _raw)
    ],
    key=lambda x: x["importance"],
    reverse=True,
)


# ── Route ─────────────────────────────────────────────────────────────────────
@app.route("/api/feature-importance", methods=["GET"])
@app.route("/", methods=["GET"])
def feature_importance():
    return jsonify(_CACHED_IMPORTANCE)

# NO app.run()
