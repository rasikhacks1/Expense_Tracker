from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routes.expense_routes import router as expense_router
from routes.category_routes import router as category_router
from routes.budget_routes import router as budget_router
from services.category_service import ensure_default_expense_categories


@asynccontextmanager
async def lifespan(app: FastAPI):

    await ensure_default_expense_categories()
    yield



app = FastAPI(
    title="Expense Tracker API",
    description=(
        "A three-tier CRUD REST API for tracking personal expenses.\n\n"
        "**Architecture:**\n"
        "- `routes/` — Presentation Layer (HTTP endpoints)\n"
        "- `controllers/` + `services/` — Business Logic Layer\n"
        "- `database/` — Data Access Layer (MongoDB)\n\n"
        "**Resources:** Expenses, Categories, and Budgets — all CRUD."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
         "http://localhost:5174",  
        "http://localhost:3000", 
        "http://localhost:80",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(expense_router)
app.include_router(category_router)
app.include_router(budget_router)



@app.get("/", tags=["Health"], summary="Root health check")
async def root():
    
    return {
        "message": "Expense Tracker API is running 🚀",
        "docs": "/docs",
        "version": "1.0.0",
    }


@app.get("/health", tags=["Health"], summary="Health status")
async def health():
    
    return {"status": "ok"}
