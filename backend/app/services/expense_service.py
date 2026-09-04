import aiosqlite
import json
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import HTTPException, status
from ..schemas.expense import ExpenseCreate
from ..models.enums import TransactionType, TransactionStatus, AuditAction

async def add_expense(
    expense_in: ExpenseCreate,
    user_id: int,
    db: aiosqlite.Connection
) -> Dict[str, Any]:
    # 1. Verify fund ownership
    cursor = await db.execute(
        "SELECT id, name, owner_id FROM funds WHERE id = ?;",
        (expense_in.fund_id,)
    )
    fund = await cursor.fetchone()
    if not fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fund not found")
    if fund["owner_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to manage expenses for this fund")

    now_iso = datetime.now(timezone.utc).isoformat()
    ref_id = f"SF-EXP-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    # 2. Insert expense
    cursor = await db.execute(
        """
        INSERT INTO expenses (fund_id, title, description, amount, category, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?);
        """,
        (
            expense_in.fund_id,
            expense_in.title,
            expense_in.description,
            expense_in.amount,
            expense_in.category.value,
            user_id,
            now_iso
        )
    )
    expense_id = cursor.lastrowid

    # 3. Insert transaction
    await db.execute(
        """
        INSERT INTO transactions (fund_id, reference_id, type, amount, currency, status, provider, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            expense_in.fund_id,
            ref_id,
            TransactionType.EXPENSE.value,
            expense_in.amount,
            "NGN",
            TransactionStatus.SUCCESS.value,
            "INTERNAL",
            json.dumps({"title": expense_in.title, "category": expense_in.category.value}),
            now_iso
        )
    )

    # 4. Record Audit Log
    await db.execute(
        """
        INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?);
        """,
        (
            user_id,
            expense_in.fund_id,
            AuditAction.EXPENSE_ADDED.value,
            json.dumps({"title": expense_in.title, "amount": expense_in.amount, "category": expense_in.category.value}),
            now_iso
        )
    )
    await db.commit()

    cursor = await db.execute("SELECT * FROM expenses WHERE id = ?;", (expense_id,))
    row = await cursor.fetchone()
    return dict(row)

async def get_fund_expenses(fund_id: int, db: aiosqlite.Connection) -> List[dict]:
    cursor = await db.execute(
        "SELECT id, fund_id, title, description, amount, category, created_by, created_at FROM expenses WHERE fund_id = ? ORDER BY id DESC;",
        (fund_id,)
    )
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]
