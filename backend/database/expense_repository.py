from datetime import datetime, timezone
from bson import ObjectId
from database.mongo import get_expenses_collection
from utils.helpers import normalize_doc, normalize_docs, parse_object_id


async def insert_expense(doc: dict) -> dict:
   
    col = get_expenses_collection()
    result = await col.insert_one(doc)
    created = await col.find_one({"_id": result.inserted_id})
    return normalize_doc(created)


async def find_all_expenses() -> list[dict]:
   
    col = get_expenses_collection()
    cursor = col.find({}).sort("date", -1)
    docs = await cursor.to_list(length=None)
    return normalize_docs(docs)


async def find_expense_by_id(expense_id: str) -> dict | None:
   
    col = get_expenses_collection()
    oid = parse_object_id(expense_id)
    doc = await col.find_one({"_id": oid})
    return normalize_doc(doc) if doc else None


async def update_expense_by_id(expense_id: str, update_fields: dict) -> dict | None:
    
    col = get_expenses_collection()
    oid = parse_object_id(expense_id)

    
    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = await col.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        return None

    updated = await col.find_one({"_id": oid})
    return normalize_doc(updated)


async def delete_expense_by_id(expense_id: str) -> bool:
   
    col = get_expenses_collection()
    oid = parse_object_id(expense_id)
    result = await col.delete_one({"_id": oid})
    return result.deleted_count > 0


async def sum_expenses_by_category(month: str, category: str) -> float:
   
    col = get_expenses_collection()
    pipeline = [
        {
            "$match": {
                "category": category,
                "date": {"$regex": f"^{month}"},
            }
        },
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    cursor = col.aggregate(pipeline)
    result = await cursor.to_list(length=1)
    return float(result[0]["total"]) if result else 0.0