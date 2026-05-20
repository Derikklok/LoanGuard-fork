# LoanGuard ML Model Training Guide

## Quick Start

### 1. Prerequisites
- Python 3.11+ installed
- uv package manager installed
- Training data: `cs-training.csv` placed in `backend/notebooks/model/`

### 2. Install Dependencies
From the project root:
```bash
uv sync --project backend
```

### 3. Train the Model
```bash
uv run --project . python notebooks/model/train_model.py
```

**Expected Output:**
```
✅ Loaded: (150000, 12)
✅ Cleaned. Missing: 0
✅ XGBoost trained!
✅ AUC Score: 0.7528
✅ Saved: .../backend/notebooks/model/models/tax_risk_model.pkl
✅ Saved: .../backend/notebooks/model/models/model_columns.pkl
```

## What the Training Script Does

### Data Preparation
- Loads `cs-training.csv` with customer credit data
- Renames columns to match LoanGuard schema
- Performs feature engineering (annuity calculations, ratio derivations)
- Cleans data (median imputation, null handling)

### Model Training
- Trains XGBoost binary classifier (default vs. non-default)
- 80/20 train-test split (stratified)
- Balances class weights for imbalanced data
- Achieves ~75% AUC on test set

### Artifacts Generated
- `models/tax_risk_model.pkl` - Trained XGBoost model
- `models/model_columns.pkl` - Feature names and order

**Note:** These files are gitignored. Store in cloud or upload separately for deployment.

## Run the API

After training:
```bash
uv run --project . python -m uvicorn main:app --reload
```

API available at: http://localhost:8000/docs

## Test a Prediction

POST to `/predict`:
```json
{
  "AMT_INCOME_TOTAL": 150000000,
  "AMT_CREDIT": 500000000,
  "AMT_ANNUITY": 25000000,
  "AGE_YEARS": 27,
  "DAYS_EMPLOYED": -1000
}
```

## Model Hyperparameters

```python
XGBClassifier(
    n_estimators=100,           # boosting rounds
    max_depth=6,                # tree depth limit
    learning_rate=0.1,          # shrinkage parameter
    scale_pos_weight=ratio,     # handle class imbalance
    eval_metric='auc',          # evaluation metric
    random_state=42             # reproducibility
)
```

## Troubleshooting

**FileNotFoundError: cs-training.csv**
→ Download training data and place in `backend/notebooks/model/`

**ModuleNotFoundError on imports**
→ Run `uv sync --project backend` first

**Memory issues**
→ Reduce dataset size or use a machine with more RAM

## Next Steps

- [ ] Hyperparameter tuning for better AUC
- [ ] Feature importance analysis
- [ ] Cross-validation for robustness
- [ ] Model versioning system
- [ ] Production deployment pipeline