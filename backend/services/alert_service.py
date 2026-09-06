"""
services/alert_service.py
--------------------------
Business Logic Service — computes budget alert status for each category/month.

Alert levels:
  - "safe"    : spent < 80% of limit
  - "warning" : 80% <= spent < 100% of limit
  - "danger"  : spent >= 100% of limit
"""

from database.mongo import get_expenses_collection, get_budgets_collection, get_categories_collection
from utils.helpers import normalize_docs
from datetime import datetime
from bson import ObjectId


WARN_THRESHOLD = 0.80   # 80 %
DANGER_THRESHOLD = 1.00  # 100 %


def compute_alerts(month: str | None = None) -> list[dict]:
    """
    For every budget document, sum expenses in that category/month
    and return an alert payload if spending exceeds WARN_THRESHOLD.

    Args:
        month: Optional YYYY-MM filter. Defaults to current month.

    Returns:
        List of alert dicts with keys:
          budget_id, category_id, category_name, category_color, category_icon,
          month, limit, spent, percentage, level
    """
    if month is None:
        month = datetime.utcnow().strftime("%Y-%m")

    budgets_col = get_budgets_collection()
    expenses_col = get_expenses_collection()
    categories_col = get_categories_collection()

    budgets = list(budgets_col.find({"month": month}))

    alerts = []

    for budget in budgets:
        cat_id = budget["category_id"]
        limit = budget["limit"]

        # Fetch category metadata
        try:
            cat_doc = categories_col.find_one({"_id": ObjectId(str(cat_id))})
        except Exception:
            cat_doc = None

        cat_name = cat_doc["name"] if cat_doc else ""

        # Sum expenses for this category in this month (matching category_id or payment_method)
        year, mon = month.split("-")
        start_dt = datetime(int(year), int(mon), 1)
        end_dt = datetime(int(year) + 1, 1, 1) if int(mon) == 12 else datetime(int(year), int(mon) + 1, 1)
        start_str = start_dt.strftime("%Y-%m-%d")
        end_str = end_dt.strftime("%Y-%m-%d")

        match_criteria = [{"category_id": str(cat_id)}]
        if cat_name:
            match_criteria.append({"payment_method": {"$regex": f"^{cat_name}$", "$options": "i"}})

        pipeline = [
            {
                "$match": {
                    "$and": [
                        {
                            "$or": [
                                {"date": {"$gte": start_dt, "$lt": end_dt}},
                                {"date": {"$gte": start_str, "$lt": end_str}},
                                {"date": {"$regex": f"^{month}"}},
                            ]
                        },
                        {"$or": match_criteria},
                    ]
                }
            },
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
        result = list(expenses_col.aggregate(pipeline))
        spent = result[0]["total"] if result else 0.0

        percentage = (spent / limit) * 100 if limit > 0 else 0

        if percentage >= WARN_THRESHOLD * 100:
            level = "danger" if percentage >= DANGER_THRESHOLD * 100 else "warning"

            alerts.append(
                {
                    "budget_id": str(budget["_id"]),
                    "category_id": str(cat_id),
                    "category_name": cat_doc["name"] if cat_doc else "Unknown",
                    "category_color": cat_doc.get("color", "#7c3aed") if cat_doc else "#7c3aed",
                    "category_icon": cat_doc.get("icon", "💰") if cat_doc else "💰",
                    "month": month,
                    "limit": limit,
                    "spent": round(spent, 2),
                    "percentage": round(percentage, 1),
                    "level": level,
                }
            )

    return alerts


def get_summary(month: str | None = None) -> dict:
    """
    Aggregated dashboard summary for a given month.
    Returns: total_budget, total_spent, remaining, category_breakdown, monthly_trend
    """
    if month is None:
        month = datetime.utcnow().strftime("%Y-%m")

    budgets_col = get_budgets_collection()
    expenses_col = get_expenses_collection()
    categories_col = get_categories_collection()

    # ---- Total budget ----
    budgets = list(budgets_col.find({"month": month}))
    valid_budgets = []
    for b in budgets:
        try:
            cat_doc = categories_col.find_one({"_id": ObjectId(str(b["category_id"]))})
        except Exception:
            cat_doc = None
        if cat_doc and (cat_doc.get("name", "").strip().lower() in ["cash", "gpay", "card"] or cat_doc.get("is_budget", False)):
            valid_budgets.append(b)
    total_budget = sum(b["limit"] for b in valid_budgets)

    # ---- Total spent this month ----
    year, mon = month.split("-")
    start_dt = datetime(int(year), int(mon), 1)
    end_dt = datetime(int(year) + 1, 1, 1) if int(mon) == 12 else datetime(int(year), int(mon) + 1, 1)
    start_str = start_dt.strftime("%Y-%m-%d")
    end_str = end_dt.strftime("%Y-%m-%d")

    date_match = {
        "$or": [
            {"date": {"$gte": start_dt, "$lt": end_dt}},
            {"date": {"$gte": start_str, "$lt": end_str}},
            {"date": {"$regex": f"^{month}"}},
        ]
    }

    pipeline_total = [
        {"$match": date_match},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
    ]
    result = list(expenses_col.aggregate(pipeline_total))
    total_spent = result[0]["total"] if result else 0.0

    # ---- Per-category breakdown ----
    pipeline_cat = [
        {"$match": date_match},
        {"$group": {"_id": "$category_id", "spent": {"$sum": "$amount"}}},
    ]
    cat_agg = list(expenses_col.aggregate(pipeline_cat))

    category_breakdown = []
    for item in cat_agg:
        cat_id_str = item["_id"]
        try:
            cat_doc = categories_col.find_one({"_id": ObjectId(cat_id_str)})
        except Exception:
            cat_doc = None
        # Find budget limit for this category
        budget_for_cat = next(
            (b for b in budgets if str(b["category_id"]) == cat_id_str), None
        )
        category_breakdown.append(
            {
                "category_id": cat_id_str,
                "category_name": cat_doc["name"] if cat_doc else "Unknown",
                "category_color": cat_doc.get("color", "#7c3aed") if cat_doc else "#7c3aed",
                "category_icon": cat_doc.get("icon", "💰") if cat_doc else "💰",
                "spent": round(item["spent"], 2),
                "limit": budget_for_cat["limit"] if budget_for_cat else None,
            }
        )

    # ---- Monthly trend (last 6 months) ----
    monthly_trend = []
    current_year = int(year)
    current_mon = int(mon)
    for i in range(5, -1, -1):
        m = current_mon - i
        y = current_year
        while m <= 0:
            m += 12
            y -= 1
        m_start = datetime(y, m, 1)
        if m == 12:
            m_end = datetime(y + 1, 1, 1)
        else:
            m_end = datetime(y, m + 1, 1)
        m_label = f"{y}-{m:02d}"

        pipeline_m = [
            {"$match": {"date": {"$gte": m_start, "$lt": m_end}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
        res = list(expenses_col.aggregate(pipeline_m))
        monthly_trend.append(
            {"month": m_label, "spent": round(res[0]["total"] if res else 0.0, 2)}
        )

    return {
        "month": month,
        "total_budget": round(total_budget, 2),
        "total_spent": round(total_spent, 2),
        "remaining": round(total_budget - total_spent, 2),
        "category_breakdown": category_breakdown,
        "monthly_trend": monthly_trend,
    }
