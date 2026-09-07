from datetime import datetime, timezone
from fastapi import HTTPException, status

from models.expense_model import ExpenseAlertRequest, ExpenseCreate, ExpenseUpdate
from database import expense_repository, category_repository
from services import budget_service
from schemas.expense_schema import serialize_expense, serialize_expenses
from utils.helpers import parse_object_id


async def _validate_category(category: str) -> None:
   
    if not await category_repository.find_category_by_name(category, "expense"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown expense category: '{category}'. "
                   "Add it on the Categories page first.",
        )


async def create_expense(data: ExpenseCreate) -> dict:

    await _validate_category(data.category)

    now = datetime.now(timezone.utc)

    doc = {
        "title": data.title.strip(),
        "amount": data.amount,
        "category": data.category,       
        "description": data.description,
        "date": data.expense_date.isoformat(),    
        "created_at": now,
        "updated_at": now,
    }

    created = await expense_repository.insert_expense(doc)
    return serialize_expense(created)


async def get_all_expenses() -> list[dict]:
    expenses = await expense_repository.find_all_expenses()
    return serialize_expenses(expenses)


async def get_expense_by_id(expense_id: str) -> dict:
    try:
        parse_object_id(expense_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid expense ID format: '{expense_id}'.",
        )

    expense = await expense_repository.find_expense_by_id(expense_id)
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with id '{expense_id}' was not found.",
        )

    return serialize_expense(expense)


async def update_expense(expense_id: str, data: ExpenseUpdate) -> dict:
   
    try:
        parse_object_id(expense_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid expense ID format: '{expense_id}'.",
        )

    
    update_fields = {k: v for k, v in data.model_dump().items() if v is not None}

    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields were provided for update.",
        )

   
    if "category" in update_fields:
        await _validate_category(update_fields["category"])

    
    if "expense_date" in update_fields:
        d = update_fields.pop("expense_date")
        update_fields["date"] = d.isoformat() if hasattr(d, "isoformat") else str(d)

    updated = await expense_repository.update_expense_by_id(expense_id, update_fields)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with id '{expense_id}' was not found.",
        )

    return serialize_expense(updated)


async def delete_expense(expense_id: str) -> None:
    
    try:
        parse_object_id(expense_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid expense ID format: '{expense_id}'.",
        )

    deleted = await expense_repository.delete_expense_by_id(expense_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Expense with id '{expense_id}' was not found.",
        )


async def check_expense_budget(data: ExpenseAlertRequest) -> dict | None:
    
    month = data.date.strftime("%Y-%m")
    return await budget_service.evaluate_expense_against_budget(
        data.category, month, data.amount
    )