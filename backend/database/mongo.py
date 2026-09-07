import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()


MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "expense_tracker")


_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(MONGODB_URL)
    return _client


def get_database():
    
    return get_client()[DATABASE_NAME]


def get_expenses_collection():
    
    return get_database()["expenses"]


def get_categories_collection():
    
    return get_database()["categories"]


def get_budgets_collection():
    
    return get_database()["budgets"]