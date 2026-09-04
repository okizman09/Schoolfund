import aiosqlite
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import HTTPException, status
from ..schemas.expense import ExpenseCreate
from ..models.enums import TransactionType, TransactionStatus, AuditAction, ExpenseStatus
from ..integrations.bmoni.bmoni_adapter import bmoni_adapter
from .fund_service import compute_fund_metrics

NIGERIAN_BANKS = [
    {"name": "Access Bank", "code": "044"},
    {"name": "Citibank Nigeria", "code": "023"},
    {"name": "Ecobank Nigeria", "code": "050"},
    {"name": "Fidelity Bank", "code": "070"},
    {"name": "First Bank of Nigeria", "code": "011"},
    {"name": "First City Monument Bank (FCMB)", "code": "214"},
    {"name": "Guaranty Trust Bank (GTBank)", "code": "058"},
    {"name": "Heritage Bank", "code": "030"},
    {"name": "Keystone Bank", "code": "082"},
    {"name": "Kuda Bank", "code": "090267"},
    {"name": "Moniepoint MFB", "code": "090393"},
    {"name": "OPay (PayCom)", "code": "090405"},
    {"name": "PalmPay", "code": "090175"},
    {"name": "Polaris Bank", "code": "076"},
    {"name": "Providus Bank", "code": "101"},
    {"name": "Stanbic IBTC Bank", "code": "039"},
    {"name": "Standard Chartered Bank", "code": "068"},
    {"name": "Sterling Bank", "code": "232"},
    {"name": "Suntrust Bank", "code": "100"},
    {"name": "Taj Bank", "code": "302"},
    {"name": "Union Bank of Nigeria", "code": "032"},
    {"name": "United Bank for Africa (UBA)", "code": "033"},
    {"name": "Unity Bank", "code": "215"},
    {"name": "Wema Bank", "code": "035"},
    {"name": "Zenith Bank", "code": "057"},
]

async def get_supported_banks() -> List[Dict[str, Any]]:
    """Returns supported Nigerian banks for payout/disbursement"""
    try:
        remote_banks = await bmoni_adapter.client.get_supported_nigerian_banks()
        if remote_banks and isinstance(remote_banks, list) and len(remote_banks) > 0:
            return remote_banks
    except Exception:
        pass
    return NIGERIAN_BANKS

