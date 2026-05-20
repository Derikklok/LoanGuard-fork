import pandas as pd
import numpy as np
import pickle
import os
import warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

# ================================
# LOAD DATA
# ================================
base_dir = os.path.dirname(os.path.abspath(__file__))
data_path = os.path.join(base_dir, "cs-training.csv")
if not os.path.exists(data_path):
    raise FileNotFoundError(
        "Training data not found. Place 'cs-training.csv' in "
        "backend/notebooks/model/ or update the path in train_model.py."
    )

df = pd.read_csv(data_path, index_col=0)
print(f"✅ Loaded: {df.shape}")

# ================================
# RENAME COLUMNS
# ================================
df.rename(columns={
    'SeriousDlqin2yrs':                    'TARGET',
    'RevolvingUtilizationOfUnsecuredLines': 'CreditUsageRatio',
    'age':                                  'AGE_YEARS',
    'NumberOfTime30-59DaysPastDueNotWorse': 'MinorLatePayments',
    'DebtRatio':                            'DebtBurdenRatio',
    'MonthlyIncome':                        'AMT_INCOME_TOTAL',
    'NumberOfOpenCreditLinesAndLoans':      'FinancialObligations',
    'NumberOfTimes90DaysLate':              'SevereDelinquency',
    'NumberRealEstateLoansOrLines':         'PropertyAssets',
    'NumberOfTime60-89DaysPastDueNotWorse': 'ModLatePayments',
    'NumberOfDependents':                   'Dependents'
}, inplace=True)

# ================================
# FEATURE ENGINEERING
# ================================
df['AMT_INCOME_TOTAL'] = df['AMT_INCOME_TOTAL'] * 12  # monthly → annual
df['DAYS_BIRTH']       = -(df['AGE_YEARS'] * 365).astype(int)
df['DAYS_EMPLOYED']    = -365 * 2   # placeholder (not in dataset)
df['AMT_CREDIT']       = df['AMT_INCOME_TOTAL'] * df['DebtBurdenRatio']
df['AMT_ANNUITY']      = df['AMT_INCOME_TOTAL'] / 12 * df['CreditUsageRatio']

# ================================
# CLEAN
# ================================
df['AMT_INCOME_TOTAL'].fillna(df['AMT_INCOME_TOTAL'].median(), inplace=True)
df['Dependents'].fillna(0, inplace=True)
df.fillna(df.median(numeric_only=True), inplace=True)
print(f"✅ Cleaned. Missing: {df.isnull().sum().sum()}")

# ================================
# FEATURES & TARGET
# ================================
FEATURES = [
    'CreditUsageRatio', 'AGE_YEARS', 'MinorLatePayments',
    'DebtBurdenRatio', 'AMT_INCOME_TOTAL', 'FinancialObligations',
    'SevereDelinquency', 'PropertyAssets', 'ModLatePayments',
    'Dependents', 'DAYS_BIRTH', 'DAYS_EMPLOYED',
    'AMT_CREDIT', 'AMT_ANNUITY'
]

X = df[FEATURES]
y = df['TARGET']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ================================
# TRAIN
# ================================
xgb = XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    scale_pos_weight=(y_train == 0).sum() / (y_train == 1).sum(),
    eval_metric='auc',
    random_state=42
)
xgb.fit(X_train, y_train)
print("✅ XGBoost trained!")

from sklearn.metrics import roc_auc_score
auc = roc_auc_score(y_test, xgb.predict_proba(X_test)[:, 1])
print(f"✅ AUC Score: {auc:.4f}")

# ================================
# SAVE
# ================================
models_dir = os.path.join(base_dir, "models")
os.makedirs(models_dir, exist_ok=True)

model_path = os.path.join(models_dir, "tax_risk_model.pkl")
columns_path = os.path.join(models_dir, "model_columns.pkl")

with open(model_path, "wb") as f:
    pickle.dump(xgb, f)

with open(columns_path, "wb") as f:
    pickle.dump(FEATURES, f)

print(f"✅ Saved: {model_path}")
print(f"✅ Saved: {columns_path}")