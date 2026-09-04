import aiosqlite
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from ..schemas.contribution import ContributionCreate, ContributionResponse
from ..integrations.bmoni.bmoni_adapter import bmoni_adapter
from ..models.enums import ContributionStatus, TransactionType, TransactionStatus, AuditAction

async def initiate_and_process_contribution(
    contrib_in: ContributionCreate,
    db: aiosqlite.Connection
) -> Dict[str, Any]:
    # 1. Look up fund by public code
    cursor = await db.execute(
        "SELECT id, name, status, contribution_amount, allow_custom_amount FROM funds WHERE public_code = ?;",
        (contrib_in.public_code,)
    )
    fund = await cursor.fetchone()
    if not fund:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fund not found with provided code")
    if fund["status"] != "active":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Fund is no longer accepting contributions")

    # Validate amount if custom amounts are disabled
    if not bool(fund["allow_custom_amount"]) and contrib_in.amount != fund["contribution_amount"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only exact contributions of ₦{fund['contribution_amount']:,.2f} are allowed"
        )

    # 2. Financial Idempotency check:
    now_iso = datetime.now(timezone.utc).isoformat()
    if contrib_in.reference_id:
        cursor = await db.execute(
            "SELECT * FROM contributions WHERE reference_id = ?;",
            (contrib_in.reference_id,)
        )
        existing = await cursor.fetchone()
        if existing:
            if existing["status"] == ContributionStatus.SUCCESS.value:
                return dict(existing)
            elif existing["status"] == ContributionStatus.PROCESSING.value:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Payment is currently being processed. Please do not duplicate."
                )

    # Generate reference if none passed
    ref_id = contrib_in.reference_id or bmoni_adapter.generate_reference()

    # Step A: Insert as PENDING
    payment_init = await bmoni_adapter.initiate_payment(
        fund_name=fund["name"],
        contributor_name=contrib_in.contributor_name,
        contributor_email=contrib_in.contributor_email,
        amount=contrib_in.amount,
        custom_ref=ref_id
    )

    await db.execute(
        """
        INSERT INTO contributions (fund_id, contributor_name, contributor_email, amount, currency, status, provider, reference_id, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            fund["id"],
            contrib_in.contributor_name,
            contrib_in.contributor_email,
            contrib_in.amount,
            "NGN",
            ContributionStatus.PENDING.value,
            payment_init["provider"],
            ref_id,
            json.dumps({"stage": "initiated"}),
            now_iso
        )
    )
    await db.commit()

    # Step B: Transition to PROCESSING
    await db.execute(
        "UPDATE contributions SET status = ? WHERE reference_id = ?;",
        (ContributionStatus.PROCESSING.value, ref_id)
    )
    await db.commit()

    # Step C: Verification via BMONI Adapter
    try:
        final_status, provider, metadata = await bmoni_adapter.process_and_verify(
            reference_id=ref_id,
            amount=contrib_in.amount
        )
    except Exception as e:
        final_status = ContributionStatus.FAILED
        provider = "BMONI_SANDBOX"
        metadata = {"error": str(e), "stage": "processing_failed"}

    completed_iso = datetime.now(timezone.utc).isoformat()
    await db.execute(
        """
        UPDATE contributions 
        SET status = ?, provider = ?, metadata = ?, completed_at = ?
        WHERE reference_id = ?;
        """,
        (final_status.value, provider, json.dumps(metadata), completed_iso, ref_id)
    )

    # Step D: Record in Transactions Table
    await db.execute(
        """
        INSERT INTO transactions (fund_id, reference_id, type, amount, currency, status, provider, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        """,
        (
            fund["id"],
            ref_id,
            TransactionType.CONTRIBUTION.value,
            contrib_in.amount,
            "NGN",
            final_status.value,
            provider,
            json.dumps({"contributor": contrib_in.contributor_name, "email": contrib_in.contributor_email}),
            completed_iso
        )
    )

    # Step E: Record in Audit Log
    await db.execute(
        """
        INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
        VALUES (?, ?, ?, ?, ?);
        """,
        (
            None, # Public contributor
            fund["id"],
            AuditAction.CONTRIBUTION_SUCCESSFUL.value if final_status == ContributionStatus.SUCCESS else AuditAction.CONTRIBUTION_FAILED.value,
            json.dumps({
                "contributor": contrib_in.contributor_name,
                "amount": contrib_in.amount,
                "reference": ref_id,
                "provider": provider,
                "status": final_status.value
            }),
            completed_iso
        )
    )
    await db.commit()

    if final_status != ContributionStatus.SUCCESS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment transaction could not be verified by provider."
        )

    cursor = await db.execute("SELECT * FROM contributions WHERE reference_id = ?;", (ref_id,))
    final_row = await cursor.fetchone()
    return dict(final_row)

async def get_fund_contributors(fund_id: int, db: aiosqlite.Connection) -> List[dict]:
    cursor = await db.execute(
        "SELECT id, fund_id, contributor_name, contributor_email, amount, currency, status, provider, reference_id, created_at, completed_at FROM contributions WHERE fund_id = ? ORDER BY id DESC;",
        (fund_id,)
    )
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]