async def add_expense(
    expense_in: ExpenseCreate,
    user_id: int,
    db: aiosqlite.Connection
) -> Dict[str, Any]:
    # 1. Verify fund exists and user has management permission
    cursor = await db.execute(
        "SELECT * FROM funds WHERE id = ?;",
        (expense_in.fund_id,)
    )
    fund = await cursor.fetchone()
    if not fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fund not found")
    if fund["owner_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to manage expenses for this fund")

    # 2. Strict Balance Verification
    metrics = await compute_fund_metrics(dict(fund), db)
    available_balance = metrics.get("available_balance", 0.0)

    if expense_in.amount > available_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient available balance. Available: ₦{available_balance:,.2f}, Requested: ₦{expense_in.amount:,.2f}"
        )

    now_iso = datetime.now(timezone.utc).isoformat()

    # 3. Determine if auto_approve and execute immediate payout
    if expense_in.auto_approve:
        # Payout executed via BMONI rails
        exp_status, provider, payout_meta = await bmoni_adapter.execute_payout(
            fund_name=fund["name"],
            amount=expense_in.amount,
            recipient_name=expense_in.recipient_name or "Authorized Recipient",
            recipient_account_number=expense_in.recipient_account_number or "",
            recipient_bank_name=expense_in.recipient_bank_name or "Commercial Bank",
            recipient_bank_code=expense_in.recipient_bank_code or ""
        )
        payout_ref = payout_meta.get("payout_reference")

        cursor = await db.execute(
            """
            INSERT INTO expenses (
                fund_id, title, description, amount, category,
                recipient_name, recipient_account_number, recipient_bank_name, recipient_bank_code,
                status, approved_by, approved_at, reference_id, provider, metadata,
                created_by, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                expense_in.fund_id,
                expense_in.title,
                expense_in.description,
                expense_in.amount,
                expense_in.category.value,
                expense_in.recipient_name,
                expense_in.recipient_account_number,
                expense_in.recipient_bank_name,
                expense_in.recipient_bank_code,
                ExpenseStatus.SUCCESS.value,
                user_id,
                now_iso,
                payout_ref,
                provider,
                json.dumps(payout_meta),
                user_id,
                now_iso
            )
        )
        expense_id = cursor.lastrowid

        # Record Transaction
        await db.execute(
            """
            INSERT INTO transactions (fund_id, reference_id, type, amount, currency, status, provider, metadata, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                expense_in.fund_id,
                payout_ref,
                TransactionType.EXPENSE.value,
                expense_in.amount,
                "NGN",
                TransactionStatus.SUCCESS.value,
                provider,
                json.dumps(payout_meta),
                now_iso
            )
        )

        # Audit Log
        await db.execute(
            """
            INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?);
            """,
            (
                user_id,
                expense_in.fund_id,
                AuditAction.EXPENSE_SETTLED.value,
                json.dumps({
                    "expense_id": expense_id,
                    "title": expense_in.title,
                    "amount": expense_in.amount,
                    "reference": payout_ref,
                    "recipient": expense_in.recipient_name,
                    "bank": expense_in.recipient_bank_name
                }),
                now_iso
            )
        )
    else:
        # Create as PENDING withdrawal / expense request
        cursor = await db.execute(
            """
            INSERT INTO expenses (
                fund_id, title, description, amount, category,
                recipient_name, recipient_account_number, recipient_bank_name, recipient_bank_code,
                status, created_by, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """,
            (
                expense_in.fund_id,
                expense_in.title,
                expense_in.description,
                expense_in.amount,
                expense_in.category.value,
                expense_in.recipient_name,
                expense_in.recipient_account_number,
                expense_in.recipient_bank_name,
                expense_in.recipient_bank_code,
                ExpenseStatus.PENDING.value,
                user_id,
                now_iso
            )
        )
        expense_id = cursor.lastrowid

        # Audit Log
        await db.execute(
            """
            INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
            VALUES (?, ?, ?, ?, ?);
            """,
            (
                user_id,
                expense_in.fund_id,
                AuditAction.EXPENSE_REQUESTED.value,
                json.dumps({
                    "expense_id": expense_id,
                    "title": expense_in.title,
                    "amount": expense_in.amount,
                    "recipient": expense_in.recipient_name,
                    "bank": expense_in.recipient_bank_name
                }),
                now_iso
            )
        )

    await db.commit()
    cursor = await db.execute("SELECT * FROM expenses WHERE id = ?;", (expense_id,))
    row = await cursor.fetchone()
    return dict(row)

