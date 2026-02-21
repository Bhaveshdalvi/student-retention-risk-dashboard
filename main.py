import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
from train_model import train_model

# ==============================
# 1️⃣ Load Data
# ==============================

df = pd.read_csv(
    r"C:\Users\Bhavesh P Dalvi\OneDrive\Documents\Student Retention Risk Scoring Model for Higher Education Institutions. (Responses) -166.csv"
)
df.columns = df.columns.str.strip()

print("Original Shape:", df.shape)

# ==============================
# 2️⃣ Rename Columns
# ==============================

df.rename(columns={
    "Full Name": "name",
    "Age": "age",
    "Gender": "gender",
    "Course / Program Enrolled": "course",
    "Year of Study": "year",
    "What is your class attendance percentage?": "attendance",
    "GPA / SGPA of Semester 1": "gpa_sem1",
    "GPA / SGPA of Semester 2": "gpa_sem2",
    "GPA / SGPA of Semester 3": "gpa_sem3",
    "GPA / SGPA of Semester 4": "gpa_sem4",
    "GPA / SGPA of Semester 5": "gpa_sem5",
    "Have you had any backlogs in previous semesters?": "backlog_status",
    "If yes, how many backlogs have you had in total?": "backlog_count",
    "Have you considered dropping out or switching courses at any time?": "dropout_thought",
    "How often do you participate in college activities or events?": "event_participation"
}, inplace=True)

# ==============================
# 3️⃣ Convert Numeric Columns
# ==============================

df['age'] = pd.to_numeric(df['age'], errors='coerce')
df['attendance'] = pd.to_numeric(df['attendance'], errors='coerce')

gpa_cols = ['gpa_sem1','gpa_sem2','gpa_sem3','gpa_sem4','gpa_sem5']
df[gpa_cols] = df[gpa_cols].apply(pd.to_numeric, errors='coerce')

df['backlog_count'] = df['backlog_count'].astype(str).str.extract(r'(\d+)')
df['backlog_count'] = pd.to_numeric(df['backlog_count'], errors='coerce')

# ==============================
# 4️⃣ Fill Missing Values
# ==============================

df['age'].fillna(df['age'].mean(), inplace=True)
df['attendance'].fillna(df['attendance'].mean(), inplace=True)
df[gpa_cols] = df[gpa_cols].fillna(df[gpa_cols].mean())

df['backlog_count'].fillna(0, inplace=True)

df['gender'].fillna(df['gender'].mode()[0], inplace=True)
df['course'].fillna(df['course'].mode()[0], inplace=True)
df['year'].fillna(df['year'].mode()[0], inplace=True)

# ==============================
# 5️⃣ Remove Invalid Rows
# ==============================

df = df[(df['age'] >= 17) & (df['age'] <= 30)]
df = df[(df['attendance'] >= 0) & (df['attendance'] <= 100)]

for col in gpa_cols:
    df[col] = df[col].astype(str).str.strip()
    df[col] = df[col].replace(['.', '-', '', ' '], np.nan)
    df[col] = pd.to_numeric(df[col], errors='coerce')
    df.loc[(df[col] < 0) | (df[col] > 10), col] = np.nan
    df[col].fillna(df[col].median(), inplace=True)

df = df[(df['backlog_count'] >= 0) & (df['backlog_count'] <= 20)]

# 6️⃣ Feature Engineering
# ==============================

df['avg_gpa'] = df[gpa_cols].mean(axis=1)

df['has_backlog'] = df['backlog_status'].map({'Yes': 1, 'No': 0})

event_map = {
    "Regularly": 3,
    "Occasionally": 2,
    "Rarely": 1,
    "Never": 0
}
df['event_score'] = df['event_participation'].map(event_map)

# 🔥 NEW IMPROVED DROPOUT RISK LOGIC

df['risk_score'] = 0

df.loc[df['avg_gpa'] < 6.5, 'risk_score'] += 1
df.loc[df['attendance'] < 70, 'risk_score'] += 1
df.loc[df['backlog_count'] > 0, 'risk_score'] += 1
df.loc[df['event_score'] <= 1, 'risk_score'] += 1

# High risk if total score >= 2
df['dropout_risk'] = np.where(df['risk_score'] >= 2, 1, 0)

# ==============================
# 🔥 7️⃣ KEEP DISPLAY COPY
# ==============================

df_display = df.copy()

# ==============================
# 🔥 8️⃣ ENCODE FOR MODEL
# ==============================

df_encoded = df.copy()

categorical_cols = ['gender','course','year']

for col in categorical_cols:
    le = LabelEncoder()
    df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))

# ==============================
# 9️⃣ Select Features
# ==============================

features = [
    'attendance',
    'avg_gpa',
    'has_backlog',
    'backlog_count',
    'event_score',
    'gender',
    'course',
    'year',
    'age'
]

X = df_encoded[features]

# ✅ CORRECT TARGET
y = df_encoded['dropout_risk']

# ==============================
# 🔥 1️⃣0️⃣ SAVE BOTH FILES
# ==============================

df_display.to_csv("display_student_data.csv", index=False)
df_encoded.to_csv("processed_student_data.csv", index=False)

print("Datasets saved successfully!")

# ==============================
# 1️⃣1️⃣ Train Model
# ==============================

model = train_model(X, y)

print("Model trained successfully!")

print("Dropout Risk Distribution:")
print(df['dropout_risk'].value_counts())