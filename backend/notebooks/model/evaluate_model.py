import pickle
import os
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score, accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, brier_score_loss
from sklearn.model_selection import train_test_split

base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'models', 'tax_risk_model.pkl')
cols_path = os.path.join(base_dir, 'models', 'model_columns.pkl')
data_path = os.path.join(base_dir, 'cs-training.csv')

if not os.path.exists(model_path) or not os.path.exists(cols_path):
    raise FileNotFoundError('Model or columns file not found. Run train_model.py first.')

if not os.path.exists(data_path):
    raise FileNotFoundError('Data file cs-training.csv not found in model directory.')

# load
with open(model_path, 'rb') as f:
    model = pickle.load(f)
with open(cols_path, 'rb') as f:
    FEATURES = pickle.load(f)

df = pd.read_csv(data_path, index_col=0)
# apply same renames and feature engineering as train_model.py
rename_map = {
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
}

df.rename(columns=rename_map, inplace=True)
# feature engineering
if 'AMT_INCOME_TOTAL' in df.columns:
    df['AMT_INCOME_TOTAL'] = df['AMT_INCOME_TOTAL'] * 12
else:
    df['AMT_INCOME_TOTAL'] = df.get('MonthlyIncome', pd.Series(0)) * 12

if 'AGE_YEARS' in df.columns:
    df['DAYS_BIRTH'] = -(df['AGE_YEARS'] * 365).astype(int)
else:
    df['DAYS_BIRTH'] = -365 * 30

if 'DAYS_EMPLOYED' not in df.columns:
    df['DAYS_EMPLOYED'] = -365 * 2

if 'DebtBurdenRatio' in df.columns:
    df['AMT_CREDIT'] = df['AMT_INCOME_TOTAL'] * df['DebtBurdenRatio']
    df['AMT_ANNUITY'] = df['AMT_INCOME_TOTAL'] / 12 * df['CreditUsageRatio']
else:
    df['AMT_CREDIT'] = 0
    df['AMT_ANNUITY'] = 0

# clean
if 'AMT_INCOME_TOTAL' in df.columns:
    df['AMT_INCOME_TOTAL'].fillna(df['AMT_INCOME_TOTAL'].median(), inplace=True)
if 'Dependents' in df.columns:
    df['Dependents'].fillna(0, inplace=True)

df.fillna(df.median(numeric_only=True), inplace=True)

X = df[FEATURES]
y = df['TARGET']

# split same as train
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

probs = model.predict_proba(X_test)[:, 1]
preds = (probs >= 0.5).astype(int)

auc = roc_auc_score(y_test, probs)
acc = accuracy_score(y_test, preds)
prec = precision_score(y_test, preds)
rec = recall_score(y_test, preds)
f1 = f1_score(y_test, preds)
cm = confusion_matrix(y_test, preds)
brier = brier_score_loss(y_test, probs)

print(f"AUC: {auc:.4f}")
print(f"Accuracy (th=0.5): {acc:.4f}")
print(f"Precision: {prec:.4f}")
print(f"Recall: {rec:.4f}")
print(f"F1: {f1:.4f}")
print("Confusion matrix (tn, fp; fn, tp):")
print(cm)
print(f"Brier score: {brier:.4f}\n")

# calibration table
bins = 10
df_eval = pd.DataFrame({'y': y_test.values, 'prob': probs})
df_eval['bin'] = pd.cut(df_eval['prob'], bins=bins)
cal = df_eval.groupby('bin').agg(mean_pred=('prob','mean'), observed=('y','mean'), count=('y','count'))
print("Calibration by bin:")
print(cal)

# show top example predictions
examples = pd.DataFrame(X_test.copy())
examples['prob'] = probs
examples['pred'] = preds
examples['true'] = y_test.values
print('\nTop 5 highest-risk examples (prob desc):')
print(examples.sort_values('prob', ascending=False).head(5))

print('\nDone.')
