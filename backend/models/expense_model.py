from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date as DateType, datetime


class CategoryEnum(str, Enum):
    FOOD = "Food"
    TRANSPORT = "Transport"
    SHOPPING = "Shopping"
    BILLS = "Bills"
    ENTERTAINMENT = "Entertainment"
    HEALTH = "Health"
    EDUCATION = "Education"
    TRAVEL = "Travel"
    OTHER = "Other"


class ExpenseCreate(BaseModel):

    title: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Short title for the expense",
    )
    amount: float = Field(
        ...,
        gt=0,
        description="Expense amount — must be greater than 0",
    )
    category: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description=(
            "Expense category — must be one of the expense categories "
            "(defaults are Food, Transport, Shopping, Bills, Entertainment, "
            "Health, Education, Travel, Other)"
        ),
    )
    description: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional longer description of the expense",
    )
    expense_date: DateType = Field(
        ...,
        alias="date",
        description="Date the expense occurred (YYYY-MM-DD)",
    )

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "title": "Lunch",
                "amount": 250.0,
                "category": "Food",
                "description": "Lunch at restaurant",
                "date": "2026-09-07",
            }
        },
    )


class ExpenseUpdate(BaseModel):

    title: Optional[str] = Field(None, min_length=1, max_length=100)
    amount: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=500)
    expense_date: Optional[DateType] = Field(None, alias="date")

    model_config = ConfigDict(populate_by_name=True)


class ExpenseResponse(BaseModel):

    id: str
    title: str
    amount: float
    category: str
    description: Optional[str] = None
    date: str  
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ExpenseBudgetAlert(BaseModel):

    category: str
    month: str
    limit: float
    spent: float
    amount: float
    projected: float
    percent: float
    status: str
    message: str

    model_config = ConfigDict(from_attributes=True)


class ExpenseAlertRequest(BaseModel):

    category: str = Field(..., min_length=1, max_length=50)
    amount: float = Field(..., gt=0)
    date: DateType = Field(..., description="Expense date (YYYY-MM-DD)")
