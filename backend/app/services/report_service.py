import aiosqlite
import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from fastapi import HTTPException, status
from ..schemas.report import FinancialReportResponse, CategoryBreakdown
from ..models.enums import AuditAction

async def generate_financial_report(
    fund_id: int,
    user_id: int,
    db: aiosqlite.Connection
) -> Dict[str, Any]:
    # 1. Fetch fund
    cursor = await db.execute("SELECT * FROM funds WHERE id = ?;", (fund_id,))
    fund = await cursor.fetchone()
    if not fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fund not found")
    if fund["owner_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized to access financial report for this fund"
        )

    target = float(fund["target_amount"])

    # 2. Total successful contributions
    cursor = await db.execute(
        "SELECT COALESCE(SUM(amount), 0), COUNT(*) FROM contributions WHERE fund_id = ? AND status = 'success';",
        (fund_id,)
    )
    contrib_row = await cursor.fetchone()
    total_contributions = float(contrib_row[0])
    paid_count = int(contrib_row[1])

    # Pending contributions
    cursor = await db.execute(
        "SELECT COUNT(*) FROM contributions WHERE fund_id = ? AND status = 'pending';",
        (fund_id,)
    )
    pending_count = (await cursor.fetchone())[0]
    total_contributors = paid_count + pending_count

    # 3. Total expenses and breakdown
    cursor = await db.execute(
        "SELECT category, COALESCE(SUM(amount), 0) FROM expenses WHERE fund_id = ? GROUP BY category;",
        (fund_id,)
    )
    cat_rows = await cursor.fetchall()
    
    total_expenses = sum(float(r[1]) for r in cat_rows)
    breakdown: List[Dict[str, Any]] = []
    for cat, amt in cat_rows:
        amt_f = float(amt)
        pct = round((amt_f / total_expenses * 100), 1) if total_expenses > 0 else 0.0
        breakdown.append({
            "category": cat,
            "amount": amt_f,
            "percentage": pct
        })

    remaining_balance = total_contributions - total_expenses
    percent_funded = round((total_contributions / target * 100), 1) if target > 0 else 0.0
    now_iso = datetime.now(timezone.utc).isoformat()

    # Record Audit Log
    await db.execute(
        """
        INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?);
        """,
        (
            user_id,
            fund_id,
            AuditAction.REPORT_GENERATED.value,
            json.dumps({"total_contributions": total_contributions, "total_expenses": total_expenses}),
            now_iso
        )
    )
    await db.commit()

    return {
        "fund_id": fund["id"],
        "public_code": fund["public_code"],
        "fund_name": fund["name"],
        "description": fund["description"],
        "target_amount": target,
        "total_contributions": total_contributions,
        "total_expenses": total_expenses,
        "remaining_balance": remaining_balance,
        "percent_funded": percent_funded,
        "total_contributors": total_contributors,
        "paid_contributors_count": paid_count,
        "pending_contributors_count": pending_count,
        "expense_breakdown": breakdown,
        "generated_at": now_iso
    }
