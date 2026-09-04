import aiosqlite
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_db
from ..schemas.fund import FundCreate, FundResponse, FundPublicResponse
from ..schemas.contribution import ContributionResponse
from ..schemas.expense import ExpenseResponse
from ..services.auth_service import get_current_user
from ..services.fund_service import create_fund, get_user_funds, get_fund_by_id, get_public_fund_by_code
from ..services.contribution_service import get_fund_contributors
from ..services.expense_service import get_fund_expenses

router = APIRouter(prefix="/api/funds", tags=["Funds"])

@router.post("", response_model=FundResponse)
async def create_new_fund(
    fund_in: FundCreate,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    return await create_fund(fund_in, current_user["id"], db)

@router.get("", response_model=List[FundResponse])
async def list_funds(
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    return await get_user_funds(current_user["id"], db)

@router.get("/public/{public_code}", response_model=FundPublicResponse)
async def get_public_fund(
    public_code: str,
    db: aiosqlite.Connection = Depends(get_db)
):
    fund = await get_public_fund_by_code(public_code, db)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")
    return fund

@router.get("/{fund_id}", response_model=FundResponse)
async def get_fund(
    fund_id: int,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    fund = await get_fund_by_id(fund_id, current_user["id"], db)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found or unauthorized")
    return fund

@router.get("/{fund_id}/contributors", response_model=List[ContributionResponse])
async def list_contributors(
    fund_id: int,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    fund = await get_fund_by_id(fund_id, current_user["id"], db)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found or unauthorized")
    return await get_fund_contributors(fund_id, db)

@router.get("/{fund_id}/expenses", response_model=List[ExpenseResponse])
async def list_expenses(
    fund_id: int,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    fund = await get_fund_by_id(fund_id, current_user["id"], db)
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found or unauthorized")
    return await get_fund_expenses(fund_id, db)
