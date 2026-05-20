from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from database import users_col
from schemas import UserRegister, UserLogin, Token, UserOut
from datetime import datetime, timedelta
from bson import ObjectId
from dotenv import load_dotenv
import bcrypt, jwt, os

router = APIRouter(prefix="/auth", tags=["Auth"])


load_dotenv(".env")
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "Missing SECRET_KEY environment variable.\n"
        "Create a file named backend/.env with at least: SECRET_KEY=your_secure_secret\n"
        "See backend/.env.example for required variables."
    )
ALGORITHM  = "HS256"
TOKEN_EXP  = 60 * 24   # 24 hours in minutes

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXP)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user    = await users_col.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/register", response_model=UserOut)
async def register(body: UserRegister):
    existing = await users_col.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "name":       body.name,
        "email":      body.email,
        "password":   hash_password(body.password),
        "role":       body.role,
        "created_at": datetime.utcnow()
    }
    result = await users_col.insert_one(doc)
    return UserOut(id=str(result.inserted_id), name=body.name,
                   email=body.email, role=body.role)


@router.post("/login", response_model=Token)
async def login(body: UserLogin):
    user = await users_col.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(str(user["_id"]))
    return Token(
        access_token=token,
        user=UserOut(id=str(user["_id"]), name=user["name"],
                     email=user["email"], role=user["role"])
    )


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        id=str(current_user["_id"]),
        name=current_user["name"],
        email=current_user["email"],
        role=current_user["role"]
    )