"""
routes/budget_routes.py
------------------------
Presentation Layer interface — API routes for Budgets.
"""

from fastapi import APIRouter, Query
from typing import Optional
from models.budget_model import BudgetCreate, BudgetUpdate
import controllers.budget_controller as ctrl
from services.alert_service import compute_alerts
from database.mongo import get_budgets_collection
from datetime import datetime, timezone

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])


@router.get("/alerts", summary="Get budget alert statuses for a given month")
async def budget_alerts(month: Optional[str] = Query(None, description="YYYY-MM")):
    return await compute_alerts(month)


@router.get("/check", summary="Check if any budget exists for a given month")
async def check_budget_for_month(
    month: Optional[str] = Query(None, description="YYYY-MM — defaults to current month")
):
    """Returns {has_budget: bool, month: str} so the frontend can gate expense entry.
    Only returns has_budget=True if at least one budget with amount > 0 exists."""
    if not month:
        month = datetime.now(timezone.utc).strftime("%Y-%m")
    col = get_budgets_collection()
    doc = await col.find_one({"month": month, "amount": {"$gt": 0}})
    return {"has_budget": doc is not None, "month": month}


@router.get("/", summary="List all budgets (optionally filter by month)")
async def list_budgets(month: Optional[str] = Query(None, description="YYYY-MM")):
    return await ctrl.get_all_budgets(month)


@router.get("/{budget_id}", summary="Get budget by ID")
async def get_budget(budget_id: str):
    return await ctrl.get_budget_by_id(budget_id)


@router.post("/", summary="Create a budget for a category/month", status_code=201)
async def create_budget(body: BudgetCreate):
    return await ctrl.create_budget(body)


@router.put("/{budget_id}", summary="Update a budget")
async def update_budget(budget_id: str, body: BudgetUpdate):
    return await ctrl.update_budget(budget_id, body)


@router.delete("/{budget_id}", summary="Delete a budget")
async def delete_budget(budget_id: str):
    return await ctrl.delete_budget(budget_id)
