from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class BmoniBalanceItem(BaseModel):
    currency: str
    balance: float
    formatted: Optional[str] = None

class BmoniBalancesResponse(BaseModel):
    balances: List[BmoniBalanceItem] = []

class BmoniNigerianAccountVerification(BaseModel):
    accountNumber: str
    bankCode: str
    accountHolderName: Optional[str] = None

class BmoniTransactionVerification(BaseModel):
    reference_id: str
    status: str
    amount: float
    currency: str
    provider: str
    metadata: Optional[Dict[str, Any]] = None
