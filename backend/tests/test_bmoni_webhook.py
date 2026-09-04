import hmac
import hashlib
import json
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

client = TestClient(app)

def test_bmoni_webhook_signature_verification():
    # Setup test payload
    payload = {
        "id": "evt-test-12345",
        "eventType": "employee.deposit.completed",
        "payload": {
            "userId": "0bfeea3c-6055-4cb5-92a4-2752f65470b9",
            "amount": "5000.00",
            "currency": "NGN",
            "reference": "SF-CONT-TEST-002"
        },
        "timestamp": "2026-09-04T06:04:13.000Z"
    }
    raw_bytes = json.dumps(payload).encode("utf-8")
    
    # Compute valid HMAC-SHA256 signature
    secret = settings.BMONI_WEBHOOK_SECRET or "b4b51077f69da69f249c19a3fe40e789be110aa93485a3415640c42f19a90675"
    valid_sig = hmac.new(secret.encode("utf-8"), raw_bytes, hashlib.sha256).hexdigest()

    # 1. Valid Signature should succeed
    res = client.post(
        "/api/webhooks/bmoni",
        content=raw_bytes,
        headers={
            "Content-Type": "application/json",
            "X-Webhook-Signature": valid_sig
        }
    )
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
    assert res.json()["event"] == "employee.deposit.completed"

    # 2. Invalid Signature should be rejected with 401
    invalid_sig = "bad_signature_hash_12345"
    res_bad = client.post(
        "/api/webhooks/bmoni",
        content=raw_bytes,
        headers={
            "Content-Type": "application/json",
            "X-Webhook-Signature": invalid_sig
        }
    )
    assert res_bad.status_code == 401
    assert "Invalid BMONI webhook signature" in res_bad.json()["detail"]
