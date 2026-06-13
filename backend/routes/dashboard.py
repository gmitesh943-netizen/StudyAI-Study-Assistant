from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import Chat, Flashcard, Note, Progress, Quiz, UsageEvent, User
from models.schemas import (
    ActivityItem,
    DashboardResponse,
    DashboardStats,
    ProgressItem,
)
from utils.helpers import format_relative_time, require_user

router = APIRouter(prefix="/api", tags=["Dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    study_hours = (
        db.query(func.coalesce(func.sum(Progress.study_hours), 0.0))
        .filter(Progress.user_id == user.id)
        .scalar()
    )
    quizzes_completed = db.query(Quiz).filter(Quiz.user_id == user.id).count()
    flashcards_reviewed = (
        db.query(Flashcard)
        .filter(Flashcard.user_id == user.id, Flashcard.reviewed.is_(True))
        .count()
    )
    notes_created = db.query(Note).filter(Note.user_id == user.id).count()
    page_views = (
        db.query(UsageEvent)
        .filter(UsageEvent.user_id == user.id, UsageEvent.event_type == "view")
        .count()
    )
    active_seconds = (
        db.query(func.coalesce(func.sum(UsageEvent.duration_seconds), 0))
        .filter(UsageEvent.user_id == user.id)
        .scalar()
    )

    progress_rows = db.query(Progress).filter(Progress.user_id == user.id).all()
    progress = [
        ProgressItem(subject=row.subject, value=row.value) for row in progress_rows
    ]

    recent_usage = (
        db.query(UsageEvent)
        .filter(UsageEvent.user_id == user.id)
        .order_by(UsageEvent.created_at.desc())
        .limit(5)
        .all()
    )
    recent_chats = (
        db.query(Chat)
        .filter(Chat.user_id == user.id)
        .order_by(Chat.created_at.desc())
        .limit(5)
        .all()
    )
    recent_activity = [
        ActivityItem(
            action="Viewed" if event.event_type == "view" else "Studied",
            time=format_relative_time(event.created_at),
            subject=(
                f"{event.feature} ({round((event.duration_seconds or 0) / 60, 1)} min)"
                if event.duration_seconds
                else event.feature
            ),
        )
        for event in recent_usage
    ]
    recent_activity.extend([
        ActivityItem(
            action="Chat",
            time=format_relative_time(c.created_at),
            subject=c.subject,
        )
        for c in recent_chats
    ])
    recent_activity = recent_activity[:5]

    return DashboardResponse(
        stats=DashboardStats(
            study_hours=float(study_hours or 0),
            quizzes_completed=quizzes_completed,
            flashcards_reviewed=flashcards_reviewed,
            notes_created=notes_created,
            page_views=page_views,
            active_minutes=round(float(active_seconds or 0) / 60, 1),
        ),
        progress=progress,
        recent_activity=recent_activity,
    )
