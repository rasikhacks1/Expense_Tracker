from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
import re


def _current_month() -> str:
    
    return datetime.now().strftime("%Y-%m")


MONTH_PATTERN = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


class BudgetCreate(BaseModel):
    

    category: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="The category this budget applies to",
    )
    amount: float = Field(
        ...,
        gt=0,
        description="Monthly spending limit — must be greater than 0",
    )
    month: str = Field(
        default_factory=_current_month,
        description="Budget month in YYYY-MM format (defaults to the current month)",
    )

    @field_validator("amount")
    @classmethod
    def amount_not_zero(cls, v: float) -> float:
        return round(v, 2)

    @field_validator("month")
    @classmethod
    def validate_month(cls, v: str) -> str:
        if not MONTH_PATTERN.match(v):
            raise ValueError("month must be in YYYY-MM format (e.g. 2026-09)")
        return v

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "category": "Groceries",
                "amount": 10000.0,
                "month": "2026-09",
            }
        },
    )


class BudgetUpdate(BaseModel):
    

    category: Optional[str] = Field(None, min_length=1, max_length=50)
    amount: Optional[float] = Field(None, gt=0)
    month: Optional[str] = None

    @field_validator("month")
    @classmethod
    def validate_month(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not MONTH_PATTERN.match(v):
            raise ValueError("month must be in YYYY-MM format (e.g. 2026-09)")
        return v

    @field_validator("amount")
    @classmethod
    def amount_not_zero(cls, v: Optional[float]) -> Optional[float]:
        return round(v, 2) if v is not None else v

    model_config = ConfigDict(populate_by_name=True)


class BudgetResponse(BaseModel):
    

    id: str
    category: str
    amount: float
    month: str
    spent: Optional[float] = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)