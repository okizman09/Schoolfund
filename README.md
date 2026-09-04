# SchoolFund

> **Group contributions, without the chaos.**  
> Transparent contribution, dues, project funding, and expense coordination for student communities across Nigeria.

SchoolFund replaces unverified WhatsApp transfer screenshots, unorganized personal bank transfers, and messy spreadsheets with a single, clear financial coordination workflow:  
`Create fund` → `Share secure masked link (/join/SF-XXXX)` → `Collect contributions via live BMONI banking rails` → `Track payments` → `Record expenses` → `Generate one-click audit report` + `AI Fund Insights`.

---

## 1. Problem Statement & Solution

### The Problem
Class representatives, departmental executives, project groups, and student clubs across Nigerian tertiary institutions (universities, polytechnics, and colleges of education) coordinate group finances manually:
- Members transfer money to a student governor's personal bank account.
- Screenshots of transfer receipts flood WhatsApp group chats, creating noise and confusion.
- Organizers manually tick names in physical notebooks or update Google Sheets.
- Severe disputes arise over who paid, how much was collected, what money was spent, and what unspent balance remains.
- Personal funds and group money get mixed up, leading to allegations of mismanagement.

### The Solution
SchoolFund provides a dedicated, trustworthy coordination layer tailored to the realities of Nigerian students:
- **Any Form of Contribution**: Supports class and departmental dues, final year projects, laboratory supplies, field trips, departmental dinners, student emergency relief, and hostel amenities.
- **Nationwide Campus Coverage**: Engineered for higher education institutions across all 36 States and Abuja FCT (UNILAG, UI, OAU, ABU Zaria, UNN, UNIBEN, FUTA, UNILORIN, LASU, Covenant, etc.).
- **Live BMONI Banking Rails**: Each fund is backed by verified Nigerian Virtual Bank Account rails (9 Payment Service Bank) with instant online and direct transfer settlement.
- **Masked Public Links**: Contributors pay directly via `/#join/SF-CSC301` without exposing organizer personal accounts or requiring contributor app installation.
- **Strict State Machine**: Payments progress through `PENDING` → `PROCESSING` → `SUCCESS` verified authoritatively on the backend.
- **Financial Idempotency**: Unique transaction references (`SF-CONT-YYYYMMDD-XXXXX`) eliminate duplicate charges.
- **Transparent Expense Tracking**: Organizers log expenses against collected funds with category tracking.
- **Executive Audit Reports**: One-click printable financial balance sheets ready for presentation to students, lecturers, or departmental heads.
- **AI Financial Intelligence**: Google Gemini interprets structured financial metrics to offer actionable budgeting recommendations.

---

## 2. Architecture

```text
                 ┌────────────────────────────────┐
                 │       SchoolFund Web App       │
                 │   React + TypeScript + Vite    │
                 │    Tailwind CSS + Lucide UI    │
                 │    SEO & AEO Schema Graphs     │
                 └───────────────┬────────────────┘
                                 │ HTTPS / JSON REST
                                 ▼
                 ┌────────────────────────────────┐
                 │        FastAPI Backend         │
                 │     Python 3.14 + Uvicorn      │
                 └──────┬──────────────┬──────────┘
                        │              │
              ┌─────────┘              └─────────┐
              ▼                                  ▼
   ┌──────────────────────┐          ┌───────────────────────┐
   │    Async Database    │          │  BMONI Service Layer  │
   │ SQLite via aiosqlite │          │  client.py / adapter  │
   │ (Zero external deps) │          │  webhooks router      │
   └──────────────────────┘          └───────────┬───────────┘
                                                 │
   ┌──────────────────────┐                      ▼
   │   Gemini AI Layer    │          ┌───────────────────────┐
   │ Financial Insights   │          │   BMONI Live Rails    │
   │ & Budget Advisory    │          │ 9PSB NGN Virtual Acct │
   └──────────────────────┘          └───────────────────────┘
```

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons
- **Backend**: Python 3.14, FastAPI, Uvicorn, aiosqlite, Pydantic v2, PyJWT, bcrypt, httpx
- **Database**: SQLite (Async via `aiosqlite`) — Zero external database installation required
- **AI Intelligence**: Google Gemini API via backend proxy with deterministic rule-based fallback
- **Financial Infrastructure**: BMONI Embedded REST API with live Nigerian banking rails (9PSB) and HMAC-SHA256 webhook verification
- **SEO & AEO**: Full Schema.org JSON-LD structured graph (`SoftwareApplication`, `Organization`, `FAQPage`), complete Open Graph, and Twitter metadata

