# 1. Import Libraries
# ------------------------------------------------------------------
# Standard libraries we need for data processing, model training,
# evaluation and saving the model

import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# 2. Load Dataset
# ------------------------------------------------------------------
# Reading the student data CSV — this file contains responses collected
# from students including their GPA, attendance, backlogs etc.

df = pd.read_csv(os.path.join(BASE_DIR, "Student_Data.csv"))
print("Dataset loaded. Shape:", df.shape)

# Clean up column names — remove extra spaces and make lowercase
df.columns = df.columns.str.strip().str.lower()


# 3. Data Cleaning
# ------------------------------------------------------------------
# First, convert numeric columns properly because some might come
# in as strings from the form responses. Then fill missing values
# with the median (safer than mean for skewed data).

numeric_cols = [
    "age", "attendance",
    "gpa_sem1", "gpa_sem2", "gpa_sem3",
    "gpa_sem4", "gpa_sem5",
    "backlog_count"
]

for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

# Remove obviously wrong values — attendance can't be below 30% or above 100%
df = df[(df["attendance"] >= 30) & (df["attendance"] <= 100)]

# GPA should be between 3.0 and 10.0 based on our college grading system
for col in ["gpa_sem1", "gpa_sem2", "gpa_sem3", "gpa_sem4", "gpa_sem5"]:
    df = df[(df[col] >= 3) & (df[col] <= 10)]

# Backlog count shouldn't realistically exceed 10
df = df[(df["backlog_count"] >= 0) & (df["backlog_count"] <= 10)]

print("After cleaning:", df.shape)


# 4. Feature Engineering
# ------------------------------------------------------------------
# Create new useful features from existing data

gpa_cols = ["gpa_sem1", "gpa_sem2", "gpa_sem3", "gpa_sem4", "gpa_sem5"]

# Average GPA across all 5 semesters
df["avg_gpa"] = df[gpa_cols].mean(axis=1)

# Convert event participation text to numeric score
# We're giving more weight to students who participate regularly
event_map = {
    "regularly":    3,
    "occasionally": 2,
    "rarely":       1,
    "never":        0
}
df["event_participation"] = df["event_participation"].astype(str).str.lower()
df["event_score"] = df["event_participation"].map(event_map).fillna(0)

# Binary flag for whether student has any backlogs at all
df["has_backlog"] = np.where(df["backlog_count"] > 0, 1, 0)

# GPA trend: positive means improving over degree, negative means declining
# A declining student may be higher risk even if their average GPA looks acceptable
df["gpa_trend"] = df["gpa_sem5"] - df["gpa_sem1"]


# 5. Create Risk Score (Target Variable)
# ------------------------------------------------------------------
# We personally designed this formula based on what we think
# contributes most to dropout risk. Weights were decided after
# reviewing literature on student retention.

# Risk formula weights — based on student retention literature
# Higher weight = stronger influence on dropout probability
ATTENDANCE_WEIGHT = 0.3   # low attendance is a moderate risk signal
GPA_WEIGHT        = 8     # GPA has the strongest influence on risk
BACKLOG_WEIGHT    = 5     # each backlog significantly raises risk
EVENT_WEIGHT      = 4     # disengagement from campus life raises risk

risk_raw = (
    (100 - df["attendance"]) * ATTENDANCE_WEIGHT +   # low attendance increases risk
    (10  - df["avg_gpa"])    * GPA_WEIGHT        +   # lower GPA = more risk
    df["backlog_count"]      * BACKLOG_WEIGHT    +   # each backlog adds risk
    (3   - df["event_score"])* EVENT_WEIGHT           # less participation = higher risk
)

# Normalize the score to a 0–1 range
df["risk_probability"] = (risk_raw - risk_raw.min()) / (risk_raw.max() - risk_raw.min())


# 6. Encode Categorical Columns for the Model
# ------------------------------------------------------------------
# Random Forest can't take strings directly, so we encode them as numbers.
# We copy the dataframe first to keep the original readable version.

df_encoded = df.copy()

for col in ["gender", "course", "year"]:
    df_encoded[col] = LabelEncoder().fit_transform(df_encoded[col].astype(str))


# 7. Select Features and Split Data
# ------------------------------------------------------------------
# These are the features we're using to predict risk.
# We went through a few iterations and these gave the best results.

features = [
    "attendance",
    "avg_gpa",
    "has_backlog",
    "backlog_count",
    "event_score",
    "gender",
    "course",
    "year",
    "age",
    "gpa_trend"
]

X = df_encoded[features]
y = df_encoded["risk_probability"]

