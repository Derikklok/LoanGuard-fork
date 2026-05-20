import pandas as pd
import numpy as np
import pickle
import os

_model = None
_model_columns = None


def _load_model():
    global _model, _model_columns
    if _model is None:
        base = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(base, "models")
        with open(os.path.join(models_dir, "tax_risk_model.pkl"), "rb") as f:
            _model = pickle.load(f)
        with open(os.path.join(models_dir, "model_columns.pkl"), "rb") as f:
            _model_columns = pickle.load(f)
    return _model, _model_columns


def get_risk_level(score: int) -> str:
    if score >= 70:
        return "CRITICAL RISK (70-100)"
    elif score >= 50:
        return "HIGH RISK (50-70)"
    elif score >= 30:
        return "MEDIUM RISK (30-50)"
    else:
        return "LOW RISK (0-30)"


def get_risk_factors(data: dict) -> list:
    factors = []
    income        = data.get("AMT_INCOME_TOTAL", 0)
    credit        = data.get("AMT_CREDIT", 0)
    annuity       = data.get("AMT_ANNUITY", 0)
    age           = data.get("AGE_YEARS", 0)
    days_employed = data.get("DAYS_EMPLOYED", 0)

    if income > 0 and credit / income > 2:
        factors.append("Credit amount is more than 2x annual income")
    if age < 35:
        factors.append("Applicant age is below 35 years")
    if income < 200_000_000:
        factors.append("Annual income is below Rp 200,000,000")
    if income > 0 and (annuity / (income / 12)) > 0.5:
        factors.append("Monthly payment exceeds 50% of monthly income")
    if abs(days_employed) < 365 * 2:
        factors.append("Employment duration is less than 2 years")

    return factors


def get_ojk_actions(risk_level: str) -> list:
    actions = {
        "CRITICAL RISK (70-100)": [
            "Reject loan application",
            "Request additional collateral",
            "Flag in OJK credit bureau SLIK",
            "Notify risk management team"
        ],
        "HIGH RISK (50-70)": [
            "Put application on hold",
            "Request income verification slip gaji",
            "Check OJK credit history SLIK",
            "Consider requiring guarantor penjamin"
        ],
        "MEDIUM RISK (30-50)": [
            "Approve with higher interest rate",
            "Require monthly income proof",
            "Set shorter loan tenure"
        ],
        "LOW RISK (0-30)": [
            "Approve loan application",
            "Standard interest rate applies",
            "Normal processing - proses normal"
        ]
    }
    return actions.get(risk_level, [])


def predict_risk(input_data: dict) -> dict:
    model, model_columns = _load_model()

    # Derive engineered fields
    income        = input_data.get("AMT_INCOME_TOTAL", 0)
    annuity       = input_data.get("AMT_ANNUITY", 0)
    credit        = input_data.get("AMT_CREDIT", 0)
    age           = input_data.get("AGE_YEARS", 0)

    input_data["DAYS_BIRTH"]           = int(-(age * 365))
    input_data["DAYS_EMPLOYED"]        = input_data.get("DAYS_EMPLOYED", -730)
    input_data["DebtBurdenRatio"]      = credit / income if income > 0 else 0
    input_data["CreditUsageRatio"]     = (annuity / (income / 12)) if income > 0 else 0
    input_data["MinorLatePayments"]    = input_data.get("MinorLatePayments", 0)
    input_data["SevereDelinquency"]    = input_data.get("SevereDelinquency", 0)
    input_data["ModLatePayments"]      = input_data.get("ModLatePayments", 0)
    input_data["FinancialObligations"] = input_data.get("FinancialObligations", 0)
    input_data["PropertyAssets"]       = input_data.get("PropertyAssets", 0)
    input_data["Dependents"]           = input_data.get("Dependents", 0)

    # Build row with all model columns
    row = pd.DataFrame(columns=model_columns)
    row.loc[0] = 0
    for key, value in input_data.items():
        if key in model_columns:
            row[key] = value

    proba      = model.predict_proba(row)[0]
    prediction = int(model.predict(row)[0])
    risk_score = int(proba[1] * 100)
    risk_level = get_risk_level(risk_score)

    return {
        "risk_score":            risk_score,
        "risk_level":            risk_level,
        "low_risk_probability":  float(round(proba[0] * 100, 2)),
        "high_risk_probability": float(round(proba[1] * 100, 2)),
        "prediction":            int(prediction),
        "risk_factors":          get_risk_factors(input_data),
        "ojk_actions":           get_ojk_actions(risk_level)
    }