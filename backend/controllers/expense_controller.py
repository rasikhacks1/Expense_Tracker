

from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status
from typing import Optional

from database.mongo import get_expenses_collection, get_categories_collection, get_budgets_collection
from models.expense_model import ExpenseCreate, ExpenseUpdate
from utils.helpers import normalize_doc, normalize_docs, parse_object_id


async def create_expense(data: ExpenseCreate) -> dict:
    col = get_expenses_collection()
    cat_col = get_categories_collection()
    budget_col = get_budgets_collection()

    # Validate that category exists
    try:
        cat_oid = parse_object_id(data.category_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category_id format.",
        )
    cat = await cat_col.find_one({"_id": cat_oid})
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{data.category_id}' not found.",
        )

    # Derive the YYYY-MM month from the expense date
    try:
        if isinstance(data.date, str):
            expense_month = data.date[:7]  # "2026-09-15" -> "2026-09"
        else:
            expense_month = data.date.strftime("%Y-%m")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format.",
        )

    # Enforce: a budget with amount > 0 must exist for that month before expenses can be added
    existing_budget = await budget_col.find_one({"month": expense_month, "amount": {"$gt": 0}})
    if not existing_budget:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"No budget set for {expense_month}. Please set a budget for this month first.",
        )

    doc = {
        "title": data.title,
        "amount": data.amount,
        "category_id": data.category_id,
        "payment_method": data.payment_method or "Cash",
        "date": data.date,
        "note": data.note,
        "created_at": datetime.now(timezone.utc),
    }
    result = await col.insert_one(doc)
    created = await col.find_one({"_id": result.inserted_id})
    return normalize_doc(created)


async def get_all_expenses(
    category_id: Optional[str] = None,
    month: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> list[dict]:
    col = get_expenses_collection()

    query: dict = {}

    if category_id:
        query["category_id"] = category_id

    if month:
        try:
            year, mon = month.split("-")
            start_dt = datetime(int(year), int(mon), 1)
            end_dt = datetime(int(year) + 1, 1, 1) if int(mon) == 12 else datetime(int(year), int(mon) + 1, 1)
            start_str = start_dt.strftime("%Y-%m-%d")
            end_str = end_dt.strftime("%Y-%m-%d")
            query["$or"] = [
                {"date": {"$gte": start_dt, "$lt": end_dt}},
                {"date": {"$gte": start_str, "$lt": end_str}},
                {"date": {"$regex": f"^{month}"}},
            ]
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid month format. Use YYYY-MM.",
            )

    docs = (
        await col.find(query)
        .sort("date", -1)
        .skip(skip)
        .limit(limit)
        .to_list(length=limit)
    )
    return normalize_docs(docs)


async def get_expense_by_id(expense_id: str) -> dict:
    col = get_expenses_collection()
    oid = parse_object_id(expense_id)
    doc = await col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense '{expense_id}' not found.",
        )
    return normalize_doc(doc)


async def update_expense(expense_id: str, data: ExpenseUpdate) -> dict:
    col = get_expenses_collection()
    oid = parse_object_id(expense_id)

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )

    # Validate category_id if provided
    if "category_id" in update_data:
        cat_col = get_categories_collection()
        try:
            cat_oid = parse_object_id(update_data["category_id"])
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category_id format.",
            )
        cat = await cat_col.find_one({"_id": cat_oid})
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category '{update_data['category_id']}' not found.",
            )

    result = await col.update_one({"_id": oid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense '{expense_id}' not found.",
        )

    updated = await col.find_one({"_id": oid})
    return normalize_doc(updated)


async def delete_expense(expense_id: str) -> dict:
    col = get_expenses_collection()
    oid = parse_object_id(expense_id)

    doc = await col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense '{expense_id}' not found.",
        )

    await col.delete_one({"_id": oid})
    return {"message": f"Expense '{doc['title']}' deleted successfully."}
