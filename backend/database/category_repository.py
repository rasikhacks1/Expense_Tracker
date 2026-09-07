from datetime import datetime, timezone
import re
from database.mongo import get_categories_collection
from utils.helpers import normalize_doc, normalize_docs, parse_object_id


async def insert_category(doc: dict) -> dict:
    
    col = get_categories_collection()
    result = await col.insert_one(doc)
    created = await col.find_one({"_id": result.inserted_id})
    return normalize_doc(created)


async def find_all_categories(category_type: str | None = None) -> list[dict]:

    col = get_categories_collection()
    query = {"type": category_type} if category_type else {}
    cursor = col.find(query).sort("name", 1)
    docs = await cursor.to_list(length=None)
    return normalize_docs(docs)


async def find_category_by_id(category_id: str) -> dict | None:
   
    col = get_categories_collection()
    oid = parse_object_id(category_id)
    doc = await col.find_one({"_id": oid})
    return normalize_doc(doc) if doc else None


async def find_category_by_name(name: str, category_type: str) -> dict | None:
    
    col = get_categories_collection()
    escaped = re.escape(name)
    doc = await col.find_one(
        {"type": category_type, "name": {"$regex": f"^{escaped}$", "$options": "i"}}
    )
    return normalize_doc(doc) if doc else None


async def count_categories(category_type: str) -> int:
    
    col = get_categories_collection()
    return await col.count_documents({"type": category_type})


async def update_category_by_id(category_id: str, update_fields: dict) -> dict | None:
    
    col = get_categories_collection()
    oid = parse_object_id(category_id)
    update_fields["updated_at"] = datetime.now(timezone.utc)
    result = await col.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        return None
    updated = await col.find_one({"_id": oid})
    return normalize_doc(updated)


async def delete_category_by_id(category_id: str) -> bool:
   
    col = get_categories_collection()
    oid = parse_object_id(category_id)
    result = await col.delete_one({"_id": oid})
    return result.deleted_count > 0