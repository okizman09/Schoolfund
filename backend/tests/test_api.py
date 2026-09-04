import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    asyncio.run(init_db())

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["demo_mode"] is True

def test_demo_login_and_funds():
    res = client.post("/api/auth/demo-login")
    assert res.status_code == 200
    data = res.json()
    token = data["access_token"]
    assert token is not None
    assert data["user"]["email"] == "okiki@schoolfund.ng"

    headers = {"Authorization": f"Bearer {token}"}
    funds_res = client.get("/api/funds", headers=headers)
    assert funds_res.status_code == 200
    funds = funds_res.json()
    assert len(funds) >= 1
    csc_fund = funds[0]
    assert csc_fund["public_code"] == "SF-CSC301"
    assert csc_fund["total_collected"] >= 95000.0
    assert csc_fund["health_status"] in ["Healthy", "Excellent"]

def test_public_fund_lookup():
    res = client.get("/api/funds/public/SF-CSC301")
    assert res.status_code == 200
    data = res.json()
    assert data["public_code"] == "SF-CSC301"
    assert "owner_id" not in data  # Masked for security!
    assert "email" not in data     # Masked for security!
    assert data["total_collected"] >= 95000.0

def test_public_contribution_and_idempotency():
    # Public contribution with explicit reference
    ref_id = "SF-CONT-TEST-002"
    payload = {
        "public_code": "SF-CSC301",
        "contributor_name": "Tolu Longe",
        "contributor_email": "tolu.longe@unilag.edu.ng",
        "amount": 5000.0,
        "reference_id": ref_id
    }
    res = client.post("/api/contributions", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["reference_id"] == ref_id
    assert data["provider"] in ["BMONI_SANDBOX", "BMONI_LIVE"]

    # Idempotent re-submission (must return same record without duplicating amount)
    dup_res = client.post("/api/contributions", json=payload)
    assert dup_res.status_code == 200
    dup_data = dup_res.json()
    assert dup_data["id"] == data["id"]
    assert dup_data["reference_id"] == ref_id

def test_expense_creation_and_balance_deduction():
    auth_res = client.post("/api/auth/demo-login")
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get fund before expense
    fund_before = client.get("/api/funds/1", headers=headers).json()
    initial_balance = fund_before["remaining_balance"]

    # Add expense
    expense_payload = {
        "fund_id": 1,
        "title": "USB Cable & Breadboard Jumper Pack",
        "description": "Hardware testing supplies",
        "amount": 2500.0,
        "category": "Equipment"
    }
    exp_res = client.post("/api/expenses", json=expense_payload, headers=headers)
    assert exp_res.status_code == 200
    exp_data = exp_res.json()
    assert exp_data["amount"] == 2500.0

    # Get fund after expense and verify balance subtraction
    fund_after = client.get("/api/funds/1", headers=headers).json()
    assert fund_after["remaining_balance"] == initial_balance - 2500.0

def test_report_authorization_for_non_owner():
    # Register another user
    new_user = {
        "name": "Intruder User",
        "email": "intruder@university.edu.ng",
        "password": "password123"
    }
    reg_res = client.post("/api/auth/register", json=new_user)
    if reg_res.status_code == 200:
        other_token = reg_res.json()["access_token"]
    else:
        log_res = client.post("/api/auth/login", json={"email": new_user["email"], "password": new_user["password"]})
        other_token = log_res.json()["access_token"]

    other_headers = {"Authorization": f"Bearer {other_token}"}

    # Attempt to view report for Fund 1 (owned by Okiki)
    rep_res = client.get("/api/reports/1", headers=other_headers)
    assert rep_res.status_code == 403

def test_fund_creation_validation():
    auth_res = client.post("/api/auth/demo-login")
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Invalid negative amount
    invalid_fund = {
        "name": "Invalid Fund",
        "target_amount": -5000.0,
        "contribution_amount": 1000.0
    }
    res = client.post("/api/funds", json=invalid_fund, headers=headers)
    assert res.status_code == 422  # Pydantic validation error

def test_financial_report_and_ai():
    auth_res = client.post("/api/auth/demo-login")
    token = auth_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Financial Report
    rep_res = client.get("/api/reports/1", headers=headers)
    assert rep_res.status_code == 200
    rep = rep_res.json()
    assert rep["fund_name"] == "CSC 301 Final Project"
    assert len(rep["expense_breakdown"]) > 0
    assert rep["target_amount"] == 150000.0

    # AI Fund Analysis
    ai_res = client.post("/api/ai/analyze/1", headers=headers)
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert len(ai_data["summary"]) > 0
    assert len(ai_data["observations"]) > 0
    assert len(ai_data["recommendation"]) > 0
