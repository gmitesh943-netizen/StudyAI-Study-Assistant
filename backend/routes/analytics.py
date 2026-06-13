from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import UsageEvent, User
from models.schemas import UsageTrackRequest, UsageTrackResponse
from utils.helpers import require_user

router = APIRouter(prefix="/api/analytics", tags=["Usage Analytics"])


@router.post("/track", response_model=UsageTrackResponse)
def track_usage(
    payload: UsageTrackRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    event = UsageEvent(
        user_id=user.id,
        path=payload.path,
        feature=payload.feature,
        event_type=payload.event_type,
        duration_seconds=payload.duration_seconds if payload.event_type != "view" else 0,
    )
    db.add(event)
    db.commit()

    return UsageTrackResponse(success=True)
