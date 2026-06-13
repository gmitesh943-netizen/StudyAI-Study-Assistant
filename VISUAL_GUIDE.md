# 🗺️ AI Study App - Visual Getting Started Guide

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR LOCAL MACHINE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │                      │      │                      │    │
│  │  FRONTEND (PORT 3000)│      │  BACKEND (PORT 8000) │    │
│  │                      │      │                      │    │
│  │  Next.js 16          │◄────►│  FastAPI             │    │
│  │  React 19            │      │  SQLAlchemy          │    │
│  │  TypeScript          │      │  Python 3.11+        │    │
│  │  Tailwind CSS        │      │                      │    │
│  │                      │      │  /api/courses        │    │
│  │  ✓ Sign In/Sign Up   │      │  /api/auth           │    │
│  │  ✓ Dashboard         │      │  /api/admin          │    │
│  │  ✓ Courses List      │      │  /api/ai/*           │    │
│  │  ✓ Admin Panel       │      │                      │    │
│  │  ✓ AI Features       │      │  SQLite Database     │    │
│  │                      │      │  ai_study_app.db     │    │
│  └──────────────────────┘      └──────────────────────┘    │
│           │                              │                  │
│           └──────────────────┬───────────┘                  │
│                              │                              │
│                       ┌──────▼──────┐                      │
│                       │   DATABASE   │                      │
│                       │  users       │                      │
│                       │  courses     │                      │
│                       │  chats       │                      │
│                       │  quizzes     │                      │
│                       │  notes       │                      │
│                       │  flashcards  │                      │
│                       └──────────────┘                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Flow

```
1. SETUP
   ├─ Run RUN_PROJECT.bat
   ├─ Install Python dependencies
   └─ Install Node.js dependencies

2. START SERVERS
   ├─ Terminal 1: Backend (FastAPI)
   │  └─ http://localhost:8000
   └─ Terminal 2: Frontend (Next.js)
      └─ http://localhost:3000

3. REGISTER & LOGIN
   ├─ Sign Up → Create account
   └─ Sign In → Use credentials

4. BECOME ADMIN
   ├─ Run backend/setup_admin.py
   └─ Answer prompts to make yourself admin

5. CREATE COURSES
   ├─ Go to Dashboard → Admin
   ├─ Click "Manage Courses"
   ├─ Fill course form
   ├─ Add resources (YouTube, docs, etc.)
   └─ Click "Create Course"

6. TEST AS STUDENT
   ├─ Create new account
   ├─ Go to Dashboard → Courses
   ├─ View your published course
   └─ See resources you added
```

---

## 📂 Project Structure

```
AI STUDY APP/
│
├── 📖 Documentation Files
│   ├── README.md                    (Original project docs)
│   ├── QUICK_START.md              (Quick reference)
│   ├── SETUP_GUIDE.md              (Detailed instructions)
│   ├── CHECKLIST.md                (Step-by-step validation)
│   └── PROJECT_SUMMARY.md          (What was built)
│
├── 🚀 Startup Scripts
│   ├── RUN_PROJECT.bat             (Setup everything)
│   ├── backend/START_BACKEND.bat   (Run backend server)
│   └── frontend/START_FRONTEND.bat (Run frontend server)
│
├── backend/ (Python/FastAPI)
│   ├── main.py                     (Entry point)
│   ├── requirements.txt            (Dependencies)
│   ├── .env                        (Configuration)
│   │
│   ├── database/
│   │   ├── init_db.py             (Models: User, Course, etc.)
│   │   └── connection.py          (DB connection setup)
│   │
│   ├── routes/                    (API endpoints)
│   │   ├── auth.py                (Register/Login)
│   │   ├── courses.py  ✨ NEW    (Course management)
│   │   ├── admin.py               (Admin features)
│   │   ├── chat.py                (AI tutor)
│   │   ├── quiz.py                (Quiz generator)
│   │   ├── notes.py               (Notes generator)
│   │   ├── flashcards.py          (Flashcards)
│   │   └── ...
│   │
│   ├── models/
│   │   └── schemas.py             (Validation schemas)
│   │
│   ├── utils/
│   │   └── helpers.py             (Auth, hashing, etc.)
│   │
│   ├── setup_admin.py  ✨ NEW   (Make users admin)
│   ├── ai_study_app.db           (SQLite database)
│   └── venv/                      (Python virtual env)
│
└── frontend/ (Next.js/React)
    ├── package.json              (Dependencies)
    ├── .env.local               (Configuration)
    │
    ├── app/                      (Pages)
    │   ├── page.tsx             (Home page)
    │   ├── sign-in/             (Login page)
    │   ├── sign-up/             (Register page)
    │   └── dashboard/           (Main app)
    │       ├── page.tsx         (Dashboard home)
    │       ├── admin/
    │       │   └── page.tsx     (Admin panel) ✨ UPDATED
    │       ├── courses/
    │       │   └── page.tsx     (Course listing)
    │       ├── ai-tutor/
    │       ├── quiz/
    │       ├── notes/
    │       ├── flashcards/
    │       └── ...
    │
    ├── components/              (Reusable UI)
    │   ├── courses/
    │   │   ├── CourseGrid.tsx   (Display courses) ✨ UPDATED
    │   │   └── CreateCourseForm.tsx ✨ NEW (Create courses)
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   ├── Tabs.tsx  ✨ NEW (Tabbed interface)
    │   │   └── ...
    │   └── ...
    │
    ├── lib/
    │   ├── api.ts  ✨ UPDATED (Course API methods)
    │   └── utils.ts
    │
    ├── hooks/
    │   ├── useAppAuth.ts        (Auth hook)
    │   └── ...
    │
    ├── public/                  (Static assets)
    └── node_modules/            (Dependencies)
```

---

## 🔄 User Flow Diagram

### Student User
```
┌─────────────┐
│  Visitor    │
└──────┬──────┘
       │
       ▼ Click "Sign Up"
┌──────────────────┐
│  Registration    │────────┐
│  • Email         │        │
│  • Username      │        │
│  • Password      │        │
└──────┬───────────┘        │
       │                    │
       ▼ Account Created     │
┌──────────────────┐        │
│  Sign In Page    │◄───────┘
└──────┬───────────┘
       │
       ▼ Login Success
┌──────────────────────────────┐
│  Student Dashboard           │
├──────────────────────────────┤
│ ✓ View Courses               │
│ ✓ Access Resources           │
│ ✓ Use AI Tutor               │
│ ✓ Generate Quizzes           │
│ ✓ Create Flashcards          │
│ ✓ Generate Notes             │
│ ✓ Plan Study Schedule        │
│ ✓ Summarize PDFs             │
│ ✓ View Progress              │
└──────────────────────────────┘
```

### Admin User
```
┌─────────────┐
│  Visitor    │
└──────┬──────┘
       │
       ▼ Sign Up + Become Admin
┌──────────────────┐
│  Sign In         │
└──────┬───────────┘
       │
       ▼ Login as Admin
┌──────────────────────────────┐
│  Admin Dashboard             │
├──────────────────────────────┤
│ ✓ Create Courses             │
│ ✓ Add Resources              │
│ ✓ Manage Courses             │
│ ✓ View Analytics             │
│ ✓ Monitor Users              │
│ ✓ Track Engagement           │
│ + All Student Features       │
└──────────────────────────────┘
```

---

## 📋 Step-by-Step Execution

### Step 1: Install (Run Once)
```
RUN_PROJECT.bat
    ▼
Creates venv (if needed)
    ▼
pip install -r requirements.txt
    ▼
npm install
    ▼
✅ Ready to start!
```

### Step 2: Start Backend
```
Terminal 1:
$ cd backend
$ venv\Scripts\activate.bat
$ python main.py
    ▼
Loading dependencies...
    ▼
Database initialized
    ▼
✅ Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Start Frontend
```
Terminal 2:
$ cd frontend
$ npm run dev
    ▼
Loading dependencies...
    ▼
Building pages...
    ▼
✅ Ready in X ms
   http://localhost:3000
```

### Step 4-6: Use the App
```
Browser → http://localhost:3000
    ▼
Sign Up or Sign In
    ▼
Make yourself Admin (if needed)
    ▼
Create Courses
    ▼
Test as Student
    ▼
✅ Everything Works!
```

---

## 🎯 Key URLs

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Frontend App |
| http://localhost:3000/sign-in | Login Page |
| http://localhost:3000/sign-up | Register Page |
| http://localhost:3000/dashboard | Main Dashboard |
| http://localhost:3000/dashboard/courses | View Courses |
| http://localhost:3000/dashboard/admin | Admin Panel |
| http://localhost:8000 | Backend API (root) |
| http://localhost:8000/docs | API Documentation (Swagger) |
| http://localhost:8000/api/courses | Course API endpoint |

---

## 💾 Database Tables

```
users
├─ id (int, PK)
├─ email (string, unique)
├─ username (string, unique)
├─ hashed_password (string)
├─ is_admin (boolean)         ← Make yourself admin
├─ is_active (boolean)
└─ created_at (datetime)

courses
├─ id (int, PK)
├─ user_id (int, FK)          ← Admin who created it
├─ name (string)              ← Course title
├─ description (text)         ← Course details
├─ category (string)          ← Subject area
├─ resources_json (json)      ← Learning resources
├─ is_published (boolean)
├─ created_at (datetime)
└─ updated_at (datetime)

[chats, quizzes, notes, flashcards, etc...]
```

---

## ⚡ Common Commands

### Python
```bash
# Activate environment
venv\Scripts\activate.bat

# Run Python script
python setup_admin.py

# Start Python shell
python

# Install packages
pip install -r requirements.txt
```

### Node/npm
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

### Database
```bash
# Open SQLite CLI
sqlite3 backend/ai_study_app.db

# View tables
.tables

# Query users
SELECT * FROM users;

# Make user admin
UPDATE users SET is_admin=1 WHERE id=1;
```

---

## ✅ Verification Checklist

```
□ RUN_PROJECT.bat executed successfully
□ Backend server running (Terminal 1)
□ Frontend server running (Terminal 2)
□ Can access http://localhost:3000
□ Can access http://localhost:8000/docs
□ Can sign up new account
□ Can sign in with account
□ Made yourself admin
□ Created a test course
□ Can view course as student
□ All features working
```

---

## 📞 Quick Help

**Q: Backend won't start?**
A: Check if Python is installed, venv is activated, and dependencies installed

**Q: Can't login?**
A: Check database has your user, backend is running, no auth errors in console

**Q: Can't create course?**
A: Verify you're logged in as admin (is_admin=1 in database)

**Q: Course not showing?**
A: Check frontend is logged in as different user, database has course, course is published

**Q: Database locked?**
A: Close SQLite Browser, restart backend

---

**You're all set! 🎉 Start with `RUN_PROJECT.bat` and follow the CHECKLIST.md**
