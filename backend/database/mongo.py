

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME: str = os.getenv("DB_NAME", "antiexpense")

# Single Motor client instance (reused across requests)
_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGO_URI)
    return _client


def get_database():
    return get_client()[DB_NAME]


# ---------- Collection helpers ----------

def get_categories_collection():
    return get_database()["categories"]


def get_expenses_collection():
    return get_database()["expenses"]


def get_budgets_collection():
    return get_database()["budgets"]
