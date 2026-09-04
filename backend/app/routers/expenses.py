import aiosqlite
from fastapi import APIRouter, Depends
from ..database import get_db
from ..schemas.expense import ExpenseCreate, ExpenseResponse
from ..services.auth_service import get_current_user
from ..services.expense_service import add_expense

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])

@router.post("", response_model=ExpenseResponse)
async def create_expense(
    expense_in: ExpenseCreate,
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    return await add_expense(expense_in, current_user["id"], db)
