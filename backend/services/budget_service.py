from datetime import datetime, timezone
from fastapi import HTTPException, status

from models.budget_model import BudgetCreate, BudgetUpdate
from database import budget_repository, expense_repository
from utils.helpers import parse_object_id


async def _with_spent(budget: dict) -> dict:

    result = dict(budget)
    result["spent"] = await expense_repository.sum_expenses_by_category(
        budget["month"], budget["category"]
    )
    return result


async def create_budget(data: BudgetCreate) -> dict:

    existing = await budget_repository.find_budget_by_category_month(
        data.category, data.month
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A budget for '{data.category}' in {data.month} already exists.",
        )

    now = datetime.now(timezone.utc)
    doc = {
        "category": data.category.strip(),
        "amount": data.amount,
        "month": data.month,
        "created_at": now,
        "updated_at": now,
    }
    created = await budget_repository.insert_budget(doc)
    return await _with_spent(created)


async def get_all_budgets() -> list[dict]:
    budgets = await budget_repository.find_all_budgets()
    return [await _with_spent(b) for b in budgets]


async def get_budget_by_id(budget_id: str) -> dict:
    try:
        parse_object_id(budget_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid budget ID format: '{budget_id}'.",
        )

    budget = await budget_repository.find_budget_by_id(budget_id)
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget with id '{budget_id}' was not found.",
        )
    return await _with_spent(budget)


async def update_budget(budget_id: str, data: BudgetUpdate) -> dict:
    try:
        parse_object_id(budget_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid budget ID format: '{budget_id}'.",
        )

    existing = await budget_repository.find_budget_by_id(budget_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget with id '{budget_id}' was not found.",
        )

    update_fields = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields were provided for update.",
        )

    new_category = update_fields.get("category", existing["category"])
    new_month = update_fields.get("month", existing["month"])

    conflicting = await budget_repository.find_budget_by_category_month(
        new_category, new_month
    )
    if conflicting and conflicting["id"] != budget_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A budget for '{new_category}' in {new_month} already exists.",
        )

    updated = await budget_repository.update_budget_by_id(budget_id, update_fields)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget with id '{budget_id}' was not found.",
        )
    return await _with_spent(updated)


WARNING_THRESHOLD_PERCENT = 80.0


def _classify_budget(percent: float) -> str:
    if percent >= 100.0:
        return "over"
    if percent >= WARNING_THRESHOLD_PERCENT:
        return "warning"
    return "ok"


async def _budget_alert(budget: dict) -> dict:
   
    amount = budget["amount"]
    spent = budget.get("spent", 0.0)
    percent = (spent / amount * 100.0) if amount > 0 else 0.0
    percent = round(percent, 1)
    return {
        "budget_id": budget["id"],
        "category": budget["category"],
        "month": budget["month"],
        "limit": amount,
        "spent": spent,
        "percent": percent,
        "status": _classify_budget(percent),
        "message": (
            "limit exceeded"
            if percent >= 100.0
            else "at 80% of limit"
            if percent >= WARNING_THRESHOLD_PERCENT
            else "on track"
        ),
    }


async def get_budget_alerts(warn=True) -> list[dict]:
    budgets = await budget_repository.find_all_budgets()
    alerts = []
    for b in budgets:
        b = await _with_spent(b)
        a = await _budget_alert(b)
        if a["status"] in ("over", "warning"):
            alerts.append(a)
    if warn:
        return alerts
    return [a for a in alerts if a["status"] == "over"]


async def evaluate_expense_against_budget(
    category: str, month: str, amount: float
) -> dict | None:
   
    budget = await budget_repository.find_budget_by_category_month(category, month)
    if not budget:
        return None

    spent = await expense_repository.sum_expenses_by_category(budget["month"], budget["category"])
    projected = spent + float(amount)
    limit = budget["amount"]
    percent = round(projected / limit * 100.0, 1) if limit > 0 else 0.0
    status = _classify_budget(percent)
    return {
        "category": budget["category"],
        "month": budget["month"],
        "limit": limit,
        "spent": spent,
        "amount": float(amount),
        "projected": round(projected, 2),
        "percent": percent,
        "status": status,
        "message": (
            "amount exceeds the budget"
            if status == "over"
            else "amount reaches 80% of the budget"
            if status == "warning"
            else "within budget"
        ),
    }


async def delete_budget(budget_id: str) -> None:
    
    try:
        parse_object_id(budget_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid budget ID format: '{budget_id}'.",
        )

    deleted = await budget_repository.delete_budget_by_id(budget_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget with id '{budget_id}' was not found.",
        )