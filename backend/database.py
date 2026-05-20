from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from dotenv import load_dotenv
import os


load_dotenv(".env")

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME", "homecredit_db")
client = AsyncIOMotorClient(MONGO_URL)
db     = client[DB_NAME]

# Collections
predictions_col = db["predictions"]   # audit log of every prediction
users_col       = db["users"]         # officer accounts


async def init_db():
    """Create indexes on startup."""
    # Predictions: fast lookup by officer and date
    await predictions_col.create_index([("officer_id", ASCENDING)])
    await predictions_col.create_index([("created_at", DESCENDING)])

    # Users: unique email
    await users_col.create_index([("email", ASCENDING)], unique=True)

    print("✅ MongoDB indexes created")