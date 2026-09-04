# SchoolFund

> **Group contributions, without the chaos.**  
> Transparent contribution and expense management for student communities in Lagos, Nigeria.

SchoolFund replaces unverified WhatsApp transfer screenshots, unorganized group bank transfers, and spreadsheet tracking with a single, clear financial coordination workflow:  
`Create fund` → `Share secure link (/join/SF-XXXX)` → `Collect contributions via BMONI Sandbox Adapter` → `Track payments` → `Record expenses` → `Generate financial report` + `AI Fund Insights`.

---

## 1. Problem Statement & Solution

### The Problem
University class representatives, project groups, and student clubs in Nigeria currently coordinate group payments manually:
- Members transfer money to a student governor's personal bank account.
- Screenshots of transfer receipts flood WhatsApp group chats.
- Organizers manually type names into Microsoft Excel or Google Sheets.
- Disputes arise over who paid, how much was collected, what money was spent, and what remains.

### The Solution
SchoolFund provides a dedicated, trustworthy coordination layer:
- **Masked Public Links**: Contributors pay directly via `/#join/SF-CSC301` without exposing organizer bank details or private database IDs.
- **Strict State Machine**: Payments progress through `PENDING` → `PROCESSING` → `SUCCESS` (or `FAILED`) verified exclusively on the backend.
- **Financial Idempotency**: Unique transaction references (`SF-CONT-20260904-XXXXX`) prevent double deductions.
- **Transparent Expense Tracking**: Organizers log expenses against collected funds with category tracking.
- **Executive Audit Reports**: One-click printable financial statements for full transparency with group members.
- **AI Financial Intelligence**: Google Gemini interprets structured backend metrics to offer actionable budget advice.

---

## 2. Architecture

```text
                 ┌────────────────────────────────┐
                 │       SchoolFund Web App       │
                 │   React + TypeScript + Vite    │
                 │      Tailwind CSS + UI Kit     │
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
   │  (Zero dependencies) │          └───────────┬───────────┘
   └──────────────────────┘                      │
                                                 ▼
   ┌──────────────────────┐          ┌───────────────────────┐
   │    Gemini AI Layer   │          │   BMONI Sandbox API   │
   │  Financial Insights  │          │ embedded-dev.bmoni.com│
   └──────────────────────┘          └───────────────────────┘
```

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons
- **Backend**: Python 3.14, FastAPI, Uvicorn, aiosqlite, Pydantic v2, PyJWT, bcrypt, httpx
- **Database**: SQLite (Async via `aiosqlite`) — Zero external database installation required
- **AI Intelligence**: Google Gemini API via backend proxy with deterministic rule-based fallback
- **Financial Infrastructure**: BMONI Embedded REST Integration & Sandbox Adapter

---

## 4. BMONI Integration & Architecture Explanation

