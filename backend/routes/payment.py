from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.connection import get_db
from database.init_db import User, Transaction
from utils.helpers import require_user, require_admin
from utils.rate_limiter import SlidingWindowRateLimiter

router = APIRouter(prefix="/api/payment", tags=["Payment"])

# Limit payment transactions to max 3 requests per minute per IP
payment_limiter = SlidingWindowRateLimiter(limit=3, window=60)

# ── Schemas ───────────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    tier: str  # pro, ultra
    payment_method: str  # stripe, razorpay
    card_number: Optional[str] = None
    cvv: Optional[str] = None

class RechargeRequest(BaseModel):
    tokens: int  # 1000, 5000
    amount: float  # e.g., 2.99, 9.99
    payment_method: str  # stripe, razorpay
    card_number: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    username: str
    amount: float
    currency: str
    payment_method: str
    status: str
    transaction_type: str
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class RevenueSummary(BaseModel):
    total_revenue: float
    stripe_revenue: float
    razorpay_revenue: float
    transaction_count: int
    recharge_count: int
    subscription_count: int
    recent_transactions: list[TransactionResponse]

# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/checkout", dependencies=[Depends(payment_limiter)])
def checkout(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user)
):
    """Processes a subscription purchase. Simulates Stripe/Razorpay direct integration."""
    if payload.tier not in ("pro", "ultra"):
        raise HTTPException(status_code=400, detail="Invalid subscription tier. Must be pro or ultra.")

    price = 9.99 if payload.tier == "pro" else 29.99
    
    # Save the transaction
    transaction = Transaction(
        user_id=user.id,
        amount=price,
        currency="USD",
        payment_method=payload.payment_method,
        status="success",
        transaction_type="subscription_upgrade",
        details=f"Upgraded to {payload.tier.upper()} Plan"
    )
    db.add(transaction)

    # Update user plan
    user.subscription_tier = payload.tier
    user.token_limit = 5000 if payload.tier == "pro" else 999999
    user.tokens_used = 0
    user.cooldown_until = None
    
    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": f"Successfully purchased {payload.tier.upper()} subscription!",
        "tier": user.subscription_tier,
        "token_limit": user.token_limit
    }


@router.post("/recharge", dependencies=[Depends(payment_limiter)])
def recharge(
    payload: RechargeRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user)
):
    """Recharges user tokens. Simulates Stripe/Razorpay token purchase."""
    if payload.tokens <= 0:
        raise HTTPException(status_code=400, detail="Invalid token recharge amount.")

    # Save transaction
    transaction = Transaction(
        user_id=user.id,
        amount=payload.amount,
        currency="USD",
        payment_method=payload.payment_method,
        status="success",
        transaction_type="token_recharge",
        details=f"Recharged +{payload.tokens} AI Tokens"
    )
    db.add(transaction)

    # Reset token usage and increase limit
    user.token_limit += payload.tokens
    user.tokens_used = 0  # Grant immediate fresh start
    user.cooldown_until = None  # Remove any active cooldowns

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": f"Successfully recharged +{payload.tokens} AI Tokens!",
        "tokens_used": user.tokens_used,
        "token_limit": user.token_limit
    }


@router.get("/revenue", response_model=RevenueSummary)
def get_revenue_summary(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin)
):
    """Retrieves high-level revenue analytics for the administrator."""
    # Sum of all successful transaction amounts
    total_rev = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(Transaction.status == "success").scalar()
    
    stripe_rev = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.status == "success",
        Transaction.payment_method == "stripe"
    ).scalar()
    
    razorpay_rev = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(
        Transaction.status == "success",
        Transaction.payment_method == "razorpay"
    ).scalar()

    tx_count = db.query(Transaction).count()
    
    recharge_cnt = db.query(Transaction).filter(
        Transaction.transaction_type == "token_recharge"
    ).count()
    
    sub_cnt = db.query(Transaction).filter(
        Transaction.transaction_type == "subscription_upgrade"
    ).count()

    # Get recent transactions with username
    recent_txs = db.query(Transaction).order_by(Transaction.created_at.desc()).limit(10).all()
    
    formatted_txs = []
    for tx in recent_txs:
        # Fetch username for display
        tx_user = db.query(User).filter(User.id == tx.user_id).first()
        username = tx_user.username if tx_user else "Unknown User"
        formatted_txs.append(
            TransactionResponse(
                id=tx.id,
                user_id=tx.user_id,
                username=username,
                amount=tx.amount,
                currency=tx.currency,
                payment_method=tx.payment_method,
                status=tx.status,
                transaction_type=tx.transaction_type,
                details=tx.details,
                created_at=tx.created_at
            )
        )

    return RevenueSummary(
        total_revenue=float(total_rev),
        stripe_revenue=float(stripe_rev),
        razorpay_revenue=float(razorpay_rev),
        transaction_count=tx_count,
        recharge_count=recharge_cnt,
        subscription_count=sub_cnt,
        recent_transactions=formatted_txs
    )
