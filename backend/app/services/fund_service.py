import aiosqlite
import random
import string
import json
from datetime import datetime, timezone
from typing import List, Optional
from ..schemas.fund import FundCreate, FundResponse, FundPublicResponse
from ..models.enums import AuditAction

def generate_public_code(prefix: str = "SF") -> str:
    chars = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"{prefix}-{chars}"

async def compute_fund_metrics(fund: dict, db: aiosqlite.Connection) -> dict:
    fund_id = fund["id"]
    
    # 1. Total collected (successful contributions only)
    cursor = await db.execute(
        "SELECT COALESCE(SUM(amount), 0), COUNT(*) FROM contributions WHERE fund_id = ? AND status = 'success';",
        (fund_id,)
    )
    collected_row = await cursor.fetchone()
    total_collected = float(collected_row[0])
    contributors_count = int(collected_row[1])

    # 2. Total spent (settled/successful payouts only)
    cursor = await db.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE fund_id = ? AND (status = 'success' OR status IS NULL);",
        (fund_id,)
    )
    spent_row = await cursor.fetchone()
    total_spent = float(spent_row[0])

    # 3. Pending expenses (in request, approval, or processing pipeline)
    cursor = await db.execute(
        "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE fund_id = ? AND status IN ('pending', 'approved', 'processing');",
        (fund_id,)
    )
    pending_row = await cursor.fetchone()
    pending_expenses = float(pending_row[0])

    remaining_balance = total_collected - total_spent
    available_balance = max(0.0, remaining_balance - pending_expenses)
    target = float(fund["target_amount"])
    percent_funded = round((total_collected / target * 100), 1) if target > 0 else 0.0

    # Determine signature Fund Health
    if remaining_balance < 0 or (remaining_balance - pending_expenses) < 0:
        health_status = "Attention Needed"
    elif percent_funded >= 80:
        health_status = "Excellent"
    elif percent_funded >= 50:
        health_status = "Healthy"
    elif percent_funded >= 20:
        health_status = "On Track"
    else:
        health_status = "Starting"

    metrics = dict(fund)
    metrics.update({
        "total_collected": total_collected,
        "total_spent": total_spent,
        "remaining_balance": remaining_balance,
        "available_balance": available_balance,
        "pending_expenses": pending_expenses,
        "percent_funded": percent_funded,
        "contributors_count": contributors_count,
        "health_status": health_status,
    })
    return metrics

async def create_fund(fund_in: FundCreate, user_id: int, db: aiosqlite.Connection) -> dict:
    public_code = generate_public_code()
    now = datetime.now(timezone.utc).isoformat()

    cursor = await db.execute(
        """
        INSERT INTO funds (public_code, owner_id, name, description, target_amount, contribution_amount, allow_custom_amount, currency, deadline, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            public_code,
            user_id,
            fund_in.name,
            fund_in.description,
            fund_in.target_amount,
            fund_in.contribution_amount,
            1 if fund_in.allow_custom_amount else 0,
            fund_in.currency,
            fund_in.deadline,
            "active",
            now,
            now
        )
    )
    fund_id = cursor.lastrowid

    # Record Audit Log
    await db.execute(
        """
        INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?);
        """,
        (
            user_id,
            fund_id,
            AuditAction.FUND_CREATED.value,
            json.dumps({"name": fund_in.name, "target": fund_in.target_amount, "code": public_code}),
            now
        )
    )
    await db.commit()

    cursor = await db.execute("SELECT * FROM funds WHERE id = ?;", (fund_id,))
    fund = await cursor.fetchone()
    return await compute_fund_metrics(dict(fund), db)

async def get_user_funds(user_id: int, db: aiosqlite.Connection) -> List[dict]:
    cursor = await db.execute("SELECT * FROM funds WHERE owner_id = ? ORDER BY created_at DESC;", (user_id,))
    rows = await cursor.fetchall()
    results = []
    for r in rows:
        computed = await compute_fund_metrics(dict(r), db)
        results.append(computed)
    return results

async def get_fund_by_id(fund_id: int, user_id: int, db: aiosqlite.Connection) -> Optional[dict]:
    cursor = await db.execute("SELECT * FROM funds WHERE id = ? AND owner_id = ?;", (fund_id, user_id))
    row = await cursor.fetchone()
    if not row:
        return None
    return await compute_fund_metrics(dict(row), db)

async def get_public_fund_by_code(public_code: str, db: aiosqlite.Connection) -> Optional[dict]:
    cursor = await db.execute("SELECT * FROM funds WHERE public_code = ? AND status != 'cancelled';", (public_code,))
    row = await cursor.fetchone()
    if not row:
        return None
    computed = await compute_fund_metrics(dict(row), db)
    # Mask sensitive details and provide verified BMONI deposit account rails
    return {
        "public_code": computed["public_code"],
        "name": computed["name"],
        "description": computed["description"],
        "target_amount": computed["target_amount"],
        "contribution_amount": computed["contribution_amount"],
        "allow_custom_amount": bool(computed["allow_custom_amount"]),
        "currency": computed["currency"],
        "deadline": computed["deadline"],
        "status": computed["status"],
        "total_collected": computed["total_collected"],
        "percent_funded": computed["percent_funded"],
        "contributors_count": computed["contributors_count"],
        "deposit_bank_name": "9 Payment Service Bank",
        "deposit_account_number": "6177463833",
        "deposit_account_name": "Bkey Limited / SchoolFund",
        "deposit_provider": "BMONI_LIVE",
    }

