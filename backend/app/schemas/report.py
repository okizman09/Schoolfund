from pydantic import BaseModel
from typing import List, Dict, Optional

class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float

class FinancialReportResponse(BaseModel):
    fund_id: int
    public_code: str
    fund_name: str
    description: Optional[str]
    target_amount: float
    total_contributions: float
    total_expenses: float
    remaining_balance: float
    percent_funded: float
    total_contributors: int
    paid_contributors_count: int
    pending_contributors_count: int
    expense_breakdown: List[CategoryBreakdown]
    generated_at: str
