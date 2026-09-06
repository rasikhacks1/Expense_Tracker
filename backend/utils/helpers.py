"""
utils/helpers.py
----------------
Utility functions: ObjectId serialization, document normalization.
"""

from bson import ObjectId
from typing import Any


def object_id_to_str(doc: dict) -> dict:
    """Convert MongoDB ObjectId fields to strings for JSON serialization."""
    if doc is None:
        return doc
    result = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, dict):
            result[key] = object_id_to_str(value)
        elif isinstance(value, list):
            result[key] = [
                object_id_to_str(v) if isinstance(v, dict) else
                str(v) if isinstance(v, ObjectId) else v
                for v in value
            ]
        else:
            result[key] = value
    return result


def normalize_doc(doc: dict) -> dict:
    """
    Rename '_id' to 'id' and serialize ObjectIds.
    Called on every document returned from MongoDB before sending to client.
    """
    if doc is None:
        return doc
    doc = object_id_to_str(doc)
    if "_id" in doc:
        doc["id"] = doc.pop("_id")
    return doc


def normalize_docs(docs: list[dict]) -> list[dict]:
    return [normalize_doc(d) for d in docs]


def parse_object_id(oid: str) -> ObjectId:
    """Parse a string into a BSON ObjectId, raising ValueError on bad input."""
    try:
        return ObjectId(oid)
    except Exception:
        raise ValueError(f"Invalid ObjectId: {oid!r}")
