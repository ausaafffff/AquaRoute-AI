import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import LeaveOneGroupOut
import joblib

# 1. Setup paths dynamically
ROOT = Path.cwd()
while not (ROOT / ".git").exists() and ROOT != ROOT.parent:
    ROOT = ROOT.parent

label_path = ROOT / "data" / "labels" / "waterlogging_reports.csv"
print(f"Loading labels from: {label_path}")

lab = pd.read_csv(label_path)

# 2. Preprocessing & Feature Engineering
lab["target"] = lab["severity"].apply(lambda x: 0 if x == "none" else 1)

severity_rank = {"none": 0, "moderate": 1, "high": 2}
lab["severity_rank"] = lab["severity"].map(severity_rank)
lab = lab.sort_values(by="severity_rank", ascending=False)
df = lab.drop_duplicates(subset=["date", "lat", "lon"], keep="first").copy()

# Features and Target
X = df[["lat", "lon"]]
y = df["target"]
groups = df["date"] # Leave-One-Group-Out by event date

print(f"Dataset shape for training: {X.shape}")
print(f"Class distribution:\n{y.value_counts()}")

# 3. Baseline Model Training using Leave-One-Event-Out Cross-Validation
logo = LeaveOneGroupOut()

print("\n--- Training Baseline Random Forest Model (with Balanced Class Weights) ---")
best_model = None

for train_idx, test_idx in logo.split(X, y, groups=groups):
    X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    
    test_date = groups.iloc[test_idx].iloc[0]
    
    # Initialize Classifier with class_weight='balanced' to handle minority flood class
    model = RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=42)
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    print(f"\nEvaluated on Held-Out Event Date: {test_date}")
    print(confusion_matrix(y_test, preds, labels=[0, 1]))
    
    best_model = model
    break # Inspecting the first fold evaluation

# 4. Save the trained baseline model artifact for the API
models_dir = ROOT / "ml" / "models"
models_dir.mkdir(parents=True, exist_ok=True)
model_path = models_dir / "waterlogging_rf_baseline.joblib"

# Train final model on all data for deployment artifact
final_model = RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=42)
final_model.fit(X, y)

joblib.dump(final_model, model_path)
print(f"\n Saved baseline model artifact to: {model_path}")
print("\n Baseline model training and persistence completed successfully!")