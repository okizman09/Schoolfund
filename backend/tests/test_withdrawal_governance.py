import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    asyncio.run(init_db())

client = TestClient(app)

def test_nigerian_banks_list():
    res = client.get("/api/expenses/banks")
    assert res.status_code == 200
    banks = res.json()
    assert isinstance(banks, list)
    assert len(banks) > 0
    bank_names = [b["name"] for b in banks]
    assert any("Guaranty Trust" in name or "GTBank" in name for name in bank_names)
    assert any("Access Bank" in name for name in bank_names)
    assert any("Kuda" in name for name in bank_names)

def test_withdrawal_lifecycle_and_governance():
    # 1. Login as fund owner
    login_res = client.post("/api/auth/demo-login")
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get CSC 301 fund
    funds_res = client.get("/api/funds", headers=headers)
    assert funds_res.status_code == 200
    funds = funds_res.json()
    fund = next(f for f in funds if f["public_code"] == "SF-CSC301")
    fund_id = fund["id"]
    avail_before = fund["available_balance"]
    assert avail_before > 0

    # 3. Test Insufficient Balance Rejection
    excess_res = client.post(
        "/api/expenses",
        json={
            "fund_id": fund_id,
            "title": "Impossible Luxury Bus",
            "amount": avail_before + 500000.0,
            "category": "Transport",
            "recipient_name": "Transporter",
            "recipient_account_number": "0123456789",
            "recipient_bank_name": "GTBank"
        },
        headers=headers
    )
    assert excess_res.status_code == 400
    assert "Insufficient available balance" in excess_res.json()["detail"]

    # 4. Request a Governed Withdrawal (Status: PENDING)
    request_amount = 5000.0
    req_res = client.post(
        "/api/expenses",
        json={
            "fund_id": fund_id,
            "title": "CSC 301 Printing Materials",
            "description": "Payment for lab manuals",
            "amount": request_amount,
            "category": "Printing",
            "recipient_name": "University Press Vendor",
            "recipient_account_number": "0123456789",
            "recipient_bank_name": "Guaranty Trust Bank (GTBank)",
            "recipient_bank_code": "058",
            "auto_approve": False
        },
        headers=headers
    )
    assert req_res.status_code == 200
    pending_exp = req_res.json()
    assert pending_exp["status"] == "pending"
    assert pending_exp["recipient_name"] == "University Press Vendor"
    assert pending_exp["recipient_bank_name"] == "Guaranty Trust Bank (GTBank)"
    expense_id = pending_exp["id"]

    # Check that available_balance decreased by request_amount and pending_expenses increased
    fund_check = client.get(f"/api/funds/{fund_id}", headers=headers).json()
    assert fund_check["pending_expenses"] >= request_amount
    assert fund_check["available_balance"] <= avail_before - request_amount

    # 5. Approve the Payout Request
    approve_res = client.post(
        f"/api/expenses/{expense_id}/approve",
        json={"note": "Approved by CSC class representative"},
        headers=headers
    )
    assert approve_res.status_code == 200
    approved_exp = approve_res.json()
    assert approved_exp["status"] == "success"
    assert approved_exp["reference_id"].startswith("SF-WTH-")
    assert approved_exp["approved_by"] is not None
    assert approved_exp["approved_at"] is not None

    # Check updated fund metrics: total_spent increases, pending_expenses cleared
    fund_after = client.get(f"/api/funds/{fund_id}", headers=headers).json()
    assert fund_after["total_spent"] >= request_amount

    # 6. Test Rejection Lifecycle
    req2_res = client.post(
        "/api/expenses",
        json={
            "fund_id": fund_id,
            "title": "Snacks and Soft Drinks",
            "amount": 2000.0,
            "category": "Other",
            "recipient_name": "Campus Cafe",
            "recipient_account_number": "9876543210",
            "recipient_bank_name": "Kuda Bank",
            "auto_approve": False
        },
        headers=headers
    )
    assert req2_res.status_code == 200
    exp2_id = req2_res.json()["id"]

    reject_res = client.post(
        f"/api/expenses/{exp2_id}/reject",
        json={"note": "Snacks not covered in departmental budget"},
        headers=headers
    )
    assert reject_res.status_code == 200
    rejected_exp = reject_res.json()
    assert rejected_exp["status"] == "rejected"
