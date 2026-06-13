"""Central API router aggregation."""

from fastapi import APIRouter

from routes import (
    admin,
    analytics,
    auth,
    chat,
    courses,
    dashboard,
    flashcards,
    notes,
    pdf,
    planner,
    quiz,
    payment,
)

api_router = APIRouter()
api_router.include_router(analytics.router)
api_router.include_router(auth.router)
api_router.include_router(chat.router)
api_router.include_router(pdf.router)
api_router.include_router(quiz.router)
api_router.include_router(flashcards.router)
api_router.include_router(notes.router)
api_router.include_router(planner.router)
api_router.include_router(courses.router)
api_router.include_router(dashboard.router)
api_router.include_router(admin.router)
api_router.include_router(payment.router)

