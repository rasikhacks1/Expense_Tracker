"""
models/budget_model.py
----------------------
Pydantic schemas for the Budget entity.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BudgetCreate(BaseModel):
    category_id: str = Field(..., description="ID of the category")
    month: str = Field(
        ...,
        pattern=r"^\d{4}-(0[1-9]|1[0-2])$",
        description="Month in YYYY-MM format (e.g. 2026-09)",
    )
    limit: float = Field(..., gt=0, description="Budget limit for the month")

    class Config:
        json_schema_extra = {
            "example": {
                "category_id": "665f1a2b3c4d5e6f7a8b9c0d",
                "month": "2026-09",
                "limit": 500.0,
            }
        }


class BudgetUpdate(BaseModel):
    limit: Optional[float] = Field(None, gt=0)
    month: Optional[str] = Field(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$")


class BudgetResponse(BaseModel):
    id: str
    category_id: str
    month: str
    limit: float
    created_at: datetime

    class Config:
        from_attributes = True
