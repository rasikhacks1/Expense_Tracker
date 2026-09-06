"""
routes/expense_routes.py
-------------------------
Presentation Layer interface — API routes for Expenses.
"""

from fastapi import APIRouter, Query
from typing import Optional
from models.expense_model import ExpenseCreate, ExpenseUpdate
import controllers.expense_controller as ctrl
from services.alert_service import get_summary

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


@router.get("/summary", summary="Get aggregated expense summary and monthly trend")
async def expense_summary(month: Optional[str] = Query(None, description="YYYY-MM")):
    return await get_summary(month)


@router.get("/", summary="List expenses (filterable by category and month)")
async def list_expenses(
    category_id: Optional[str] = Query(None),
    month: Optional[str] = Query(None, description="YYYY-MM"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
):
    return await ctrl.get_all_expenses(category_id, month, skip, limit)


@router.get("/{expense_id}", summary="Get expense by ID")
async def get_expense(expense_id: str):
    return await ctrl.get_expense_by_id(expense_id)


@router.post("/", summary="Create a new expense", status_code=201)
async def create_expense(body: ExpenseCreate):
    return await ctrl.create_expense(body)


@router.put("/{expense_id}", summary="Update an expense")
async def update_expense(expense_id: str, body: ExpenseUpdate):
    return await ctrl.update_expense(expense_id, body)


@router.delete("/{expense_id}", summary="Delete an expense")
async def delete_expense(expense_id: str):
    return await ctrl.delete_expense(expense_id)
