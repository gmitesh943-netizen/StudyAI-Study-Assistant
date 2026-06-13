from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(min_length=3, max_length=100)
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool
    subscription_tier: str
    tokens_used: int
    token_limit: int
    cooldown_until: Optional[datetime] = None
    is_banned: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── AI Requests ───────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    subject: str = "General"
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    response: str
    tokens_used: Optional[int] = None
    token_limit: Optional[int] = None
    cooldown_until: Optional[datetime] = None



class PDFSummaryRequest(BaseModel):
    text: str = Field(min_length=10)


class PDFSummaryResponse(BaseModel):
    summary: str
    key_points: list[str]
    questions: list[str]


class QuizRequest(BaseModel):
    topic: str = Field(min_length=1)
    count: int = Field(default=5, ge=1, le=20)


class QuizQuestion(BaseModel):
    id: int
    question: str
    options: list[str]
    correct: int
    explanation: str


class QuizResponse(BaseModel):
    questions: list[QuizQuestion]


class FlashcardRequest(BaseModel):
    topic: str = Field(min_length=1)
    count: int = Field(default=10, ge=1, le=50)


class Flashcard(BaseModel):
    id: int
    front: str
    back: str
    subject: str


class FlashcardResponse(BaseModel):
    cards: list[Flashcard]


class NotesRequest(BaseModel):
    topic: str = Field(min_length=1)
    subject: str = "General"


class NotesResponse(BaseModel):
    content: str


class StudyPlanRequest(BaseModel):
    subjects: list[str] = Field(min_length=1)
    hours_per_day: float = Field(default=2.0, ge=0.5, le=16)


class StudyBlock(BaseModel):
    time: str
    subject: str
    task: str
    duration: str


class StudyPlanResponse(BaseModel):
    schedule: list[StudyBlock]


# ── Dashboard & Admin ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    study_hours: float
    quizzes_completed: int
    flashcards_reviewed: int
    notes_created: int
    page_views: int = 0
    active_minutes: float = 0.0


class ProgressItem(BaseModel):
    subject: str
    value: float


class ActivityItem(BaseModel):
    action: str
    time: str
    subject: str


class DashboardResponse(BaseModel):
    stats: DashboardStats
    progress: list[ProgressItem]
    recent_activity: list[ActivityItem]


class FeatureUsageItem(BaseModel):
    feature: str
    views: int
    active_minutes: float


class UserActivityDetail(BaseModel):
    id: int
    username: str
    email: str
    is_admin: bool
    created_at: datetime
    last_active: Optional[datetime] = None
    active_minutes: float
    features_used: list[str] = Field(default_factory=list)
    total_chats: int
    total_quizzes: int


class AnalyticsResponse(BaseModel):
    total_users: int
    active_users: int
    total_chats: int
    total_quizzes: int
    total_views: int = 0
    total_active_minutes: float = 0.0
    feature_usage: list[FeatureUsageItem] = Field(default_factory=list)
    users_activity: list[UserActivityDetail] = Field(default_factory=list)


class UsageTrackRequest(BaseModel):
    path: str = Field(min_length=1, max_length=255)
    feature: str = Field(min_length=1, max_length=100)
    event_type: str = Field(default="view", pattern="^(view|heartbeat|leave)$")
    duration_seconds: int = Field(default=0, ge=0, le=3600)


class UsageTrackResponse(BaseModel):
    success: bool


class HealthResponse(BaseModel):
    status: str
    environment: str
    database: str


# ── AI Interview ─────────────────────────────────────────────────────────────

class InterviewQuestion(BaseModel):
    id: int
    question: str


class InterviewGenerateRequest(BaseModel):
    topic: str = Field(min_length=1)
    difficulty: str = Field(default="Intermediate")
    count: int = Field(default=5, ge=1, le=10)


class InterviewGenerateResponse(BaseModel):
    questions: list[InterviewQuestion]


class InterviewEvaluateRequest(BaseModel):
    topic: str
    difficulty: str
    question: str
    answer: str


class InterviewEvaluateResponse(BaseModel):
    score: int = Field(ge=0, le=100)
    feedback: str
    ideal_answer: str


class InterviewSaveRequest(BaseModel):
    topic: str
    difficulty: str
    score: float
    results_json: str


class InterviewSaveResponse(BaseModel):
    success: bool
    interview_id: int


class InterviewHistoryResponse(BaseModel):
    id: int
    topic: str
    difficulty: str
    score: float
    results_json: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Courses ───────────────────────────────────────────────────────────────────

class GoogleResource(BaseModel):
    title: str
    url: str
    type: str  # youtube, classroom, scholar, document


class CourseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    resources: Optional[list[GoogleResource]] = None


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    resources: Optional[list[GoogleResource]] = None


class CourseResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    resources: Optional[list[GoogleResource]] = None
    is_published: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CoursesListResponse(BaseModel):
    courses: list[CourseResponse]
    total: int
