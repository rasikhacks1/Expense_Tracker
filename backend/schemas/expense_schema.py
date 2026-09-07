from datetime import date


def serialize_expense(doc: dict) -> dict:
    if doc is None:
        return doc


    expense = dict(doc)

    raw_date = expense.get("date")
    if isinstance(raw_date, date):
        expense["date"] = raw_date.isoformat()
    elif raw_date is not None:
        
        expense["date"] = str(raw_date)[:10]

    return expense


def serialize_expenses(docs: list[dict]) -> list[dict]:
    
    return [serialize_expense(doc) for doc in docs]
