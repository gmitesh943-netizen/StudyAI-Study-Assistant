from fastapi import APIRouter, Depends

from database.init_db import User
from models.schemas import PDFSummaryRequest, PDFSummaryResponse
from services.ai_service import ai_service
from utils.helpers import require_user

router = APIRouter(prefix="/api/ai", tags=["AI PDF"])


@router.post("/pdf-summary", response_model=PDFSummaryResponse)
def pdf_summary(
    payload: PDFSummaryRequest,
    _user: User = Depends(require_user),
):
    result = ai_service.pdf_summary(payload.text)
    return PDFSummaryResponse(**result)
