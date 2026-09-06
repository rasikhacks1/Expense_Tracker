

from datetime import datetime, timezone
from bson import ObjectId
from fastapi import HTTPException, status

from database.mongo import get_categories_collection
from models.category_model import CategoryCreate, CategoryUpdate
from utils.helpers import normalize_doc, normalize_docs, parse_object_id


async def create_category(data: CategoryCreate) -> dict:
    col = get_categories_collection()

    # Check for duplicate name (case-insensitive)
    existing = await col.find_one({"name": {"$regex": f"^{data.name}$", "$options": "i"}})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Category '{data.name}' already exists.",
        )

    is_budget = data.is_budget or (data.name.strip().lower() in ["cash", "gpay", "card"])
    doc = {
        "name": data.name,
        "icon": data.icon,
        "color": data.color,
        "is_budget": is_budget,
        "created_at": datetime.now(timezone.utc),
    }
    result = await col.insert_one(doc)
    created = await col.find_one({"_id": result.inserted_id})
    return normalize_doc(created)


async def get_all_categories() -> list[dict]:
    col = get_categories_collection()
    docs = await col.find().sort("created_at", -1).to_list(length=None)
    for d in docs:
        if "is_budget" not in d:
            d["is_budget"] = d.get("name", "").strip().lower() in ["cash", "gpay", "card"]
    return normalize_docs(docs)


async def get_category_by_id(category_id: str) -> dict:
    col = get_categories_collection()
    oid = parse_object_id(category_id)
    doc = await col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{category_id}' not found.",
        )
    return normalize_doc(doc)


async def update_category(category_id: str, data: CategoryUpdate) -> dict:
    col = get_categories_collection()
    oid = parse_object_id(category_id)

    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )

    cat = await col.find_one({"_id": oid})
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{category_id}' not found.",
        )

    cat_name = cat.get("name", "").strip().lower()
    if (cat_name in ["cash", "gpay", "card"] or cat.get("is_budget", False)) and "name" in update_data:
        if update_data["name"].strip().lower() not in ["cash", "gpay", "card"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Budget category '{cat['name']}' name cannot be changed.",
            )

    result = await col.update_one({"_id": oid}, {"$set": update_data})

    updated = await col.find_one({"_id": oid})
    return normalize_doc(updated)


async def delete_category(category_id: str) -> dict:
    col = get_categories_collection()
    oid = parse_object_id(category_id)

    doc = await col.find_one({"_id": oid})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Category '{category_id}' not found.",
        )

    cat_name = doc.get("name", "").strip().lower()
    if cat_name in ["cash", "gpay", "card"] or doc.get("is_budget", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Budget category '{doc['name']}' is reserved and cannot be deleted.",
        )

    await col.delete_one({"_id": oid})
    return {"message": f"Category '{doc['name']}' deleted successfully."}