---

## 4. Live BMONI Integration Architecture

### Verified REST API Capabilities & Rails
The application connects directly to the official BMONI Embedded infrastructure:
- **Base URL**: `https://embedded-dev.bmoni.com`
- **Authentication**: `x-api-key: pk_a025cacbf33a_...`
- **Nigerian Banking Rails**: Provisioned with active Nigerian Virtual Bank Accounts via **9 Payment Service Bank (9PSB)**:
  - Bank Name: `9 Payment Service Bank`
  - Account Number: `6177463833`
  - Account Name: `Bkey Limited / SchoolFund`
  - Currency: `NGN`

### Payment Channels Supported
1. **Instant Checkout**: Live settlement via BMONI gateway rails.
2. **Direct Nigerian Bank Transfer**: Contributors transfer from any commercial or digital bank app in Nigeria (GTBank, Access, Kuda, OPay, Zenith, PalmPay, etc.) directly into the fund's 9PSB account using the unique payment reference.
3. **Cryptographic Webhook Verification**: `POST /api/webhooks/bmoni` verifies the `X-Webhook-Signature` header using HMAC-SHA256 with the partner secret (`BMONI_WEBHOOK_SECRET`) over raw request bytes.

---

## 5. SEO & AEO (Answer Engine Optimization)

SchoolFund implements comprehensive SEO and AEO to ensure maximum discoverability across search engines (Google, Bing) and AI answer engines (Perplexity, ChatGPT Search, Gemini):
- **Semantic Entities**: Explicitly tags institutions, contribution types, currency (`NGN`), and banking rails.
- **Schema.org Structured Data**:
  - `SoftwareApplication` with feature lists, zero pricing offer, and geographic targeting (`areaServed: "NG"`).
  - `FAQPage` answering key direct-query prompts regarding student dues, BMONI verification, and dispute resolution.
  - `Organization` representing SchoolFund Technologies.
- **Direct Answer FAQ Section**: Accessible on the landing page with structured accordion answers tailored for conversational answer extraction.

---

## 6. Environment Variables

Configure `.env` (or copy from `.env.example`):

```bash
# Database
DATABASE_PROVIDER=sqlite
DATABASE_PATH=./schoolfund.db

# BMONI Live Infrastructure
BMONI_ENABLED=true
BMONI_API_BASE_URL=https://embedded-dev.bmoni.com
BMONI_API_KEY=pk_a025cacbf33a_76fb864113f3540909de5b1da39cc146906e35b1c6d4d1e4
BMONI_WEBHOOK_SECRET=b4b51077f69da69f249c19a3fe40e789be110aa93485a3415640c42f19a90675

# Authentication
JWT_SECRET=schoolfund_secure_jwt_secret_dev_key_change_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Demo Mode & AI
DEMO_MODE=true
AI_API_KEY=your_gemini_api_key_here


# Server URLs
PORT=8000
FRONTEND_URL=http://localhost:5173
```

---

## 7. Getting Started

### 1. Start the Backend API
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- API Documentation (Swagger UI): `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/health`

### 2. Start the Frontend App
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

### 3. Run Automated Tests
```bash
cd backend
python -m pytest
```
All 9 automated unit and integration tests pass (100% test success rate):
- Health check & configuration
- Demo authentication & multi-fund retrieval
- Public fund lookup with security masking
- Public contribution idempotency & state machine
- Live BMONI transaction processing
- Expense logging & balance deduction
- Financial statement compilation & PDF print readiness
- AI financial analysis and recommendations
- HMAC-SHA256 BMONI webhook signature verification

---

## 8. Live Demonstration Guide

1. Open `http://localhost:5173/` in your browser.
2. Review the nationwide landing page with the campus trust ticker, contribution categories, and AEO FAQ section.
3. Click **"Demo as Okiki"** in the navigation bar to enter the live dashboard.
4. View the active **CSC 301 Final Project Fund** with signature **Fund Health** element (63.3% funded, ₦95,000 collected, 19 verified members).
5. Open the public contribution link `/#join/SF-CSC301`.
6. Notice the dual payment options: **Instant Checkout** and **Direct 9PSB Bank Transfer**.
7. Complete a ₦5,000 contribution and observe the live BMONI settlement receipt (`SF-CONT-20260904-XXXXX`).
8. Return to the dashboard, click **"Add expense"**, and log a project expenditure.
9. Click **"Financial report"** to view and print the executive balance sheet.
10. Click **"Analyze fund"** to generate AI-assisted financial recommendations.
