import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import StudyPlan, User
from models.schemas import StudyPlanRequest, StudyPlanResponse
from services.ai_service import ai_service
from utils.helpers import require_user

router = APIRouter(prefix="/api/ai", tags=["AI Planner"])


@router.post("/study-plan", response_model=StudyPlanResponse)
def generate_study_plan(
    payload: StudyPlanRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    schedule = ai_service.study_plan(payload.subjects, payload.hours_per_day)

    plan = StudyPlan(
        user_id=user.id,
        subjects_json=json.dumps(payload.subjects),
        hours_per_day=payload.hours_per_day,
        schedule_json=json.dumps([b.model_dump() for b in schedule]),
    )
    db.add(plan)
    db.commit()

    return StudyPlanResponse(schedule=schedule)
