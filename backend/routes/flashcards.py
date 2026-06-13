from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import Flashcard as FlashcardModel
from database.init_db import User
from models.schemas import FlashcardRequest, FlashcardResponse
from services.ai_service import ai_service
from utils.helpers import require_user

router = APIRouter(prefix="/api/ai", tags=["AI Flashcards"])


@router.post("/flashcards", response_model=FlashcardResponse)
def generate_flashcards(
    payload: FlashcardRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    cards = ai_service.flashcards(payload.topic, payload.count)

    for card in cards:
        db.add(
            FlashcardModel(
                user_id=user.id,
                front=card.front,
                back=card.back,
                subject=card.subject,
            )
        )
    db.commit()

    return FlashcardResponse(cards=cards)
