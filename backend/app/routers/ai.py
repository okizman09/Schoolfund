import aiosqlite
from fastapi import APIRouter, Depends
from ..database import get_db
from ..schemas.ai import AiAnalysisResponse
from ..services.auth_service import get_current_user
from ..services.ai_service import analyze_fund_finances

router = APIRouter(prefix="/api/ai", tags=["AI Intelligence"])

@router.post("/analyze/{fund_id}", response_model=AiAnalysisResponse)
async def analyze_fund(
    fund_id: int,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    """
    Analyzes backend-calculated fund metrics to return structured financial observations and actionable recommendations.
    """
    return await analyze_fund_finances(fund_id, current_user["id"], db)
