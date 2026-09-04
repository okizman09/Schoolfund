import aiosqlite
from fastapi import APIRouter, Depends
from ..database import get_db
from ..schemas.contribution import ContributionCreate, ContributionResponse
from ..services.contribution_service import initiate_and_process_contribution

router = APIRouter(prefix="/api/contributions", tags=["Contributions"])

@router.post("", response_model=ContributionResponse)
async def make_contribution(
    contrib_in: ContributionCreate,
    db: aiosqlite.Connection = Depends(get_db)
):
    """
    Public contribution endpoint.
    Initiates payment and progresses through the strict state machine:
    PENDING -> PROCESSING -> SUCCESS (or FAILED)
    Enforces idempotency using reference_id.
    """
    return await initiate_and_process_contribution(contrib_in, db)
