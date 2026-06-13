import os

from models.schemas import Flashcard, QuizQuestion, StudyBlock, InterviewQuestion


def dummy_chat_response(message: str, subject: str, reason: str | None = None) -> str:
    reason_text = ""
    if reason:
        clean_reason = reason
        for secret in (os.getenv("GEMINI_API_KEY"), os.getenv("OPENAI_API_KEY")):
            if secret:
                clean_reason = clean_reason.replace(secret, "[redacted]")
        reason_text = f"\n\n**Provider issue:** {clean_reason[:500]}"

    msg_lower = message.lower()
    
    # Auto-detect language indices
    is_guj = any(c in message for c in "અઆઇઈઉઊઋએઐઓઔકખગઘઙચછજઝઞટઠડઢણતથદધનપફબભમય૨લવશષસહળ") or any(w in msg_lower for w in ["gujarati", "કેમ", "તમે", "છે", "નમસ્તે", "કેવી", "ખબર"])
    is_hin = any(c in message for c in "अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह") or any(w in msg_lower for w in ["hindi", "है", "हैं", "क्या", "नमस्ते", "कैसे", "बताओ"])

    if is_guj:
        return (
            "હું અત્યારે સાચો AI જવાબ જનરેટ કરી શક્યો નથી કારણ કે AI પ્રોવાઇડર કન્ફિગર કરેલ નથી અથવા પ્રોવાઇડર વિનંતી નિષ્ફળ ગઈ છે.\n\n"
            f"**વિષય:** {subject}\n\n"
            f"**તમારો પ્રશ્ન:** {message[:200]}{'...' if len(message) > 200 else ''}\n\n"
            "કૃપા કરીને તપાસો કે `GEMINI_API_KEY` અથવા `OPENAI_API_KEY` માન્ય છે, પછી બેકએન્ડ ફરી શરૂ કરો. "
            "તે પછી, હું પ્લેસહોલ્ડરને બદલે સંપૂર્ણ ખુલાસા સાથે ગુજરાતીમાં જવાબ આપીશ."
            f"{reason_text}"
        )
    elif is_hin:
        return (
            "मैं अभी वास्तविक AI उत्तर उत्पन्न नहीं कर सका क्योंकि AI प्रदाता कॉन्फ़िगर नहीं है या प्रदाता अनुरोध विफल हो गया है।\n\n"
            f"**विषय:** {subject}\n\n"
            f"**आपका प्रश्न:** {message[:200]}{'...' if len(message) > 200 else ''}\n\n"
            "कृपया जांचें कि `GEMINI_API_KEY` या `OPENAI_API_KEY` मान्य है, फिर बैकएंड को पुनरारंभ करें। "
            "उसके बाद, मैं प्लेसहोल्डर के बजाय पूर्ण स्पष्टीकरण के साथ हिंदी में उत्तर दूंगा।"
            f"{reason_text}"
        )
    
    return (
        "I could not generate a real AI answer right now because the AI provider is not configured "
        "or the provider request failed.\n\n"
        f"**Subject:** {subject}\n\n"
        f"**Your question:** {message[:200]}{'...' if len(message) > 200 else ''}\n\n"
        "Please check that `GEMINI_API_KEY` or `OPENAI_API_KEY` is valid, then restart the backend. "
        "After that, I will answer with a complete explanation instead of a placeholder."
        f"{reason_text}"
    )

    return (
        f"Here's a helpful explanation about **{subject}**:\n\n"
        f"Regarding your question — \"{message[:120]}{'...' if len(message) > 120 else ''}\" — "
        "the key concept involves understanding the underlying principles and applying them "
        "to solve related problems. Break the topic into smaller parts, review core definitions, "
        "and practice with examples.\n\n"
        "*This is a demo response. Add OPENAI_API_KEY or GEMINI_API_KEY for live AI answers.*"
    )


