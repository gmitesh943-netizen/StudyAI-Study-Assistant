from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import Chat, User
from models.schemas import ChatRequest, ChatResponse
from services.ai_service import ai_service
from utils.helpers import require_user, check_and_consume_tokens

router = APIRouter(prefix="/api/ai", tags=["AI Chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    # Dynamically estimate tokens based on message length (min 25, max 200)
    estimated = max(25, min(200, len(payload.message) // 4 + 10))
    check_and_consume_tokens(user, db, estimated_tokens=estimated)
    
    response_text = ai_service.chat(payload.message, payload.subject, payload.history)

    # Estimate response cost too (based on response length)
    response_cost = max(10, min(150, len(response_text) // 6))
    # Only consume extra if still within limit
    if user.subscription_tier != "ultra":
        remaining = user.token_limit - user.tokens_used
        extra = min(response_cost, remaining)
        if extra > 0:
            user.tokens_used += extra
            db.commit()

    chat_record = Chat(
        user_id=user.id,
        subject=payload.subject,
        message=payload.message,
        response=response_text,
    )
    db.add(chat_record)
    db.commit()
    db.refresh(user)

    return ChatResponse(
        response=response_text,
        tokens_used=user.tokens_used,
        token_limit=user.token_limit,
        cooldown_until=user.cooldown_until,
    )
