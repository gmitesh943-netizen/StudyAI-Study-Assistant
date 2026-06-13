from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import Chat, Quiz, UsageEvent, User
from models.schemas import AnalyticsResponse, FeatureUsageItem, UserActivityDetail
from utils.helpers import require_admin
from utils.metrics_collector import metrics_collector

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class UserManagementItem(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    is_banned: bool
    subscription_tier: str
    tokens_used: int
    token_limit: int
    cooldown_until: Optional[datetime] = None
    created_at: datetime
    last_active: Optional[datetime] = None
    active_minutes: float
    total_chats: int
    total_quizzes: int

    model_config = {"from_attributes": True}


class UsersListResponse(BaseModel):
    users: list[UserManagementItem]
    total: int
    free_count: int
    pro_count: int
    ultra_count: int
    banned_count: int


class SubscriptionUpdateRequest(BaseModel):
    tier: str  # free, pro, ultra


class TokenUpdateRequest(BaseModel):
    tokens_used: int
    token_limit: int


class AdminDashboardSummary(BaseModel):
    total_users: int
    active_users: int
    free_users: int
    pro_users: int
    ultra_users: int
    banned_users: int
    total_chats: int
    total_quizzes: int
    total_active_minutes: float
    feature_usage: list[FeatureUsageItem]
    daily_activity: list[dict]
    users_activity: list[UserActivityDetail]


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    total_users = db.query(User).count()
    week_ago = datetime.utcnow() - timedelta(days=7)
    active_users = (
        db.query(User)
        .join(UsageEvent, UsageEvent.user_id == User.id)
        .filter(UsageEvent.created_at >= week_ago)
        .distinct()
        .count()
    )
    total_chats = db.query(Chat).count()
    total_quizzes = db.query(Quiz).count()
    total_views = db.query(UsageEvent).filter(UsageEvent.event_type == "view").count()
    total_active_seconds = db.query(func.coalesce(func.sum(UsageEvent.duration_seconds), 0)).scalar()

    usage_rows = (
        db.query(
            UsageEvent.feature,
            func.sum(case((UsageEvent.event_type == "view", 1), else_=0)).label("views"),
            func.coalesce(func.sum(UsageEvent.duration_seconds), 0).label("seconds"),
        )
        .group_by(UsageEvent.feature)
        .order_by(func.coalesce(func.sum(UsageEvent.duration_seconds), 0).desc())
        .limit(8)
        .all()
    )

    users_db = db.query(User).all()
    users_activity_list = []
    for u in users_db:
        sec_sum = db.query(func.coalesce(func.sum(UsageEvent.duration_seconds), 0)).filter(UsageEvent.user_id == u.id).scalar() or 0
        active_mins = round(float(sec_sum) / 60, 1)
        feats = [row[0] for row in db.query(UsageEvent.feature).filter(UsageEvent.user_id == u.id).distinct().all()]
        last_act = db.query(func.max(UsageEvent.created_at)).filter(UsageEvent.user_id == u.id).scalar()
        chats_cnt = db.query(Chat).filter(Chat.user_id == u.id).count()
        quizzes_cnt = db.query(Quiz).filter(Quiz.user_id == u.id).count()

        users_activity_list.append(
            UserActivityDetail(
                id=u.id,
                username=u.username,
                email=u.email,
                is_admin=u.is_admin,
                created_at=u.created_at,
                last_active=last_act,
                active_minutes=active_mins,
                features_used=feats,
                total_chats=chats_cnt,
                total_quizzes=quizzes_cnt,
            )
        )

    return AnalyticsResponse(
        total_users=total_users,
        active_users=active_users,
        total_chats=total_chats,
        total_quizzes=total_quizzes,
        total_views=total_views,
        total_active_minutes=round(float(total_active_seconds or 0) / 60, 1),
        feature_usage=[
            FeatureUsageItem(
                feature=row.feature,
                views=int(row.views or 0),
                active_minutes=round(float(row.seconds or 0) / 60, 1),
            )
            for row in usage_rows
        ],
        users_activity=users_activity_list,
    )


@router.get("/dashboard", response_model=AdminDashboardSummary)
def get_admin_dashboard(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    week_ago = datetime.utcnow() - timedelta(days=7)

    total_users = db.query(User).count()
    active_users = (
        db.query(User)
        .join(UsageEvent, UsageEvent.user_id == User.id)
        .filter(UsageEvent.created_at >= week_ago)
        .distinct()
        .count()
    )
    free_users = db.query(User).filter(User.subscription_tier == "free").count()
    pro_users = db.query(User).filter(User.subscription_tier == "pro").count()
    ultra_users = db.query(User).filter(User.subscription_tier == "ultra").count()
    banned_users = db.query(User).filter(User.is_banned.is_(True)).count()
    total_chats = db.query(Chat).count()
    total_quizzes = db.query(Quiz).count()
    total_active_seconds = db.query(func.coalesce(func.sum(UsageEvent.duration_seconds), 0)).scalar() or 0

    usage_rows = (
        db.query(
            UsageEvent.feature,
            func.sum(case((UsageEvent.event_type == "view", 1), else_=0)).label("views"),
            func.coalesce(func.sum(UsageEvent.duration_seconds), 0).label("seconds"),
        )
        .group_by(UsageEvent.feature)
        .order_by(func.coalesce(func.sum(UsageEvent.duration_seconds), 0).desc())
        .limit(8)
        .all()
    )

    # Daily activity for the last 7 days
    daily_activity = []
    for i in range(6, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        day_events = db.query(func.count(UsageEvent.id)).filter(
            UsageEvent.created_at >= day_start,
            UsageEvent.created_at < day_end,
        ).scalar() or 0
        day_users = db.query(func.count(func.distinct(UsageEvent.user_id))).filter(
            UsageEvent.created_at >= day_start,
            UsageEvent.created_at < day_end,
        ).scalar() or 0
        daily_activity.append({
            "date": day_start.strftime("%a"),
            "events": day_events,
            "users": day_users,
        })

    users_db = db.query(User).all()
    users_activity_list = []
    for u in users_db:
        sec_sum = db.query(func.coalesce(func.sum(UsageEvent.duration_seconds), 0)).filter(UsageEvent.user_id == u.id).scalar() or 0
        active_mins = round(float(sec_sum) / 60, 1)
        feats = [row[0] for row in db.query(UsageEvent.feature).filter(UsageEvent.user_id == u.id).distinct().all()]
        last_act = db.query(func.max(UsageEvent.created_at)).filter(UsageEvent.user_id == u.id).scalar()
        chats_cnt = db.query(Chat).filter(Chat.user_id == u.id).count()
        quizzes_cnt = db.query(Quiz).filter(Quiz.user_id == u.id).count()
        users_activity_list.append(
            UserActivityDetail(
                id=u.id,
                username=u.username,
                email=u.email,
                is_admin=u.is_admin,
                created_at=u.created_at,
                last_active=last_act,
                active_minutes=active_mins,
                features_used=feats,
                total_chats=chats_cnt,
                total_quizzes=quizzes_cnt,
            )
        )

    return AdminDashboardSummary(
        total_users=total_users,
        active_users=active_users,
        free_users=free_users,
        pro_users=pro_users,
        ultra_users=ultra_users,
        banned_users=banned_users,
        total_chats=total_chats,
        total_quizzes=total_quizzes,
        total_active_minutes=round(float(total_active_seconds) / 60, 1),
        feature_usage=[
            FeatureUsageItem(
                feature=row.feature,
                views=int(row.views or 0),
                active_minutes=round(float(row.seconds or 0) / 60, 1),
            )
            for row in usage_rows
        ],
        daily_activity=daily_activity,
        users_activity=users_activity_list,
    )


@router.get("/users", response_model=UsersListResponse)
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    users_db = db.query(User).order_by(User.created_at.desc()).all()
    users_list = []
    for u in users_db:
        sec_sum = db.query(func.coalesce(func.sum(UsageEvent.duration_seconds), 0)).filter(UsageEvent.user_id == u.id).scalar() or 0
        active_mins = round(float(sec_sum) / 60, 1)
        last_act = db.query(func.max(UsageEvent.created_at)).filter(UsageEvent.user_id == u.id).scalar()
        chats_cnt = db.query(Chat).filter(Chat.user_id == u.id).count()
        quizzes_cnt = db.query(Quiz).filter(Quiz.user_id == u.id).count()
        users_list.append(
            UserManagementItem(
                id=u.id,
                username=u.username,
                email=u.email,
                is_admin=u.is_admin,
                is_banned=u.is_banned,
                subscription_tier=u.subscription_tier,
                tokens_used=u.tokens_used,
                token_limit=u.token_limit,
                cooldown_until=u.cooldown_until,
                created_at=u.created_at,
                last_active=last_act,
                active_minutes=active_mins,
                total_chats=chats_cnt,
                total_quizzes=quizzes_cnt,
            )
        )

    return UsersListResponse(
        users=users_list,
        total=len(users_list),
        free_count=sum(1 for u in users_db if u.subscription_tier == "free"),
        pro_count=sum(1 for u in users_db if u.subscription_tier == "pro"),
        ultra_count=sum(1 for u in users_db if u.subscription_tier == "ultra"),
        banned_count=sum(1 for u in users_db if u.is_banned),
    )


@router.post("/users/{user_id}/ban")
def ban_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_banned = True
    db.commit()
    return {"success": True, "message": f"User {user.username} has been banned"}


@router.post("/users/{user_id}/unban")
def unban_user(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_banned = False
    db.commit()
    return {"success": True, "message": f"User {user.username} has been unbanned"}


@router.put("/users/{user_id}/subscription")
def update_subscription(
    user_id: int,
    payload: SubscriptionUpdateRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    if payload.tier not in ("free", "pro", "ultra"):
        raise HTTPException(status_code=400, detail="Invalid tier. Must be free, pro, or ultra")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.subscription_tier = payload.tier
    # Set token limits based on tier
    tier_limits = {"free": 1000, "pro": 5000, "ultra": 999999}
    user.token_limit = tier_limits[payload.tier]
    # Reset usage and cooldown when upgrading
    if payload.tier != "free":
        user.tokens_used = 0
        user.cooldown_until = None
    db.commit()
    return {"success": True, "message": f"User {user.username} subscription updated to {payload.tier}"}


@router.put("/users/{user_id}/tokens")
def update_user_tokens(
    user_id: int,
    payload: TokenUpdateRequest,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.tokens_used = payload.tokens_used
    user.token_limit = payload.token_limit
    user.cooldown_until = None
    db.commit()
    return {"success": True, "message": f"Tokens updated for user {user.username}"}


@router.post("/users/{user_id}/reset-tokens")
def reset_user_tokens(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.tokens_used = 0
    user.cooldown_until = None
    db.commit()
    return {"success": True, "message": f"Tokens reset for user {user.username}"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"success": True, "message": f"User {user.username} deleted"}


@router.get("/metrics")
def get_metrics(
    _admin: User = Depends(require_admin),
):
    """Retrieves dynamic API performance and telemetry metrics."""
    return metrics_collector.get_summary()
