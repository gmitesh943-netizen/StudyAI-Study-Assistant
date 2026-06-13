import os
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-to-a-long-random-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
PBKDF2_ITERATIONS = 390_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return "pbkdf2_sha256${}${}${}".format(
        PBKDF2_ITERATIONS,
        base64.b64encode(salt).decode("ascii"),
        base64.b64encode(digest).decode("ascii"),
    )


def verify_password(plain: str, hashed: str) -> bool:
    if hashed.startswith("pbkdf2_sha256$"):
        try:
            _, iterations, salt, expected = hashed.split("$", 3)
            digest = hashlib.pbkdf2_hmac(
                "sha256",
                plain.encode("utf-8"),
                base64.b64decode(salt),
                int(iterations),
            )
            return hmac.compare_digest(base64.b64encode(digest).decode("ascii"), expected)
        except (ValueError, TypeError):
            return False

    try:
        return pwd_context.verify(plain, hashed)
    except (ValueError, TypeError):
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub", 0))
        if not user_id:
            return None
    except (JWTError, ValueError):
        return None
    return db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()


def require_user(user: Optional[User] = Depends(get_current_user)) -> User:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if user.is_banned:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended by the administrator.",
        )
    return user


def require_admin(user: User = Depends(require_user)) -> User:
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


def check_and_consume_tokens(user: User, db: Session, estimated_tokens: int = 100):
    if user.subscription_tier == "ultra":
        return

    # Check if cooldown is active
    if user.cooldown_until and user.cooldown_until > datetime.utcnow():
        wait_seconds = int((user.cooldown_until - datetime.utcnow()).total_seconds())
        wait_mins = max(1, wait_seconds // 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Token limit exceeded. Cooldown active. Please wait {wait_mins} minutes or upgrade to Premium.",
        )
    
    # If cooldown expired, reset tokens
    if user.cooldown_until and user.cooldown_until <= datetime.utcnow():
        user.tokens_used = 0
        user.cooldown_until = None
        db.commit()

    # Check token budget
    if user.tokens_used + estimated_tokens > user.token_limit:
        # Trigger cooldown: 1 hour from now
        user.cooldown_until = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Token limit reached. Cooldown initiated for 1 hour. Upgrade to Premium for higher limits.",
        )

    # Consume tokens
    user.tokens_used += estimated_tokens
    db.commit()


def format_relative_time(dt: datetime) -> str:
    delta = datetime.utcnow() - dt
    minutes = int(delta.total_seconds() / 60)
    if minutes < 1:
        return "just now"
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"
