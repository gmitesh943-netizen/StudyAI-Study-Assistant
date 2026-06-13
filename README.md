# StudyAI — AI-Powered Online Study Assistant

A premium full-stack EdTech SaaS platform combining ChatGPT-style AI tutoring with modern study tools. Built with Next.js, FastAPI, PostgreSQL, and Clerk Authentication.

![Theme](https://img.shields.io/badge/theme-white%20%2B%20red%20%2B%20black-ef4444)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688)

## Features

| Feature | Description |
|---------|-------------|
| **AI Chat Tutor** | ChatGPT-like interface with markdown, code blocks, subject selection |
| **PDF Summary** | Upload PDFs, extract text, generate summaries & key points |
| **Quiz Generator** | AI MCQ quizzes with timer, scoring, explanations |
| **Flashcards** | AI-generated cards with flip animation |
| **Study Planner** | AI-generated daily timetables & task management |
| **Notes Generator** | Subject-wise AI notes with rich formatting |
| **Courses** | Course cards with progress tracking |
| **Voice Assistant** | Future-ready voice UI component |
| **Admin Panel** | User management & analytics dashboard |
| **Dark Mode** | Full light/dark theme support |

## Tech Stack

**Frontend:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Clerk Auth

**Backend:** FastAPI · SQLAlchemy · PostgreSQL · OpenAI & Gemini APIs

**Hosting:** Vercel (frontend) · Railway (backend + database)

## Project Structure

```
AI STUDY APP/
├── frontend/          # Next.js app
│   ├── app/           # Pages & routes
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # API client & utilities
│   └── public/        # Static assets
├── backend/           # FastAPI server
│   ├── routes/        # API endpoints
│   ├── ai/            # OpenAI & Gemini services
│   ├── database/      # DB connection & models
│   └── services/      # Business logic
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (local or Railway)
- [Clerk](https://clerk.com) account (free tier)
- Optional: OpenAI or Gemini API key

### 1. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_study_app
SECRET_KEY=your-long-random-secret
OPENAI_API_KEY=sk-...        # optional
GEMINI_API_KEY=...           # optional
```

```bash
python -m database.init_db
uvicorn main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Clerk Setup (Google Login)

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Paste keys into `.env.local`
3. Enable **Google** under **User & Authentication → Social Connections**
4. Add `http://localhost:3000` to allowed origins

## Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in path (default: `/sign-in`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after login (default: `/dashboard`) |

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `GEMINI_API_KEY` | Google Gemini API key (optional) |
| `AI_PROVIDER` | `openai` or `gemini` (default: `openai`) |
| `PORT` | Server port (Railway sets automatically) |
| `CORS_ORIGINS` | Allowed frontend origins |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/api/ai/chat` | AI tutor chat |
| POST | `/api/ai/pdf-summary` | PDF summarization |
| POST | `/api/ai/quiz` | Generate quiz |
| POST | `/api/ai/flashcards` | Generate flashcards |
| POST | `/api/ai/notes` | Generate notes |
| POST | `/api/ai/study-plan` | Generate study plan |
| GET | `/api/dashboard` | Dashboard stats |
| GET | `/api/admin/analytics` | Admin analytics |

> Without API keys, the backend returns realistic dummy AI responses automatically.

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variables from `.env.example`
5. Deploy

### Backend → Railway

1. Create a new project on [Railway](https://railway.app)
2. Add PostgreSQL plugin
3. Deploy from `backend/` directory
4. Set `DATABASE_URL`, `SECRET_KEY`, and AI keys
5. Update `NEXT_PUBLIC_API_URL` in Vercel to Railway URL

## Pages

**Public:** Home · About · Features · Pricing · Contact · Sign In · Sign Up

**Dashboard:** Overview · AI Tutor · Quiz · Notes · Flashcards · Planner · PDF · Courses · Voice · Settings · Admin

## Design System

| Token | Value |
|-------|-------|
| Primary Red | `#ef4444` |
| Black | `#0a0a0a` |
| White | `#ffffff` |
| Dark BG | `#111111` |

Glassmorphism cards · Framer Motion animations · Mobile-first responsive layout

## License

MIT
