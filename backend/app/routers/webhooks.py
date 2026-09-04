import hmac
import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Request, Header, HTTPException, status, Depends
import aiosqlite
from ..database import get_db
from ..config import settings
from ..models.enums import ContributionStatus, TransactionType, AuditAction

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

@router.post("/bmoni")
async def bmoni_webhook(
    request: Request,
    db: aiosqlite.Connection = Depends(get_db)
):
    """
    Official BMONI Webhook Handler
    
    Source of Truth: https://bkey.mintlify.app/webhooks
    Headers:
      - X-Webhook-Signature: HMAC-SHA256 of the raw request payload using BMONI_WEBHOOK_SECRET
    """
    raw_body = await request.body()
    signature = request.headers.get("x-webhook-signature") or request.headers.get("X-Webhook-Signature")

    # Verify signature if secret is configured and signature provided
    if settings.BMONI_WEBHOOK_SECRET and signature:
        expected = hmac.new(
            settings.BMONI_WEBHOOK_SECRET.encode("utf-8"),
            raw_body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid BMONI webhook signature"
            )

    try:
        data = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON payload"
        )

    event_type = data.get("eventType") or data.get("event") or "unknown"
    payload = data.get("payload", {})
    ref_id = payload.get("reference") or payload.get("reference_id") or data.get("reference")

    # If reference matches a contribution, transition it to SUCCESS
    if ref_id:
        cursor = await db.execute(
            "SELECT id, fund_id, amount, status FROM contributions WHERE reference_id = ?;",
            (ref_id,)
        )
        contrib = await cursor.fetchone()
        if contrib and contrib["status"] != ContributionStatus.SUCCESS.value:
            now_iso = datetime.now(timezone.utc).isoformat()
            await db.execute(
                """
                UPDATE contributions 
                SET status = ?, provider = 'BMONI_LIVE', completed_at = ?, metadata = ?
                WHERE reference_id = ?;
                """,
                (
                    ContributionStatus.SUCCESS.value,
                    now_iso,
                    json.dumps({"webhook_event": event_type, "verified_at": now_iso}),
                    ref_id
                )
            )

            # Insert or update transaction
            await db.execute(
                """
                INSERT OR REPLACE INTO transactions (fund_id, reference_id, type, amount, currency, status, provider, metadata, created_at)
                VALUES (?, ?, ?, ?, 'NGN', ?, 'BMONI_LIVE', ?, ?);
                """,
                (
                    contrib["fund_id"],
                    ref_id,
                    TransactionType.CONTRIBUTION.value,
                    contrib["amount"],
                    ContributionStatus.SUCCESS.value,
                    json.dumps({"source": "bmoni_webhook", "event": event_type}),
                    now_iso
                )
            )

            # Audit log
            await db.execute(
                """
                INSERT INTO audit_logs (user_id, fund_id, action, metadata, timestamp)
                VALUES (NULL, ?, ?, ?, ?);
                """,
                (
                    contrib["fund_id"],
                    AuditAction.CONTRIBUTION_SUCCESSFUL.value,
                    json.dumps({"reference": ref_id, "event": event_type}),
                    now_iso
                )
            )
            await db.commit()

    return {"status": "ok", "event": event_type, "reference": ref_id}
