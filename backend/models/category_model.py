from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime


class CategoryType(str, Enum):
    
    EXPENSE = "expense"
    BUDGET = "budget"


class CategoryCreate(BaseModel):
    

    name: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Display name of the category",
    )
    type: CategoryType = Field(
        ...,
        description="Whether this is an 'expense' or 'budget' category",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Groceries",
                "type": "budget",
            }
        },
    )


class CategoryUpdate(BaseModel):

    name: Optional[str] = Field(None, min_length=1, max_length=50)
    type: Optional[CategoryType] = None

    model_config = ConfigDict(populate_by_name=True)


class CategoryResponse(BaseModel):

    id: str
    name: str
    type: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)