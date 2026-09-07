from datetime import datetime, timezone
from fastapi import HTTPException, status

from models.category_model import CategoryCreate, CategoryUpdate, CategoryType
from models.expense_model import CategoryEnum
from database import category_repository
from utils.helpers import parse_object_id

DEFAULT_EXPENSE_CATEGORIES = [c.value for c in CategoryEnum]


async def ensure_default_expense_categories() -> None:

    count = await category_repository.count_categories(CategoryType.EXPENSE.value)
    if count > 0:
        return

    now = datetime.now(timezone.utc)
    for name in DEFAULT_EXPENSE_CATEGORIES:
        await category_repository.insert_category(
            {
                "name": name,
                "type": CategoryType.EXPENSE.value,
                "created_at": now,
                "updated_at": now,
            }
        )


async def create_category(data: CategoryCreate) -> dict:

    if await category_repository.find_category_by_name(data.name, data.type.value):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A {data.type.value} category named '{data.name}' already exists.",
        )

    now = datetime.now(timezone.utc)
    doc = {
        "name": data.name.strip(),
        "type": data.type.value,
        "created_at": now,
        "updated_at": now,
    }
    return await category_repository.insert_category(doc)


async def get_all_categories(category_type: str | None = None) -> list[dict]:

    if category_type and category_type not in (CategoryType.EXPENSE.value, CategoryType.BUDGET.value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid 'type' filter. Use 'expense' or 'budget'.",
        )
    return await category_repository.find_all_categories(category_type)


async def get_category_by_id(category_id: str) -> dict:
    
    try:
        parse_object_id(category_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category ID format: '{category_id}'.",
        )

    category = await category_repository.find_category_by_id(category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id '{category_id}' was not found.",
        )
    return category


async def update_category(category_id: str, data: CategoryUpdate) -> dict:
    
    try:
        parse_object_id(category_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category ID format: '{category_id}'.",
        )

    existing = await category_repository.find_category_by_id(category_id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id '{category_id}' was not found.",
        )

    update_fields = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields were provided for update.",
        )

    
    category_type = update_fields.get("type", existing["type"])
    if isinstance(category_type, CategoryType):
        category_type = category_type.value

    
    new_name = update_fields.get("name", existing["name"])

    duplicate = await category_repository.find_category_by_name(new_name, category_type)
    if duplicate and duplicate["id"] != category_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A {category_type} category named '{new_name}' already exists.",
        )

    if "type" in update_fields and isinstance(update_fields["type"], CategoryType):
        update_fields["type"] = update_fields["type"].value

    updated = await category_repository.update_category_by_id(category_id, update_fields)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id '{category_id}' was not found.",
        )
    return updated


async def delete_category(category_id: str) -> None:
    
    try:
        parse_object_id(category_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category ID format: '{category_id}'.",
        )

    deleted = await category_repository.delete_category_by_id(category_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category with id '{category_id}' was not found.",
        )