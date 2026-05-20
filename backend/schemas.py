from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


# ─── Input ────────────────────────────────────────────────
class LoanApplicant(BaseModel):
    AMT_INCOME_TOTAL: float = Field(..., example=150_000_000)
    AMT_CREDIT:       float = Field(..., example=500_000_000)
    AMT_ANNUITY:      float = Field(..., example=25_000_000)
    AGE_YEARS:        float = Field(..., example=27)
    DAYS_EMPLOYED:    int   = Field(default=-730, example=-1000)


# ─── Output ───────────────────────────────────────────────
class PredictionResult(BaseModel):
    risk_score:            int
    risk_level:            str
    low_risk_probability:  float
    high_risk_probability: float
    prediction:            int
    risk_factors:          list[str]
    ojk_actions:           list[str]


# ─── Audit log (what gets saved to MongoDB) ───────────────
class PredictionRecord(BaseModel):
    id:           Optional[str]  = None
    officer_id:   Optional[str]  = None    # who ran the prediction
    officer_name: Optional[str]  = None
    input:        dict                     # raw applicant fields
    result:       dict                     # full prediction output
    created_at:   datetime = Field(default_factory=datetime.utcnow)


# ─── Auth ─────────────────────────────────────────────────
class UserRegister(BaseModel):
    name:     str
    email:    EmailStr
    password: str
    role:     str = "officer"   # officer | admin


class UserLogin(BaseModel):
    email:    EmailStr
    password: str


class UserOut(BaseModel):
    id:    str
    name:  str
    email: str
    role:  str


class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut