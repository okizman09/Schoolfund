import aiosqlite
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_db
from ..schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from ..services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserCreate, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id FROM users WHERE email = ?;", (user_in.email,))
    if await cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    now_iso = datetime.now(timezone.utc).isoformat()

    cursor = await db.execute(
        "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?);",
        (user_in.name, user_in.email, hashed_pwd, now_iso)
    )
    await db.commit()
    user_id = cursor.lastrowid

    token = create_access_token(data={"sub": str(user_id)})
    user_resp = UserResponse(id=user_id, name=user_in.name, email=user_in.email, created_at=now_iso)
    return TokenResponse(access_token=token, user=user_resp)

@router.post("/login", response_model=TokenResponse)
async def login(user_in: UserLogin, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?;", (user_in.email,))
    user = await cursor.fetchone()
    if not user or not verify_password(user_in.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(data={"sub": str(user["id"])})
    user_resp = UserResponse(id=user["id"], name=user["name"], email=user["email"], created_at=user["created_at"])
    return TokenResponse(access_token=token, user=user_resp)

@router.post("/demo-login", response_model=TokenResponse)
async def demo_login(db: aiosqlite.Connection = Depends(get_db)):
    """Convenience endpoint for instant hackathon demo evaluation"""
    cursor = await db.execute("SELECT id, name, email, created_at FROM users WHERE email = 'okiki@schoolfund.ng';")
    user = await cursor.fetchone()
    if not user:
        # Fallback to first user
        cursor = await db.execute("SELECT id, name, email, created_at FROM users LIMIT 1;")
        user = await cursor.fetchone()

    if not user:
        raise HTTPException(status_code=404, detail="Demo user not available")

    token = create_access_token(data={"sub": str(user["id"])})
    user_resp = UserResponse(id=user["id"], name=user["name"], email=user["email"], created_at=user["created_at"])
    return TokenResponse(access_token=token, user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        created_at=current_user["created_at"]
    )
