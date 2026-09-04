import httpx
import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from ..config import settings
from .report_service import generate_financial_report
import aiosqlite

async def analyze_fund_finances(
    fund_id: int,
    user_id: int,
    db: aiosqlite.Connection
) -> Dict[str, Any]:
    # 1. Backend calculates all exact financial numbers
    report = await generate_financial_report(fund_id, user_id, db)

    fund_name = report["fund_name"]
    target = report["target_amount"]
    collected = report["total_contributions"]
    spent = report["total_expenses"]
    remaining = report["remaining_balance"]
    pct_funded = report["percent_funded"]
    breakdown = report["expense_breakdown"]

    # Identify largest expense category
    largest_cat = "None"
    largest_cat_amt = 0.0
    largest_cat_pct = 0.0
    if breakdown:
        sorted_breakdown = sorted(breakdown, key=lambda x: x["amount"], reverse=True)
        largest_cat = sorted_breakdown[0]["category"]
        largest_cat_amt = sorted_breakdown[0]["amount"]
        largest_cat_pct = sorted_breakdown[0]["percentage"]

    # 2. If Gemini API Key is configured, query Gemini model
    if settings.AI_API_KEY:
        try:
            prompt = f"""
You are a senior financial auditor analyzing student group fund data.
Return ONLY valid JSON matching this schema:
{{
  "summary": "1-2 sentence concise executive financial summary",
  "observations": ["observation 1", "observation 2", "observation 3"],
  "recommendation": "Concrete tactical advice for the student organizer"
}}

Financial Data:
Fund Name: {fund_name}
Target: ₦{target:,.2f}
Total Collected: ₦{collected:,.2f} ({pct_funded}% of target)
Total Expenses: ₦{spent:,.2f}
Remaining Balance: ₦{remaining:,.2f}
Largest Expense Category: {largest_cat} (₦{largest_cat_amt:,.2f}, {largest_cat_pct}% of total spent)
Paid Contributors: {report["paid_contributors_count"]}
Pending Contributors: {report["pending_contributors_count"]}
"""
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.AI_API_KEY}"
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(
                    url,
                    json={"contents": [{"parts": [{"text": prompt}]}]},
                    headers={"Content-Type": "application/json"}
                )
                if res.status_code == 200:
                    data = res.json()
                    raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    # Clean potential markdown wrapping
                    if raw_text.startswith("```json"):
                        raw_text = raw_text[7:-3].strip()
                    elif raw_text.startswith("```"):
                        raw_text = raw_text[3:-3].strip()
                    parsed = json.loads(raw_text)
                    return {
                        "fund_id": fund_id,
                        "fund_name": fund_name,
                        "summary": parsed.get("summary", ""),
                        "observations": parsed.get("observations", []),
                        "recommendation": parsed.get("recommendation", ""),
                        "analyzed_at": datetime.now(timezone.utc).isoformat()
                    }
        except Exception:
            pass  # Fall through to deterministic financial analyst engine

    # 3. Deterministic Financial Intelligence Engine
    # Generates accurate, tailored financial observations from backend metrics
    if pct_funded >= 100:
        summary = f"{fund_name} has fully met its contribution target of ₦{target:,.2f}, collecting ₦{collected:,.2f} with ₦{remaining:,.2f} uncommitted balance."
    elif pct_funded >= 60:
        summary = f"{fund_name} has secured ₦{collected:,.2f} ({pct_funded}% of target). Current collections comfortably cover active expenses of ₦{spent:,.2f}."
    else:
        summary = f"{fund_name} is currently at {pct_funded}% of its target (₦{collected:,.2f} of ₦{target:,.2f}), leaving ₦{target - collected:,.2f} remaining to collect."

    observations = []
    if breakdown:
        observations.append(f"{largest_cat} represents the single largest expenditure, accounting for {largest_cat_pct}% (₦{largest_cat_amt:,.2f}) of total expenses.")
    if remaining > 0:
        observations.append(f"Net remaining liquidity stands at ₦{remaining:,.2f} across all verified member contributions.")
    else:
        observations.append("Expenses match or exceed current collections. Immediate budget adjustment advised.")

    if report["pending_contributors_count"] > 0:
        observations.append(f"{report['pending_contributors_count']} members have pending pledges yet to settle.")
    else:
        observations.append(f"100% of recorded member pledges ({report['paid_contributors_count']} contributors) are successfully paid and cleared.")

    if remaining > 20000:
        recommendation = f"Maintain a reserve buffer of at least ₦{min(20000.0, remaining):,.2f} for unexpected project overruns before approving new expense line items."
    elif remaining > 0:
        recommendation = f"Reserve the remaining ₦{remaining:,.2f} for project wrap-up or final documentation submission costs."
    else:
        recommendation = "Pause non-essential project spending until outstanding contributor pledges are collected."

    return {
        "fund_id": fund_id,
        "fund_name": fund_name,
        "summary": summary,
        "observations": observations,
        "recommendation": recommendation,
        "analyzed_at": datetime.now(timezone.utc).isoformat()
    }
