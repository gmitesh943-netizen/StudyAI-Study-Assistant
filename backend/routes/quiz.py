import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import Quiz, User
from models.schemas import QuizRequest, QuizResponse
from services.ai_service import ai_service
from utils.helpers import require_user

router = APIRouter(prefix="/api/ai", tags=["AI Quiz"])


@router.post("/quiz", response_model=QuizResponse)
def generate_quiz(
    payload: QuizRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    questions = ai_service.quiz(payload.topic, payload.count)

    quiz_record = Quiz(
        user_id=user.id,
        topic=payload.topic,
        questions_json=json.dumps([q.model_dump() for q in questions]),
    )
    db.add(quiz_record)
    db.commit()

    return QuizResponse(questions=questions)