# 80/20 train-test split with a fixed random seed for reproducibility
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

print(f"Training samples: {X_train.shape[0]}")
print(f"Testing samples:  {X_test.shape[0]}")


# 8. Train the Model
# ------------------------------------------------------------------
# We used RandomForestRegressor because it handles mixed feature types
# well and doesn't require much feature scaling. After trying a few
# configurations, n_estimators=300 with max_depth=10 worked well.

model = RandomForestRegressor(n_estimators=300, max_depth=10, random_state=42)
model.fit(X_train, y_train)

print("Model training done.")


# 9. Model Evaluation
# ------------------------------------------------------------------
# Evaluate on training and test set to check for overfitting

preds_test  = model.predict(X_test)
preds_train = model.predict(X_train)

train_r2 = r2_score(y_train, preds_train)
test_r2  = r2_score(y_test,  preds_test)
mae      = mean_absolute_error(y_test, preds_test)
rmse     = np.sqrt(mean_squared_error(y_test, preds_test))

# 5-fold cross validation gives a more reliable estimate of generalization
cv_scores = cross_val_score(model, X, y, cv=5, scoring="r2")

print("\n==============================")
print("   Model Evaluation Summary   ")
print("==============================")
print(f"Training R²   : {train_r2:.4f}")
print(f"Testing  R²   : {test_r2:.4f}")
print(f"MAE           : {mae:.4f}")
print(f"RMSE          : {rmse:.4f}")
print(f"CV R² Mean    : {cv_scores.mean():.4f}")
print(f"CV R² Std Dev : {cv_scores.std():.4f}")
print("==============================\n")


# 10. Evaluation Plots
# ------------------------------------------------------------------
# These plots help us visually verify model quality for the report.
# Saving them as PNGs instead of showing inline so the script runs cleanly.

# Predicted vs Actual — ideally all points should be close to the diagonal
plt.figure(figsize=(7, 6))
plt.scatter(y_test, preds_test, alpha=0.4, color="steelblue", edgecolors="none", s=20)
plt.plot([0, 1], [0, 1], "r--", linewidth=1.5, label="Perfect Prediction")
plt.xlabel("Actual Risk Score")
plt.ylabel("Predicted Risk Score")
plt.title("Predicted vs Actual Risk Score (Test Set)")
plt.legend()
plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "eval_predicted_vs_actual.png"), dpi=150)
plt.close()
print("Plot saved: eval_predicted_vs_actual.png")

# Residual plot — residuals should be randomly scattered around 0 (no pattern)
residuals = y_test.values - preds_test

plt.figure(figsize=(7, 5))
plt.scatter(preds_test, residuals, alpha=0.4, color="darkorange", edgecolors="none", s=20)
plt.axhline(y=0, color="red", linestyle="--", linewidth=1.5)
plt.xlabel("Predicted Risk Score")
plt.ylabel("Residual (Actual - Predicted)")
plt.title("Residual Plot (Test Set)")
plt.tight_layout()
plt.savefig(os.path.join(BASE_DIR, "eval_residuals.png"), dpi=150)
plt.close()
print("Plot saved: eval_residuals.png")


# 11. Generate Predictions for All Students and Save Files
# ------------------------------------------------------------------
# After training, we run predictions on the full dataset (not just test set)
# so every student gets a risk score in the output CSV files used by the dashboard.

df_encoded["predicted_risk_probability"] = model.predict(X).clip(0, 1)

# Create a clean display version with original readable values (not encoded)
df_display = df.copy()
df_display["attendance"] = df_display["attendance"].round(0).astype(int)
for col in gpa_cols:
    df_display[col] = df_display[col].round(1)
df_display["avg_gpa"] = df_display["avg_gpa"].round(1)
df_display["predicted_risk_probability"] = df_encoded["predicted_risk_probability"].round(2)

# Simple risk level label based on probability thresholds
def get_risk_level(prob):
    if prob <= 0.3:
        return "Low"
    elif prob <= 0.6:
        return "Medium"
    else:
        return "High"

df_display["risk_level"] = df_display["predicted_risk_probability"].apply(get_risk_level)

# Save both versions — encoded one is used for prediction API, display one for the dashboard table
df_encoded.to_csv(os.path.join(BASE_DIR, "processed_student_data.csv"), index=False)
df_display.to_csv(os.path.join(BASE_DIR, "display_student_data.csv"), index=False)

# Save the trained model
joblib.dump(model, os.path.join(BASE_DIR, "student_retention_model.pkl"))

print("\nModel and datasets saved successfully!")