from datetime import datetime, timezone
from bson import ObjectId
from database.mongo import get_expenses_collection
from utils.helpers import normalize_doc, normalize_docs, parse_object_id


async def insert_expense(doc: dict) -> dict:
    """
    Insert a new expense document into MongoDB.

    Args:
        doc: A dictionary containing the expense fields.

    Returns:
        The inserted document with 'id' instead of '_id'.
    """
    col = get_expenses_collection()
    result = await col.insert_one(doc)
    created = await col.find_one({"_id": result.inserted_id})
    return normalize_doc(created)


async def find_all_expenses() -> list[dict]:
    """
    Retrieve all expense documents sorted by date descending.

    Returns:
        A list of expense dicts with 'id' instead of '_id'.
    """
    col = get_expenses_collection()
    cursor = col.find({}).sort("date", -1)
    docs = await cursor.to_list(length=None)
    return normalize_docs(docs)


async def find_expense_by_id(expense_id: str) -> dict | None:
    """
    Find a single expense by its string ID.

    Args:
        expense_id: A 24-character hex MongoDB ObjectId string.

    Returns:
        The expense dict with 'id', or None if not found.
    """
    col = get_expenses_collection()
    oid = parse_object_id(expense_id)
    doc = await col.find_one({"_id": oid})
    return normalize_doc(doc) if doc else None


async def update_expense_by_id(expense_id: str, update_fields: dict) -> dict | None:
    """
    Apply a partial update ($set) to an expense by ID.

    Args:
        expense_id: A 24-character hex MongoDB ObjectId string.
        update_fields: A dict of fields to update.

    Returns:
        The updated expense dict with 'id', or None if not found.
    """
    col = get_expenses_collection()
    oid = parse_object_id(expense_id)

    # Always stamp updated_at on any update.
    update_fields["updated_at"] = datetime.now(timezone.utc)

    result = await col.update_one({"_id": oid}, {"$set": update_fields})
    if result.matched_count == 0:
        return None

    updated = await col.find_one({"_id": oid})
    return normalize_doc(updated)


async def delete_expense_by_id(expense_id: str) -> bool:
    """
    Delete an expense by its ID.

    Args:
        expense_id: A 24-character hex MongoDB ObjectId string.

    Returns:
        True if a document was deleted, False if not found.
    """
    col = get_expenses_collection()
    oid = parse_object_id(expense_id)
    result = await col.delete_one({"_id": oid})
    return result.deleted_count > 0


async def sum_expenses_by_category(month: str, category: str) -> float:
    """
    Sum expense amounts for a given category within a month.

    Expense 'date' values are stored as ISO strings (YYYY-MM-DD), so
    matching on a 'YYYY-MM' month prefix returns that month's expenses.

    Args:
        month: The month prefix to filter on (e.g. '2026-09').
        category: The category name to sum.

    Returns:
        The total amount spent, or 0.0 if there are no matches.
    """
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