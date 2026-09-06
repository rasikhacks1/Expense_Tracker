"""
models/expense_model.py
-----------------------
Pydantic schemas for the Expense entity.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ExpenseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Expense title")
    amount: float = Field(..., gt=0, description="Expense amount (must be positive)")
    category: str = Field(default="Food & Dining", description="Expense category: Food, Transport, Pets, Beauty, Health, etc.")
    payment_method: str = Field(default="Cash", description="Budget category: Cash, GPay, Card")
    category_id: Optional[str] = Field(None, description="Optional category reference")
    date: datetime = Field(default_factory=datetime.utcnow, description="Date of the expense")
    note: Optional[str] = Field(None, max_length=500, description="Optional note")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Dog grooming",
                "amount": 800.0,
                "category": "Pets",
                "payment_method": "GPay",
                "date": "2026-09-03T12:00:00",
                "note": "Vaccination and grooming",
            }
        }


class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    payment_method: Optional[str] = None
    category_id: Optional[str] = None
    date: Optional[datetime] = None
    note: Optional[str] = Field(None, max_length=500)


class ExpenseResponse(BaseModel):
    id: str
    title: str
    amount: float
    category: str
    payment_method: str
    category_id: Optional[str] = None
    date: datetime
    note: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
