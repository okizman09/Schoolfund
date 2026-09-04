import aiosqlite
from fastapi import APIRouter, Depends
from ..database import get_db
from ..schemas.report import FinancialReportResponse
from ..services.auth_service import get_current_user
from ..services.report_service import generate_financial_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{fund_id}", response_model=FinancialReportResponse)
async def get_report(
    fund_id: int,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    return await generate_financial_report(fund_id, current_user["id"], db)