async def approve_expense(
    expense_id: int,
    user_id: int,
    note: Optional[str],
    db: aiosqlite.Connection
) -> Dict[str, Any]:
    # 1. Fetch expense
    cursor = await db.execute("SELECT * FROM expenses WHERE id = ?;", (expense_id,))
    expense = await cursor.fetchone()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense request not found")

    # 2. Check fund ownership
    cursor = await db.execute("SELECT * FROM funds WHERE id = ?;", (expense["fund_id"],))
    fund = await cursor.fetchone()
    if not fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated fund not found")
    if fund["owner_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to approve expenses for this fund")

    # 3. Check current status
    if expense["status"] != ExpenseStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only pending expense requests can be approved. Current status: {expense['status']}"
        )

    # 4. Check available balance (actual remaining balance)
    metrics = await compute_fund_metrics(dict(fund), db)
    remaining_balance = metrics.get("remaining_balance", 0.0)
    if expense["amount"] > remaining_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve expense: insufficient fund balance. Remaining: ₦{remaining_balance:,.2f}, Required: ₦{expense['amount']:,.2f}"
        )

    now_iso = datetime.now(timezone.utc).isoformat()

    # 5. Transition to APPROVED -> PROCESSING -> SUCCESS via BMONI payout rails
    await db.execute(
        "UPDATE expenses SET status = ? WHERE id = ?;",
        (ExpenseStatus.PROCESSING.value, expense_id)
    )
    await db.commit()

    exp_status, provider, payout_meta = await bmoni_adapter.execute_payout(
        fund_name=fund["name"],
        amount=expense["amount"],
        recipient_name=expense["recipient_name"] or "Authorized Recipient",
        recipient_account_number=expense["recipient_account_number"] or "",
        recipient_bank_name=expense["recipient_bank_name"] or "Commercial Bank",
        recipient_bank_code=expense["recipient_bank_code"] or ""
    )
    payout_ref = payout_meta.get("payout_reference")
    if note:
        payout_meta["approval_note"] = note

    await db.execute(
        """
        UPDATE expenses
        SET status = ?, approved_by = ?, approved_at = ?, reference_id = ?, provider = ?, metadata = ?
        WHERE id = ?;
        """,
        (
            ExpenseStatus.SUCCESS.value,
            user_id,
            now_iso,
            payout_ref,
            provider,
            json.dumps(payout_meta),
            expense_id
        )
    )

    # Insert Transaction
    await db.execute(
        """
        INSERT INTO transactions (fund_id, reference_id, type, amount, currency, status, provider, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            expense["fund_id"],
            payout_ref,
            TransactionType.EXPENSE.value,
            expense["amount"],
            "NGN",
            TransactionStatus.SUCCESS.value,
            provider,
            json.dumps(payout_meta),
            now_iso
        )
    )

    # Audit Logs
    await db.execute(
        """
        INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?);
        """,
        (
            user_id,
            expense["fund_id"],
            AuditAction.EXPENSE_APPROVED.value,
            json.dumps({
                "expense_id": expense_id,
                "title": expense["title"],
                "amount": expense["amount"],
                "note": note
            }),
            now_iso
        )
    )
    await db.execute(
        """
        INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?);
        """,
        (
            user_id,
            expense["fund_id"],
            AuditAction.EXPENSE_SETTLED.value,
            json.dumps({
                "expense_id": expense_id,
                "payout_reference": payout_ref,
                "recipient": expense["recipient_name"],
                "bank": expense["recipient_bank_name"]
            }),
            now_iso
        )
    )
    await db.commit()

    cursor = await db.execute("SELECT * FROM expenses WHERE id = ?;", (expense_id,))
    row = await cursor.fetchone()
    return dict(row)

async def reject_expense(
    expense_id: int,
    user_id: int,
    note: Optional[str],
    db: aiosqlite.Connection
) -> Dict[str, Any]:
    # 1. Fetch expense
    cursor = await db.execute("SELECT * FROM expenses WHERE id = ?;", (expense_id,))
    expense = await cursor.fetchone()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense request not found")

    # 2. Check fund ownership
    cursor = await db.execute("SELECT * FROM funds WHERE id = ?;", (expense["fund_id"],))
    fund = await cursor.fetchone()
    if not fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Associated fund not found")
    if fund["owner_id"] != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to reject expenses for this fund")

    # 3. Check current status
    if expense["status"] != ExpenseStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only pending expense requests can be rejected. Current status: {expense['status']}"
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    meta = {}
    if expense["metadata"]:
        try:
            meta = json.loads(expense["metadata"])
        except Exception:
            pass
    if note:
        meta["rejection_reason"] = note

    await db.execute(
        "UPDATE expenses SET status = ?, metadata = ? WHERE id = ?;",
        (ExpenseStatus.REJECTED.value, json.dumps(meta), expense_id)
    )

    # Audit Log
    await db.execute(
        """
        INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?);
        """,
        (
            user_id,
            expense["fund_id"],
            AuditAction.EXPENSE_REJECTED.value,
            json.dumps({
                "expense_id": expense_id,
                "title": expense["title"],
                "reason": note
            }),
            now_iso
        )
    )
    await db.commit()

    cursor = await db.execute("SELECT * FROM expenses WHERE id = ?;", (expense_id,))
    row = await cursor.fetchone()
    return dict(row)

async def get_fund_expenses(fund_id: int, db: aiosqlite.Connection) -> List[dict]:
    cursor = await db.execute(
        """
        SELECT id, fund_id, title, description, amount, category,
               recipient_name, recipient_account_number, recipient_bank_name, recipient_bank_code,
               status, approved_by, approved_at, reference_id, provider,
               created_by, created_at
        FROM expenses
        WHERE fund_id = ?
        ORDER BY id DESC;
        """,
        (fund_id,)
    )
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]
