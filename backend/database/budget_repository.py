from datetime import datetime, timezone
import re
from database.mongo import get_budgets_collection
from utils.helpers import normalize_doc, normalize_docs, parse_object_id


async def insert_budget(doc: dict) -> dict:
    
    col = get_budgets_collection()
    result = await col.insert_one(doc)
    created = await col.find_one({"_id": result.inserted_id})
    return normalize_doc(created)


async def find_all_budgets() -> list[dict]:
   
    col = get_budgets_collection()
    cursor = col.find({}).sort([("month", -1), ("category", 1)])
    docs = await cursor.to_list(length=None)
    return normalize_docs(docs)


async def find_budget_by_id(budget_id: str) -> dict | None:
    
    col = get_budgets_collection()
    oid = parse_object_id(budget_id)
    doc = await col.find_one({"_id": oid})
    return normalize_doc(doc) if doc else None


async def find_budget_by_category_month(category: str, month: str) -> dict | None:
    
    col = get_budgets_collection()
    escaped = re.escape(category)
    doc = await col.find_one(
        {
            "category": {"$regex": f"^{escaped}$", "$options": "i"},
            "month": month,
        }
    )
    return normalize_doc(doc) if doc else None


async def update_budget_by_id(budget_id: str, update_fields: dict) -> dict | None:
   
    col = get_budgets_collection()
    oid = parse_object_id(budget_id)
    update_fields["updated_at"] = datetime.now(timezone.utc)
    result = await col.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        return None
    updated = await col.find_one({"_id": oid})
    return normalize_doc(updated)


async def delete_budget_by_id(budget_id: str) -> bool:
    
    col = get_budgets_collection()
    oid = parse_object_id(budget_id)
    result = await col.delete_one({"_id": oid})
    return result.deleted_count > 0