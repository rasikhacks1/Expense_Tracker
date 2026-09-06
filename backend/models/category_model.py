"""
models/category_model.py
------------------------
Pydantic schemas for the Category entity.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Category name")
    icon: str = Field(default="💰", description="Emoji icon for the category")
    color: str = Field(default="#7c3aed", description="Hex color for the category")
    is_budget: bool = Field(default=False, description="Whether category is for budgeting (Cash, GPay, Card)")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Food & Dining",
                "icon": "🍕",
                "color": "#ef4444",
                "is_budget": False,
            }
        }


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    icon: Optional[str] = None
    color: Optional[str] = None
    is_budget: Optional[bool] = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    is_budget: bool = False
    created_at: datetime

    class Config:
        from_attributes = True
