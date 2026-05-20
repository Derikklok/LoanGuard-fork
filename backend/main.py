from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import init_db
from routes import predict, auth, history


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()        # create indexes on startup
    yield

app = FastAPI(
    title="Home Credit Indonesia — Loan Risk API",
    description="OJK-compliant AI loan default risk prediction (XGBoost, AUC=0.7528)",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(predict.router)
app.include_router(history.router)


@app.get("/")
def root():
    return {"message": "Home Credit Indonesia — Loan Risk API", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}