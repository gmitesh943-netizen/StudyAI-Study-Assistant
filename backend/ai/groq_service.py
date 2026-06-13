import json
import logging
import os
from typing import Optional

from groq import Groq

from ai.dummy_responses import (
    dummy_chat_response,
    dummy_flashcards,
    dummy_notes,
    dummy_pdf_summary,
    dummy_quiz,
    dummy_study_plan,
    dummy_interview_questions,
    dummy_interview_evaluation,
)
from models.schemas import ChatMessage, Flashcard, InterviewQuestion, QuizQuestion, StudyBlock


logger = logging.getLogger(__name__)


def _friendly_provider_error(exc: Exception) -> str:
    text = str(exc)
    lower = text.lower()
    if "rate" in lower or "quota" in lower or "429" in lower:
        return "Groq API free limit is exhausted. Wait for the limit to reset or use another free key."
    if "api key" in lower or "authentication" in lower or "401" in lower:
        return "The Groq API key is missing or invalid."
    return "Groq could not generate a response. Check the backend logs for details."


class GroqService:
    def __init__(self) -> None:
        self.api_key = os.getenv("GROQ_API_KEY", "")
        self.client: Optional[Groq] = Groq(api_key=self.api_key) if self.api_key else None
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
        self._last_error = ""

    @property
    def is_available(self) -> bool:
        return self.client is not None

    def _chat(self, system: str, user: str, history: list[ChatMessage] | None = None) -> str:
        if not self.client:
            return ""
        try:
            self._last_error = ""
            messages = [{"role": "system", "content": system}]
            for item in (history or [])[-10:]:
                if item.role in {"user", "assistant"} and item.content.strip():
                    messages.append({"role": item.role, "content": item.content.strip()[:4000]})
            messages.append({"role": "user", "content": user})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.35,
                max_tokens=1800,
            )
            return response.choices[0].message.content or ""
        except Exception as exc:
            self._last_error = _friendly_provider_error(exc)
            logger.warning("Groq chat generation failed: %s", exc)
            return ""

    def _json_chat(self, system: str, user: str) -> object | None:
        raw = self._chat(system, user)
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        try:
            return json.loads(cleaned)
        except (json.JSONDecodeError, TypeError):
            return None

    def chat(self, message: str, subject: str, history: list[ChatMessage] | None = None) -> str:
        if not self.is_available:
            return dummy_chat_response(message, subject, "The Groq API key is missing.")
        system = (
            f"You are StudyGPT, a friendly, highly skilled multilingual AI tutor helping a student with the subject '{subject}'.\n\n"
            "CRITICAL LANGUAGE RULE:\n"
            "1. You must answer in the EXACT SAME LANGUAGE the student uses to ask their question.\n"
            "2. If the user writes in English, reply in natural, clear English.\n"
            "3. If the user writes in Hindi, reply in natural, conversational Hindi.\n"
            "4. If the user writes in Gujarati, reply in natural, conversational Gujarati.\n"
            "5. If the user uses a mixed language (e.g., Gujarati + English (Gujlish) or Hindi + English (Hinglish)), you MUST match their exact linguistic mixture and conversational style naturally.\n"
            "6. Always auto-detect the user's language automatically and adapt instantly. Never default to English or Gujarati-only when the student is chatting in another tongue.\n"
            "7. Keep your tone natural, encouraging, and clear, acting as an interactive personal tutor.\n\n"
            "RESPONSE FORMAT FOR STUDY QUESTIONS:\n"
            "- A direct, encouraging answer to the question.\n"
            "- A simple, step-by-step conceptual explanation.\n"
            "- One concrete practical example to make the idea clear.\n"
            "- A common pitfall, exam tip, or mistake warning related to the topic.\n\n"
            "FOR GENERAL CHAT OR GREETINGS:\n"
            "- Respond warmly and naturally in the same language/mixed style they greeted you with, and ask what topic they would like help with today.\n\n"
            "Format your reply in clean, well-spaced Markdown. Do not mention demo limitations, API keys, or provider configurations."
        )
        return self._chat(system, message, history) or dummy_chat_response(message, subject, self._last_error)


    def pdf_summary(self, text: str) -> dict:
        if not self.is_available:
            return dummy_pdf_summary(text)
        system = (
            "Summarize the provided text. Return only valid JSON with keys: "
            "summary (string), key_points (array of strings), questions (array of strings)."
        )
        data = self._json_chat(system, text[:8000])
        return data if isinstance(data, dict) else dummy_pdf_summary(text)

    def quiz(self, topic: str, count: int) -> list[QuizQuestion]:
        if not self.is_available:
            return dummy_quiz(topic, count)
        system = (
            f"Generate {count} multiple-choice quiz questions about {topic}. "
            "Return only a valid JSON array with objects: id, question, options, correct, explanation."
        )
        data = self._json_chat(system, f"Topic: {topic}")
        try:
            return [QuizQuestion(**q) for q in data] if isinstance(data, list) else dummy_quiz(topic, count)
        except (TypeError, ValueError):
            return dummy_quiz(topic, count)

    def flashcards(self, topic: str, count: int) -> list[Flashcard]:
        if not self.is_available:
            return dummy_flashcards(topic, count)
        system = f"Generate {count} flashcards for {topic}. Return only a valid JSON array: id, front, back, subject."
        data = self._json_chat(system, f"Topic: {topic}")
        try:
            return [Flashcard(**c) for c in data] if isinstance(data, list) else dummy_flashcards(topic, count)
        except (TypeError, ValueError):
            return dummy_flashcards(topic, count)

    def notes(self, topic: str, subject: str) -> str:
        if not self.is_available:
            return dummy_notes(topic, subject)
        system = (
            f"Create comprehensive study notes about {topic} for {subject}. "
            "Use Markdown headings, bullet points, examples, and a summary."
        )
        return self._chat(system, f"Topic: {topic}, Subject: {subject}") or dummy_notes(topic, subject)

    def study_plan(self, subjects: list[str], hours_per_day: float) -> list[StudyBlock]:
        if not self.is_available:
            return dummy_study_plan(subjects, hours_per_day)
        system = (
            f"Create a daily study schedule for subjects: {', '.join(subjects)}. "
            f"Total available hours: {hours_per_day}. Return only valid JSON array: time, subject, task, duration."
        )
        data = self._json_chat(system, "Generate the schedule.")
        try:
            return [StudyBlock(**b) for b in data] if isinstance(data, list) else dummy_study_plan(subjects, hours_per_day)
        except (TypeError, ValueError):
            return dummy_study_plan(subjects, hours_per_day)

    def interview_generate(self, topic: str, difficulty: str, count: int) -> list[InterviewQuestion]:
        if not self.is_available:
            return dummy_interview_questions(topic, difficulty, count)
        system = (
            f"Generate {count} technical interview questions about {topic} at {difficulty} difficulty. "
            "Return only a valid JSON array of objects with id and question."
        )
        data = self._json_chat(system, f"Topic: {topic}, Difficulty: {difficulty}, Count: {count}")
        try:
            return [InterviewQuestion(**q) for q in data] if isinstance(data, list) else dummy_interview_questions(topic, difficulty, count)
        except (TypeError, ValueError):
            return dummy_interview_questions(topic, difficulty, count)

    def interview_evaluate(self, topic: str, difficulty: str, question: str, answer: str) -> dict:
        if not self.is_available:
            return dummy_interview_evaluation(topic, difficulty, question, answer)
        system = (
            "Evaluate the user's oral interview answer. Return only valid JSON with score, feedback, ideal_answer."
        )
        data = self._json_chat(
            system,
            f"Topic: {topic}\nDifficulty: {difficulty}\nQuestion: {question}\nUser Answer: {answer}",
        )
        return data if isinstance(data, dict) else dummy_interview_evaluation(topic, difficulty, question, answer)
