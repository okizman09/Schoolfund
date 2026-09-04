from pydantic import BaseModel, Field
from typing import Optional
from ..models.enums import ExpenseCategory

class ExpenseCreate(BaseModel):
    fund_id: int
    title: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    category: ExpenseCategory

class ExpenseResponse(BaseModel):
    id: int
    fund_id: int
    title: str
    description: Optional[str]
    amount: float
    category: ExpenseCategory
    created_by: int
    created_at: str