def dummy_pdf_summary(text: str) -> dict:
    preview = text[:200].strip()
    return {
        "summary": (
            f"This document covers key concepts related to the provided material. "
            f"The content begins with: \"{preview}{'...' if len(text) > 200 else ''}\" "
            "and explores foundational ideas, practical applications, and important takeaways."
        ),
        "key_points": [
            "Core concepts are introduced with clear definitions",
            "Examples illustrate practical applications of the theory",
            "Summary sections reinforce the most important ideas",
            "Review questions help assess comprehension",
            "Further reading is suggested for deeper understanding",
        ],
        "questions": [
            "What are the main themes discussed in this document?",
            "How do the key concepts relate to each other?",
            "What practical applications can you identify?",
            "Which section was most challenging and why?",
            "How would you explain this material to someone else?",
        ],
    }


def dummy_quiz(topic: str, count: int) -> list[QuizQuestion]:
    clean_topic = topic.strip() or "the selected topic"
    topic_title = clean_topic.title()
    templates = [
        {
            "question": f"What is the main purpose of {clean_topic}?",
            "options": [
                f"To explain the core process or idea behind {clean_topic}",
                "To list unrelated historical dates",
                "To replace every other subject area",
                "To avoid practical examples",
            ],
            "correct": 0,
            "explanation": f"The correct answer focuses on the central idea of {clean_topic}.",
        },
        {
            "question": f"Which approach is best when studying {clean_topic}?",
            "options": [
                "Memorize random facts without context",
                f"Break {clean_topic} into definitions, steps, and examples",
                "Skip prerequisites and only read summaries",
                "Use only one source and never practice",
            ],
            "correct": 1,
            "explanation": f"Learning {clean_topic} works best when concepts are connected to examples.",
        },
        {
            "question": f"What should a strong answer about {clean_topic} include?",
            "options": [
                "Only a one-word definition",
                "Only an unrelated diagram",
                f"A definition, key mechanism, and example related to {clean_topic}",
                "No reasoning or explanation",
            ],
            "correct": 2,
            "explanation": f"A complete answer explains what {clean_topic} is, how it works, and where it applies.",
        },
        {
            "question": f"Why are examples important for understanding {clean_topic}?",
            "options": [
                f"They show how {clean_topic} is applied in real situations",
                "They make the topic less accurate",
                "They remove the need to know definitions",
                "They are useful only for unrelated subjects",
            ],
            "correct": 0,
            "explanation": f"Examples help turn the theory of {clean_topic} into usable knowledge.",
        },
        {
            "question": f"What is a common mistake when learning {clean_topic}?",
            "options": [
                "Connecting definitions with use cases",
                "Practicing with questions",
                f"Studying {clean_topic} as isolated facts without understanding relationships",
                "Reviewing mistakes after a quiz",
            ],
            "correct": 2,
            "explanation": f"{topic_title} becomes clearer when relationships between ideas are understood.",
        },
    ]

    questions = []
    for i in range(1, count + 1):
        template = templates[(i - 1) % len(templates)]
        questions.append(
            QuizQuestion(
                id=i,
                question=template["question"],
                options=template["options"],
                correct=template["correct"],
                explanation=template["explanation"],
            )
        )
    return questions


def dummy_flashcards(topic: str, count: int) -> list[Flashcard]:
    cards = []
    for i in range(1, count + 1):
        cards.append(
            Flashcard(
                id=i,
                front=f"What is concept #{i} in {topic}?",
                back=f"Concept #{i} in {topic} is an important idea that helps you understand the subject deeply.",
                subject=topic,
            )
        )
    return cards


def dummy_notes(topic: str, subject: str) -> str:
    return f"""# {topic}

**Subject:** {subject}

## Overview
{topic} is a fundamental area within {subject}. This note covers the essential concepts you need to know.

## Key Concepts
1. **Definition** — Understanding what {topic} means in the context of {subject}.
2. **Importance** — Why {topic} matters for exams and real-world applications.
3. **Core Principles** — The foundational rules and patterns that govern {topic}.

## Detailed Notes
- Start by reviewing basic terminology related to {topic}.
- Connect new ideas to concepts you already understand in {subject}.
- Practice with examples and self-quiz questions to reinforce learning.

## Summary
Mastering {topic} requires consistent review and active practice. Focus on understanding "why" rather than memorizing "what."

---
*Demo notes — configure an AI API key for personalized content.*
"""


