"""
main.py
--------
FastAPI application entry point.

Three-Tier Architecture:
  Presentation  → routes/
  Business Logic → controllers/ + services/
  Data Access   → database/

Run:
  uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.category_routes import router as category_router
from routes.expense_routes import router as expense_router
from routes.budget_routes import router as budget_router

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from database.mongo import get_categories_collection

DEFAULT_BUDGET_CATEGORIES = [
    {"name": "Cash", "icon": "💵", "color": "#22c55e", "is_budget": True},
    {"name": "GPay", "icon": "📱", "color": "#3b82f6", "is_budget": True},
    {"name": "Card", "icon": "💳", "color": "#8b5cf6", "is_budget": True},
]

DEFAULT_EXPENSE_CATEGORIES = [
    {"name": "Food & Dining", "icon": "🍔", "color": "#f97316", "is_budget": False},
    {"name": "Transportation", "icon": "🚗", "color": "#06b6d4", "is_budget": False},
    {"name": "Shopping", "icon": "🛍️", "color": "#ec4899", "is_budget": False},
    {"name": "Entertainment", "icon": "🎬", "color": "#a855f7", "is_budget": False},
    {"name": "Bills & Utilities", "icon": "⚡", "color": "#eab308", "is_budget": False},
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        col = get_categories_collection()
        # Seed or ensure budget categories
        for cat in DEFAULT_BUDGET_CATEGORIES:
            existing = await col.find_one({"name": {"$regex": f"^{cat['name']}$", "$options": "i"}})
            if not existing:
                await col.insert_one({
                    **cat,
                    "created_at": datetime.now(timezone.utc),
                })
            elif not existing.get("is_budget"):
                await col.update_one({"_id": existing["_id"]}, {"$set": {"is_budget": True}})

        # Seed default normal expense categories if none exist
        for cat in DEFAULT_EXPENSE_CATEGORIES:
            existing = await col.find_one({"name": {"$regex": f"^{cat['name']}$", "$options": "i"}})
            if not existing:
                await col.insert_one({
                    **cat,
                    "created_at": datetime.now(timezone.utc),
                })
    except Exception as e:
        print(f"Startup seeding error: {e}")
    yield


app = FastAPI(
    title="Expense Tracker API",
    description="Expense Tracker with Budget Alerts — Three-tier CRUD API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---- CORS (allow Vite dev server and production build) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev
        "http://localhost:3000",   # CRA dev (fallback)
        "http://localhost:80",     # Docker nginx
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers ----
app.include_router(category_router)
app.include_router(expense_router)
app.include_router(budget_router)


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": "Expense Tracker API is running 🚀",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
