# 🚀 AI Study App - Quick Start Guide

Welcome! This guide will help you run the AI Study App locally with user/admin authentication, course management, and Google resource integration.

## ⚡ Quick Start (30 Seconds)

### Step 1: Install & Setup (First Time Only)
```bash
# Run the setup script
RUN_PROJECT.bat
```

This will:
- ✅ Create Python virtual environment
- ✅ Install backend dependencies
- ✅ Install frontend dependencies

### Step 2: Start the Servers
Open **2 Command Prompts/Terminals**:

**Terminal 1 - Backend:**
```bash
cd backend
venv\Scripts\activate.bat
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 3: Open in Browser
- **App:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

---

## 👥 User Login & Registration

### 1. Create Account (Sign Up)
1. Go to http://localhost:3000
2. Click **"Sign Up"**
3. Enter: Email, Username, Password
4. Click **"Create Account"**

### 2. Login
1. Click **"Sign In"**
2. Enter your email and password
3. Click **"Sign In"**

### 3. Make Yourself an Admin
**Using Command Line (Easy):**

Open Python shell in backend folder:
```bash
cd backend
venv\Scripts\activate.bat
python
```

Then in Python:
```python
from database.connection import SessionLocal
from database.init_db import User

db = SessionLocal()
user = db.query(User).filter(User.email == "your-email@example.com").first()
if user:
    user.is_admin = True
    db.commit()
    print(f"✓ {user.username} is now an admin!")
db.close()
```

Or use **SQLite Browser** (GUI tool):
1. Download: https://sqlitebrowser.org/dl/
2. Open: `backend/ai_study_app.db`
3. Go to **Browse Data** → **users**
4. Set `is_admin` to `1` for your user

---

## 📚 Features Overview

### For Students
After login:
- ✅ View all available courses
- ✅ Access course resources (YouTube, docs, etc.)
- ✅ Use AI Tutor for help
- ✅ Create quizzes and flashcards
- ✅ Track progress

### For Admins
After login + admin setup:
1. Go to **Dashboard** → **Admin**
2. Click **"Manage Courses"** tab
3. **Create Course:**
   - Name: Course title
   - Description: What it covers
   - Category: Subject area
   - Resources: Add YouTube links, docs, etc.
4. Students instantly see your course!

---

## 🎓 Create Your First Course (Admin)

### Via UI (Easiest):
1. Login as Admin
2. Go to **Dashboard** → **Admin**
3. Click **"Manage Courses"** tab
4. Fill the form:
   ```
   Name: Python Basics
   Description: Learn Python programming fundamentals
   Category: Programming
   
   Add Resources:
   - Title: Python Official Docs
     URL: https://docs.python.org/
     Type: documentation
   
   - Title: Python Tutorial
     URL: https://www.youtube.com/...
     Type: youtube
   ```
5. Click **"Create Course"** ✨

### Via API:
```bash
POST http://localhost:8000/api/courses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Python Basics",
  "description": "Learn Python from scratch",
  "category": "Programming",
  "resources": [
    {
      "title": "Official Documentation",
      "url": "https://docs.python.org/",
      "type": "documentation"
    }
  ]
}
```

---

## 🌍 Supported Resource Types

When adding course resources, choose from:

| Type | Example |
|------|---------|
| **youtube** | Video tutorials, lectures |
| **documentation** | Official guides, API docs |
| **scholar** | Research papers, academic |
| **classroom** | Google Classroom links |

---

## 🗄️ Database

- **Location:** `backend/ai_study_app.db`
- **Type:** SQLite (perfect for local development)
- **Tables:** users, courses, chats, quizzes, notes, etc.

**View Database:**
- GUI: Download SQLite Browser, open the .db file
- Command Line: `sqlite3 backend/ai_study_app.db`

---

## 🔌 API Endpoints

### Courses API

```bash
# List all courses (students & admins)
GET /api/courses?skip=0&limit=10
Authorization: Bearer TOKEN

# Get course details
GET /api/courses/{course_id}
Authorization: Bearer TOKEN

# Create course (admin only)
POST /api/courses
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
{ "name": "...", "description": "...", "category": "...", "resources": [...] }

# Update course (admin only, own courses)
PUT /api/courses/{course_id}
Authorization: Bearer ADMIN_TOKEN
{ "name": "...", "description": "..." }

# Delete course (admin only, own courses)
DELETE /api/courses/{course_id}
Authorization: Bearer ADMIN_TOKEN
```

### Auth API

```bash
# Register
POST /api/auth/register
{ "email": "user@example.com", "username": "user", "password": "pass123" }

# Login
POST /api/auth/login
{ "email": "user@example.com", "password": "pass123" }

# Get current user
GET /api/auth/me
Authorization: Bearer TOKEN
```

### Admin API

```bash
# Get analytics (admin only)
GET /api/admin/analytics
Authorization: Bearer ADMIN_TOKEN
```

---

## 🛠️ Troubleshooting

### "Port 8000 is already in use"
```bash
# Find and kill the process
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### "ModuleNotFoundError" in Python
```bash
cd backend
venv\Scripts\activate.bat
pip install -r requirements.txt
```

### "Can't find npm" 
- Install Node.js: https://nodejs.org/

### "Database locked" error
- Close SQLite Browser if open
- Restart backend server

### Frontend won't connect to backend
- Make sure backend runs on port 8000
- Check `NEXT_PUBLIC_API_URL=http://localhost:8000` in `frontend/.env.local`
- Clear browser cache (Ctrl+Shift+Delete)

### Can't login after registering
- Make sure backend is running
- Check browser console for errors (F12)
- Verify email/password in database

---

## 📁 Project Structure

```
AI STUDY APP/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── database/               # Database setup & models
│   ├── routes/
│   │   ├── auth.py            # Login/Register
│   │   ├── courses.py         # Course management
│   │   ├── admin.py           # Admin features
│   │   └── ...
│   ├── ai_study_app.db        # SQLite database
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx           # Home page
│   │   ├── sign-in/           # Login page
│   │   ├── sign-up/           # Register page
│   │   └── dashboard/         # Main app
│   │       ├── courses/       # Course listing
│   │       ├── admin/         # Admin panel
│   │       ├── ai-tutor/
│   │       ├── quiz/
│   │       └── ...
│   ├── components/
│   │   ├── courses/           # Course components
│   │   └── ui/                # Reusable UI components
│   └── package.json
│
├── RUN_PROJECT.bat            # Setup script
├── SETUP_GUIDE.md             # Detailed guide
└── README.md                  # Original docs
```

---

## 🚀 Next Steps

1. ✅ Run the project
2. ✅ Create an account
3. ✅ Make yourself an admin
4. ✅ Create a course
5. ✅ Login as regular user to see it
6. ✅ Explore other features

---

## 📞 Need Help?

- Check the **SETUP_GUIDE.md** for detailed instructions
- Review logs in the terminal where server is running
- Check browser console (F12) for client-side errors
- Check database with SQLite Browser

---

## 🎉 That's it!

Your AI Study App is ready. Happy learning! 🚀

---

**Key Tech Stack:**
- Backend: FastAPI + SQLAlchemy + SQLite
- Frontend: Next.js 16 + React 19 + TypeScript
- Database: SQLite (local) / PostgreSQL (production)
- Auth: JWT tokens + password hashing
- AI: OpenAI/Gemini integration ready

For deployment to production, see **README.md** for Railway + Vercel guides.