def dummy_study_plan(subjects: list[str], hours_per_day: float) -> list[StudyBlock]:
    blocks_per_subject = max(1, int(hours_per_day / len(subjects)))
    schedule: list[StudyBlock] = []
    start_hour = 9

    for subject in subjects:
        for block_idx in range(blocks_per_subject):
            hour = start_hour + block_idx
            schedule.append(
                StudyBlock(
                    time=f"{hour:02d}:00",
                    subject=subject,
                    task=f"Review and practice {subject} — session {block_idx + 1}",
                    duration="45 min",
                )
            )
        start_hour += blocks_per_subject

    schedule.append(
        StudyBlock(
            time=f"{start_hour:02d}:00",
            subject="Break",
            task="Take a short break and hydrate",
            duration="15 min",
        )
    )
    return schedule


def dummy_interview_questions(topic: str, difficulty: str, count: int) -> list[InterviewQuestion]:
    topic_lower = topic.lower()
    questions = []

    # Preset templates for high-fidelity demo
    react_questions = [
        "Explain the difference between state and props in React.",
        "What are React Hooks, and what rules must you follow when using them?",
        "Explain the virtual DOM and how React uses it to optimize rendering.",
        "What is the purpose of useEffect, and how do you clean up side effects?",
        "How does React's Context API work, and when should you use it instead of Redux?",
    ]

    db_questions = [
        "What is database normalization, and why is it important?",
        "Explain the difference between a primary key, foreign key, and unique key.",
        "What are database indexes, and how do they speed up query performance?",
        "Explain the difference between SQL and NoSQL databases.",
        "What are database transactions, and what does ACID stand for?",
    ]

    general_questions = [
        f"What are the fundamental concepts and definitions related to {topic}?",
        f"How do you implement or apply {topic} in a real-world project or architecture?",
        f"What are some common challenges or performance pitfalls when working with {topic}?",
        f"How does testing and quality assurance work for a system utilizing {topic}?",
        f"Can you compare {topic} to its main alternative technologies or paradigms?",
    ]

    source_pool = general_questions
    if "react" in topic_lower:
        source_pool = react_questions
    elif "db" in topic_lower or "database" in topic_lower or "sql" in topic_lower:
        source_pool = db_questions

    for i in range(1, count + 1):
        question_text = source_pool[(i - 1) % len(source_pool)]
        if source_pool == general_questions and i > 2:
            question_text = f"Describe a complex project where you had to debug or optimize {topic}. What was your strategy?"

        questions.append(
            InterviewQuestion(
                id=i,
                question=f"{question_text} [Difficulty: {difficulty}]"
            )
        )
    return questions


def dummy_interview_evaluation(topic: str, difficulty: str, question: str, answer: str) -> dict:
    word_count = len(answer.strip().split())
    
    if word_count < 5:
        score = 25
        feedback = "Your answer is extremely brief. A professional interview answer should explain 'why' and 'how', defining terms clearly and providing examples. Please write a more detailed explanation."
        ideal_answer = f"A solid answer for '{question}' should explain the core mechanism, its relevance to {topic}, and give a brief technical example of its usage."
    elif word_count < 15:
        score = 55
        feedback = "You have the right basic concept, but your response lacks depth. Try to structure your answer by defining the terms, explaining how it works in practice, and providing a real-world scenario or code snippet."
        ideal_answer = f"For this {difficulty}-level question in {topic}, you should mention the exact API/syntax, discuss potential trade-offs or performance details, and explain how it solves the relevant problem."
    else:
        score = 85
        feedback = "Very good response! You explained the concepts clearly, structured your thoughts well, and used appropriate terminology. To achieve a perfect score, consider adding more detail about edge cases or advanced optimizations."
        ideal_answer = f"An ideal answer for '{question}' would cover the direct definition, standard code implementation or schema design, and discuss optimizations such as memoization or indexing."

    return {
        "score": score,
        "feedback": feedback,
        "ideal_answer": ideal_answer
    }
