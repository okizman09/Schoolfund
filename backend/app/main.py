import aiosqlite
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db, get_db
from .routers import auth, funds, contributions, expenses, reports, ai
from .services.auth_service import get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed demo data if DEMO_MODE=true
    await init_db()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="SchoolFund API",
    description="Modern contribution and expense management API for student communities in Lagos, Nigeria.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(funds.router)
app.include_router(contributions.router)
app.include_router(expenses.router)
app.include_router(reports.router)
app.include_router(ai.router)

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "database": settings.DATABASE_PROVIDER,
        "demo_mode": settings.DEMO_MODE,
        "bmoni_enabled": settings.BMONI_ENABLED,
        "bmoni_base_url": settings.BMONI_API_BASE_URL
    }

@app.get("/api/transactions", tags=["Transactions"])
async def get_recent_transactions(
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    """Fetches recent financial transactions across all user funds"""
    cursor = await db.execute(
        """
        SELECT t.id, t.fund_id, t.reference_id, t.type, t.amount, t.currency, t.status, t.provider, t.metadata, t.created_at, f.name as fund_name
        FROM transactions t
        JOIN funds f ON t.fund_id = f.id
        WHERE f.owner_id = ?
        ORDER BY t.created_at DESC
        LIMIT 25;
        """,
        (current_user["id"],)
    )
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]

@app.get("/api/audit-logs", tags=["Audit"])
async def get_audit_logs(
    current_user: dict = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db)
):
    """Fetches audit logs across user funds for transparent audit trail"""
    cursor = await db.execute(
        """
        SELECT a.id, a.user_id, a.fund_id, a.action, a.metadata, a.timestamp, f.name as fund_name
        FROM audit_logs a
        LEFT JOIN funds f ON a.fund_id = f.id
        WHERE a.user_id = ? OR f.owner_id = ?
        ORDER BY a.timestamp DESC
        LIMIT 30;
        """,
        (current_user["id"], current_user["id"])
    )
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]
