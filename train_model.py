from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib


# ==================================================
# 🔍 Evaluation Function
# ==================================================
def evaluate_model(model, X_train, X_test, y_train, y_test):

    y_pred = model.predict(X_test)

    print("\n🔥 Logistic Regression Results:")
    print("Accuracy:", accuracy_score(y_test, y_pred))
    print("Precision:", precision_score(y_test, y_pred))
    print("Recall:", recall_score(y_test, y_pred))
    print("F1 Score:", f1_score(y_test, y_pred))

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    print("\nTrain Accuracy:", model.score(X_train, y_train))
    print("Test Accuracy:", model.score(X_test, y_test))

    return f1_score(y_test, y_pred)


# ==================================================
# 🚀 Train Model Function
# ==================================================
def train_model(X, y):

    # ==============================
    # 1️⃣ Train-Test Split
    # ==============================
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y
    )

    # ==================================================
    # 🔵 LOGISTIC REGRESSION PIPELINE (With Scaling)
    # ==================================================
    log_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('model', LogisticRegression(
            max_iter=2000,
            class_weight='balanced',
            solver='liblinear'
        ))
    ])

    # Hyperparameter tuning
    param_grid = {
        'model__C': [0.01, 0.1, 0.5, 1, 5, 10]
    }

    grid = GridSearchCV(
        log_pipeline,
        param_grid,
        cv=5,
        scoring='f1',
        n_jobs=-1
    )

    # Train
    grid.fit(X_train, y_train)

    best_model = grid.best_estimator_

    print("\n🏆 Final Selected Model: Logistic Regression")
    print("Best Parameters:", grid.best_params_)

    # Evaluate
    evaluate_model(best_model, X_train, X_test, y_train, y_test)

    # Save Model
    joblib.dump(best_model, "student_retention_model.pkl")
    print("✅ Logistic Regression Model Saved Successfully!")

    return best_model