### Ground Truth from Official Documentation
- **Official Documentation**: [https://bkey.mintlify.app/](https://bkey.mintlify.app/)
- **Interactive API Reference**: [https://embedded-dev.bmoni.com/docs](https://embedded-dev.bmoni.com/docs)
- **Base URLs**:
  - Development / Sandbox: `https://embedded-dev.bmoni.com`
  - Production: `https://embedded.bmoni.com`
- **Authentication**: `x-api-key: <partner_api_key>` in request headers

### Verified REST API Capabilities
The official BMONI Embedded REST API exposes endpoints for:
1. `GET /v1/users/{userId}/smart-wallets/account/balances` — Reading wallet balances
2. `GET /v1/users/{userId}/bank-accounts/deposit-accounts/NGN` — Retrieving Nigerian Virtual Bank Accounts (VBA)
3. `GET /v1/users/{userId}/bank-accounts/nigerian-banks` — Listing CBN-supported Nigerian commercial banks
4. `POST /v1/users/{userId}/bank-accounts/verify-nigerian-account` — Verifying 10-digit NUBAN account numbers
5. `POST /v1/users/{userId}/bank-accounts/withdrawal-accounts/nigeria` — Registering offramp bank accounts
6. `POST /v1/users/{userId}/smart-wallets/{smartWalletId}/offramp/nigeria` — Creating an offramp proposal
7. `POST /onboarding/start-nigeria` — Provisioning user identity and issuing virtual bank accounts

### Native Smart-Wallet Signing vs Web Architecture
As documented in the official BMONI guides, fund movement (transfers and withdrawals) requires an on-device signature generated by `bmoni_embedded_sdk` (Flutter/mobile using Android Keystore / iOS Secure Enclave) or Web3 EIP-712 signing:
- `GET /v1/users/{userId}/smart-wallets/proposals/{proposalId}/sign-payload`
- `POST /v1/users/{userId}/smart-wallets/proposals/{proposalId}/sign`

BMONI Embedded does **not** provide an unauthenticated public web checkout widget. Therefore:
- SchoolFund implements a clean **`BmoniPaymentAdapter`** (`backend/app/integrations/bmoni/bmoni_adapter.py`).
- The adapter strictly handles payment references, idempotency, and the `PENDING` → `PROCESSING` → `SUCCESS` state machine.
- All simulated transactions are explicitly labeled as **`BMONI_SANDBOX`** with simulation metadata (`"is_simulation": True`), ensuring that simulated test runs are never deceptively presented as live on-chain operations.
- **For Production Deployment**: Organizers will link their BMONI Nigerian Virtual Account (`/v1/users/{userId}/bank-accounts/deposit-accounts/NGN`), and incoming bank deposits will be credited directly to the student organization's CNGN smart wallet.

---

## 5. Environment Variables & Security

Copy `.env.example` to `.env`:

```bash
# Database
DATABASE_PROVIDER=sqlite
DATABASE_PATH=./schoolfund.db

# BMONI Infrastructure
BMONI_ENABLED=false
BMONI_API_BASE_URL=https://embedded-dev.bmoni.com
BMONI_API_KEY=pk_a025cacbf33a_76fb864113f3540909de5b1da39cc146906e35b1c6d4d1e4
BMONI_WEBHOOK_SECRET=

# Authentication
JWT_SECRET=schoolfund_secure_jwt_secret_dev_key_change_in_production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Demo Mode & AI
DEMO_MODE=true
AI_API_KEY=

# Server
PORT=8000
FRONTEND_URL=http://localhost:5173
```

### Security Guarantees
- **Zero Frontend Secrets**: No API keys, secret keys, or database credentials exist in the client bundle.
- **Backend Authoritative**: Frontend never marks a payment as successful. Backend transitions states based on verification.
- **Public Masking**: The public link `/#join/:code` exposes zero organizer emails or internal database primary keys.
- **Protected Endpoints**: Fund editing, expense logging, and private financial reports enforce strict user ownership (`owner_id == user_id`).

---

## 6. Getting Started

### 1. Start the Backend API
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- API Documentation (Swagger): `http://localhost:8000/docs`

### 2. Start the Frontend App
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 7. Demo Mode (`DEMO_MODE=true`)

When `DEMO_MODE=true`, the database automatically seeds an authentic demo environment:
- **Organizer**: Okiki Adewale (`okiki@schoolfund.ng`, password: `password123`)
- **Showcase Fund**: **CSC 301 Final Project** (`SF-CSC301`)
- **Target**: ₦150,000.00
- **Collected**: ₦95,000.00 (63.3% funded)
- **Contributors**: 19 verified member contributions (David Okafor, Mary James, etc.)
- **Expenses**: ₦62,500.00 (Printing ₦25k, Materials ₦20k, Equipment ₦17.5k)
- **Net Remaining Balance**: ₦32,500.00
- **Fund Health**: Healthy

---

## 8. 90-Second Demo Walkthrough

1. **Context (0:00 - 0:15)**: Open `http://localhost:5173/`. Explain: *"Students manage group funds through WhatsApp screenshots and spreadsheets. SchoolFund replaces this with one transparent workflow."*
2. **Dashboard & Health (0:15 - 0:30)**: Click **"Demo as Okiki"** in the top navbar. Show the **Fund Health** signature widget: 63% funded, ₦95,000 collected, 19 contributors verified.
3. **Public Contributor Link (0:30 - 0:45)**: Click "Invite" or open `/#join/SF-CSC301`. Show the masked view without login. Enter Name (*"Adaeze Nwankwo"*), Email, and click **"Pay ₦5,000"**.
4. **Verified Settlement (0:45 - 1:00)**: Watch the real-time state machine progress (`● Connecting` → `● Verifying` → `● Confirmation`). Show the verified receipt with reference `SF-CONT-20260904-XXXXX`.
5. **Expense Logging & Balance (1:00 - 1:15)**: Return to dashboard. Show balance update from ₦95,000 to ₦100,000. Click "Add expense" (e.g. ₦15,000 for Transport). Show balance instantly recalculating.
6. **Report & AI Analysis (1:15 - 1:30)**:
   - Click **"Financial report"** to show the official audit sheet and demonstrate the print-to-PDF view.
   - Click **"Analyze fund"** to show AI financial observations and recommendations.
   - Conclude: *"SchoolFund turns chaotic group payments into transparent financial operations powered by BMONI."*

---

## 9. Known Limitations

- **Web Browser Environment**: BMONI's official `bmoni_embedded_sdk` is native (Flutter/Android Keystore/iOS Secure Enclave). On the web, payments are handled via the backend adapter layer (`bmoni_adapter.py`) rather than an on-device mobile hardware enclave.
- **Sandbox Token Provisioning**: In BMONI sandbox, token funding is requested via the official support form (`https://formspree.io/f/meeynrzw`) or manual email allocation, rather than an instant public REST endpoint.
