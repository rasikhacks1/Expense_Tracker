

from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from typing import Optional

from database.mongo import get_budgets_collection, get_categories_collection
from models.budget_model import BudgetCreate, BudgetUpdate
from utils.helpers import normalize_doc, normalize_docs, parse_object_id


def create_budget(data: BudgetCreate) -> dict:
    col = get_budgets_collection()
    cat_col = get_categories_collection()

    # Validate category exists
    try:
        cat_oid = parse_object_id(data.category_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category_id format.",
        )
    cat = cat_col.find_one({"_id": cat_oid})
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{data.category_id}' not found.",
        )

    cat_name = cat.get("name", "").strip().lower()
    if cat_name not in ["cash", "gpay", "card"] and not cat.get("is_budget", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Budgets can only be set for Cash, GPay, or Card.",
        )

    # One budget per category per month
    existing = col.find_one(
        {"category_id": data.category_id, "month": data.month}
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Budget for this category in {data.month} already exists. Use PUT to update.",
        )

    doc = {
        "category_id": data.category_id,
        "month": data.month,
        "limit": data.limit,
        "created_at": datetime.now(timezone.utc),
    }
    result = col.insert_one(doc)
    created = col.find_one({"_id": result.inserted_id})
    return normalize_doc(created)


def get_all_budgets(month: Optional[str] = None) -> list[dict]:
    col = get_budgets_collection()
    query = {"month": month} if month else {}
    docs = list(col.find(query).sort("created_at", -1))
    return normalize_docs(docs)


def get_budget_by_id(budget_id: str) -> dict:
    col = get_budgets_collection()
    oid = parse_object_id(budget_id)
    doc = col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget '{budget_id}' not found.",
        )
    return normalize_doc(doc)


def update_budget(budget_id: str, data: BudgetUpdate) -> dict:
    col = get_budgets_collection()
    oid = parse_object_id(budget_id)

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )

    result = col.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget '{budget_id}' not found.",
        )

    updated = col.find_one({"_id": oid})
    return normalize_doc(updated)


def delete_budget(budget_id: str) -> dict:
    col = get_budgets_collection()
    oid = parse_object_id(budget_id)

    doc = col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget '{budget_id}' not found.",
        )

    col.delete_one({"_id": oid})
    return {"message": "Budget deleted successfully."}
