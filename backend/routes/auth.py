from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import User
from models.schemas import Token, UserLogin, UserRegister, UserResponse
from utils.helpers import create_access_token, hash_password, require_user, verify_password
from utils.rate_limiter import SlidingWindowRateLimiter

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Rate limiters: 3 registers/min, 5 logins/min
register_limiter = SlidingWindowRateLimiter(limit=3, window=60)
login_limiter = SlidingWindowRateLimiter(limit=5, window=60)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(register_limiter)])
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token, dependencies=[Depends(login_limiter)])
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(require_user)):
    return user
