import os

from dotenv import load_dotenv

from ai.gemini_service import GeminiService
from ai.groq_service import GroqService
from ai.openai_service import OpenAIService
from models.schemas import ChatMessage, Flashcard, QuizQuestion, StudyBlock, InterviewQuestion

load_dotenv()


class AIService:
    """Unified AI facade — selects provider based on env config."""

    def __init__(self) -> None:
        self.provider = os.getenv("AI_PROVIDER", "openai").lower()
        self.openai = OpenAIService()
        self.gemini = GeminiService()
        self.groq = GroqService()
        self._active = self._resolve_provider()

    def _resolve_provider(self):
        if self.provider == "groq" and self.groq.is_available:
            return self.groq
        if self.provider == "gemini" and self.gemini.is_available:
            return self.gemini
        if self.openai.is_available:
            return self.openai
        if self.gemini.is_available:
            return self.gemini
        if self.groq.is_available:
            return self.groq
        # No keys — either provider returns dummy responses
        return self.openai

    def chat(self, message: str, subject: str, history: list[ChatMessage] | None = None) -> str:
        return self._active.chat(message, subject, history or [])

    def pdf_summary(self, text: str) -> dict:
        return self._active.pdf_summary(text)

    def quiz(self, topic: str, count: int) -> list[QuizQuestion]:
        return self._active.quiz(topic, count)

    def flashcards(self, topic: str, count: int) -> list[Flashcard]:
        return self._active.flashcards(topic, count)

    def notes(self, topic: str, subject: str) -> str:
        return self._active.notes(topic, subject)

    def study_plan(self, subjects: list[str], hours_per_day: float) -> list[StudyBlock]:
        return self._active.study_plan(subjects, hours_per_day)

    def interview_generate(self, topic: str, difficulty: str, count: int) -> list[InterviewQuestion]:
        return self._active.interview_generate(topic, difficulty, count)

    def interview_evaluate(self, topic: str, difficulty: str, question: str, answer: str) -> dict:
        return self._active.interview_evaluate(topic, difficulty, question, answer)


ai_service = AIService()
