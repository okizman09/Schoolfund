import aiosqlite
from typing import List
from fastapi import APIRouter, Depends, Path
from ..database import get_db
from ..schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseActionRequest, BankItem
from ..services.auth_service import get_current_user
from ..services.expense_service import (
    add_expense,
    approve_expense,
    reject_expense,
    get_supported_banks
)

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.get("/banks", response_model=List[BankItem])
async def list_supported_banks():
    """Retrieve supported Nigerian banks for withdrawal disbursements"""
    return await get_supported_banks()

@router.post("", response_model=ExpenseResponse)
async def create_expense(
    expense_in: ExpenseCreate,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    return await add_expense(expense_in, current_user["id"], db)

@router.post("/{expense_id}/approve", response_model=ExpenseResponse)
async def approve_expense_request(
    expense_id: int = Path(..., description="ID of the expense/withdrawal to approve"),
    action_in: ExpenseActionRequest = ExpenseActionRequest(),
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    """Approve a pending expense/withdrawal request and trigger BMONI disbursement"""
    return await approve_expense(expense_id, current_user["id"], action_in.note, db)

@router.post("/{expense_id}/reject", response_model=ExpenseResponse)
async def reject_expense_request(
    expense_id: int = Path(..., description="ID of the expense/withdrawal to reject"),
    action_in: ExpenseActionRequest = ExpenseActionRequest(),
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    """Reject a pending expense/withdrawal request"""
    return await reject_expense(expense_id, current_user["id"], action_in.note, db)
