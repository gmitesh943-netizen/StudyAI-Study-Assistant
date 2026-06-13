from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from database.init_db import Note, User
from models.schemas import NotesRequest, NotesResponse
from services.ai_service import ai_service
from utils.helpers import require_user

router = APIRouter(prefix="/api/ai", tags=["AI Notes"])


@router.post("/notes", response_model=NotesResponse)
def generate_notes(
    payload: NotesRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_user),
):
    content = ai_service.notes(payload.topic, payload.subject)

    note = Note(
        user_id=user.id,
        topic=payload.topic,
        subject=payload.subject,
        content=content,
    )
    db.add(note)
    db.commit()

    return NotesResponse(content=content)
