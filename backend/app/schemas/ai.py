from pydantic import BaseModel
from typing import List

class AiAnalysisResponse(BaseModel):
    fund_id: int
    fund_name: str
    summary: str
    observations: List[str]
    recommendation: str
    analyzed_at: str
