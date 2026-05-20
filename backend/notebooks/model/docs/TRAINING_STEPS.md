# LoanGuard ML Model Training Steps

## Overview
This document outlines the steps to train the XGBoost loan default risk prediction model.

## Prerequisites
- Python 3.11+
- Dependencies installed via `uv sync`
- Training data: `cs-training.csv` (should be in the same directory)

## Step 1: Prepare Environment
```bash
# Navigate to the model directory
cd backend/notebooks/model

# Ensure all dependencies are installed
uv sync --project ../../..
```

## Step 2: Data Preparation
The training script (`train_model.py`) handles:
- Loading CSV data from `cs-training.csv`
- Renaming columns to match schema
- Feature engineering (income annualization, ratio calculations)
- Data cleaning (median imputation, null handling)

**Required columns in CSV:**
- `SeriousDlqin2yrs` → TARGET (label)
- `age` → AGE_YEARS
- `MonthlyIncome` → AMT_INCOME_TOTAL
- `DebtRatio` → DebtBurdenRatio
- And other financial indicators

## Step 3: Run Training
```bash
# From project root
uv run --project backend python backend/notebooks/model/train_model.py
```

**Expected output:**
```
✅ Loaded: (150000, 12)
✅ Cleaned. Missing: 0
✅ XGBoost trained!
✅ AUC Score: 0.7528
✅ Saved: backend/notebooks/model/models/tax_risk_model.pkl
✅ Saved: backend/notebooks/model/models/model_columns.pkl
```

## Step 4: Model Artifacts
After training, the following files are created:
- `models/tax_risk_model.pkl` - Trained XGBoost model
- `models/model_columns.pkl` - Feature column names and order

**⚠️ Important:** These pickles are ignored in `.gitignore`. Add them manually for deployment or store in cloud storage.

## Step 5: Verify Model
The model is automatically loaded when the API receives a `/predict` request.

Test with:
```bash
uv run --project backend python -m uvicorn backend.main:app --reload
```

Then POST to `/predict` with sample data:
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
    n_estimators=100,           # 100 boosting rounds
    max_depth=6,                # Tree depth
    learning_rate=0.1,          # Shrinkage
    scale_pos_weight=ratio,     # Imbalance handling
    eval_metric='auc',          # Evaluation metric
    random_state=42             # Reproducibility
)
```

## Train/Test Split
- **Train set:** 80% (stratified)
- **Test set:** 20% (stratified)
- **Random state:** 42

## Performance Metrics
- **AUC Score:** ~0.7528 (expected baseline)
- **Evaluation:** Binary classification (default vs. non-default)

## Troubleshooting

### Missing `cs-training.csv`
**Error:** `FileNotFoundError: cs-training.csv`
**Fix:** Download and place training data in `backend/notebooks/model/` directory

### Memory Issues
**Error:** `MemoryError` during training
**Fix:** Reduce batch size or use data sampling

### Pickle Load Errors
**Error:** `ModuleNotFoundError` when loading model
**Fix:** Ensure all dependencies match training environment versions

## Next Steps
1. Evaluate model performance on additional test sets
2. Hyperparameter tuning for improved AUC
3. Feature importance analysis
4. Cross-validation for robustness
5. Deploy to production with model versioning

## Files Involved
- `train_model.py` - Training script
- `predict.py` - Inference module
- `cs-training.csv` - Training data (not in repo)
- `models/tax_risk_model.pkl` - Trained model (ignored)
- `models/model_columns.pkl` - Feature metadata (ignored)
