from pydantic import BaseModel, Field
from typing import Optional

class FundCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = None
    target_amount: float = Field(..., gt=0)
    contribution_amount: float = Field(..., gt=0)
    allow_custom_amount: bool = True
    currency: str = "NGN"
    deadline: Optional[str] = None

class FundResponse(BaseModel):
    id: int
    public_code: str
    owner_id: int
    name: str
    description: Optional[str]
    target_amount: float
    contribution_amount: float
    allow_custom_amount: bool
    currency: str
    deadline: Optional[str]
    status: str
    created_at: str
    # Computed metrics
    total_collected: float = 0.0
    total_spent: float = 0.0
    remaining_balance: float = 0.0
    available_balance: float = 0.0
    pending_expenses: float = 0.0
    percent_funded: float = 0.0
    contributors_count: int = 0
    health_status: str = "Healthy"

class FundPublicResponse(BaseModel):
    public_code: str
    name: str
    description: Optional[str]
    target_amount: float
    contribution_amount: float
    allow_custom_amount: bool
    currency: str
    deadline: Optional[str]
    status: str
    total_collected: float
    percent_funded: float
    contributors_count: int
    deposit_bank_name: Optional[str] = "9 Payment Service Bank"
    deposit_account_number: Optional[str] = "6177463833"
    deposit_account_name: Optional[str] = "Bkey Limited / SchoolFund"
    deposit_provider: Optional[str] = "BMONI_LIVE"

