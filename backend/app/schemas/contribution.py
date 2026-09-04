from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from ..models.enums import ContributionStatus

class ContributionCreate(BaseModel):
    public_code: str
    contributor_name: str = Field(..., min_length=2, max_length=100)
    contributor_email: EmailStr
    amount: float = Field(..., gt=0)
    reference_id: Optional[str] = None

class ContributionResponse(BaseModel):
    id: int
    fund_id: int
    contributor_name: str
    contributor_email: str
    amount: float
    currency: str
    status: ContributionStatus
    provider: str
    reference_id: str
    created_at: str
    completed_at: Optional[str] = None

class ContributionPaymentInitiate(BaseModel):
    reference_id: str
    status: ContributionStatus
    amount: float
    currency: str
    fund_name: str
    provider: str
    message: str
