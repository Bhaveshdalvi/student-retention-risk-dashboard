import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

# ===============================
# LOAD DATA
# ===============================

df = pd.read_csv("student_retention_10percent_null_10percent_outliers.csv")

print("Initial Shape:", df.shape)

df.columns = df.columns.str.strip().str.lower()

# ===============================
# HANDLE NULL VALUES (FILL)
# ===============================

numeric_cols = [
    "age", "attendance",
    "gpa_sem1", "gpa_sem2", "gpa_sem3",
    "gpa_sem4", "gpa_sem5",
    "backlog_count"
]

for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")

df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

# ===============================
# REMOVE OUTLIERS
# ===============================

df = df[(df["attendance"] >= 30) & (df["attendance"] <= 100)]

for col in ["gpa_sem1","gpa_sem2","gpa_sem3","gpa_sem4","gpa_sem5"]:
    df = df[(df[col] >= 3) & (df[col] <= 10)]

df = df[(df["backlog_count"] >= 0) & (df["backlog_count"] <= 10)]

print("After Cleaning:", df.shape)

# ===============================
# FEATURE ENGINEERING
# ===============================

gpa_cols = ["gpa_sem1","gpa_sem2","gpa_sem3","gpa_sem4","gpa_sem5"]
df["avg_gpa"] = df[gpa_cols].mean(axis=1)

event_map = {
    "regularly": 3,
    "occasionally": 2,
    "rarely": 1,
    "never": 0
}

df["event_participation"] = df["event_participation"].astype(str).str.lower()
df["event_score"] = df["event_participation"].map(event_map).fillna(0)

df["has_backlog"] = np.where(df["backlog_count"] > 0, 1, 0)

# ===============================
# CREATE ACADEMIC RISK SCORE
# ===============================

risk_score = (
    (100 - df["attendance"]) * 0.3 +
    (10 - df["avg_gpa"]) * 8 +
    df["backlog_count"] * 5 +
    (3 - df["event_score"]) * 4
)

df["risk_probability"] = (
    risk_score - risk_score.min()
) / (risk_score.max() - risk_score.min())

# ===============================
# ENCODING
# ===============================

df_encoded = df.copy()

categorical_cols = ["gender", "course", "year"]

for col in categorical_cols:
    df_encoded[col] = LabelEncoder().fit_transform(df_encoded[col].astype(str))

# ===============================
# SELECT FEATURES
# ===============================

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

X = df_encoded[features]
y = df_encoded["risk_probability"]

# ===============================
# TRAIN-TEST SPLIT
# ===============================

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42
)

# ===============================
# TRAIN REGRESSION MODEL
# ===============================

model = RandomForestRegressor(
    n_estimators=300,
    max_depth=10,
    random_state=42
)

model.fit(X_train, y_train)

print("Academic Risk Model Trained Successfully!")

# ===============================
# EVALUATION (REGRESSION METRICS)
# ===============================

y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print("\n📊 Regression Evaluation Metrics:")
print("MAE:", round(mae, 4))
print("RMSE:", round(rmse, 4))
print("R2 Score:", round(r2, 4))

# ===============================
# GENERATE FULL DATASET PREDICTIONS
# ===============================

df_encoded["predicted_risk_probability"] = model.predict(X)

df_encoded["predicted_risk_probability"] = \
    df_encoded["predicted_risk_probability"].clip(0, 1)

# ===============================
# FORMAT FOR DASHBOARD
# ===============================

df_encoded["attendance"] = df_encoded["attendance"].round(0).astype(int)
df_encoded["avg_gpa"] = df_encoded["avg_gpa"].round(1)
df_encoded["predicted_risk_probability"] = \
    df_encoded["predicted_risk_probability"].round(2)

# ===============================
# SAVE MODEL + DATA
# ===============================

df_encoded.to_csv("processed_student_data.csv", index=False)
joblib.dump(model, "student_retention_model.pkl")

print("\nPredictions saved successfully!")