from pydantic import BaseModel, Field
from typing import Optional
from ..models.enums import ExpenseCategory, ExpenseStatus

class ExpenseCreate(BaseModel):
    fund_id: int
    title: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = None
    amount: float = Field(..., gt=0)
    category: ExpenseCategory
    recipient_name: Optional[str] = None
    recipient_account_number: Optional[str] = None
    recipient_bank_name: Optional[str] = None
    recipient_bank_code: Optional[str] = None
    auto_approve: bool = False

class ExpenseActionRequest(BaseModel):
    note: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: int
    fund_id: int
    title: str
    description: Optional[str] = None
    amount: float
    category: ExpenseCategory
    recipient_name: Optional[str] = None
    recipient_account_number: Optional[str] = None
    recipient_bank_name: Optional[str] = None
    recipient_bank_code: Optional[str] = None
    status: ExpenseStatus = ExpenseStatus.PENDING
    approved_by: Optional[int] = None
    approved_at: Optional[str] = None
    reference_id: Optional[str] = None
    provider: Optional[str] = None
    created_by: int
    created_at: str

class BankItem(BaseModel):
    name: str
    code: str
    slug: Optional[str] = None
