# AI Study App - Complete Setup & Running Guide

## 📋 Quick Start (2 Simple Steps)

### Step 1: Run Setup (First Time Only)
Double-click: **`RUN_PROJECT.bat`** in the main folder
- This will install all dependencies for both backend and frontend

### Step 2: Start Both Servers
Open **TWO** separate command prompts:

**Terminal 1 (Backend):**
```bash
cd "c:\Users\gmite\Downloads\INTERSHIP WORK\AI STUDY APP\backend"
venv\Scripts\activate.bat
python main.py
```
Or simply double-click: **`backend/START_BACKEND.bat`**

**Terminal 2 (Frontend):**
```bash
cd "c:\Users\gmite\Downloads\INTERSHIP WORK\AI STUDY APP\frontend"
npm run dev
```
Or simply double-click: **`frontend/START_FRONTEND.bat`**

---

## 🌐 Access the Application

- **Frontend (User Interface):** http://localhost:3000
- **Backend API Docs:** http://localhost:8000/docs
- **Backend Health Check:** http://localhost:8000

---

## 👥 User & Admin Authentication

### Registration & Login

1. Open http://localhost:3000
2. Click **"Sign Up"** to create a new account
3. Fill in email, username, and password
4. Click **"Sign In"** with your credentials

### Make Yourself an Admin

By default, new users are **not admins**. To create an admin:

**Option A: Using SQLite Browser**
1. Download **SQLite Browser** (DB Browser) from: https://sqlitebrowser.org/dl/
2. Open the database file: `backend/ai_study_app.db`
3. Go to **Browse Data** → **users** table
4. Find your user and change `is_admin` from `0` to `1`
5. Click **Write Changes**

**Option B: Using Python Script**
1. Open Command Prompt in `backend` folder:
```bash
cd "backend"
venv\Scripts\activate.bat
```

2. Run this Python code:
```python
from database.connection import SessionLocal
from database.init_db import User

db = SessionLocal()
user = db.query(User).filter(User.email == "your-email@example.com").first()
if user:
    user.is_admin = True
    db.commit()
    print(f"User {user.username} is now an admin!")
else:
    print("User not found")
```

---

## 🎓 Using the Application

### For Students (Regular Users)
1. Login with your account
2. Go to **Dashboard** → **Courses**
3. View all available courses
4. Click on a course to see details and resources
5. Use other features: AI Tutor, Quizzes, Notes, Flashcards

### For Admins
1. Login with your admin account
2. Go to **Dashboard** → **Admin Panel**
3. Click **"Add New Course"**
4. Fill in course details:
   - **Name**: Course title
   - **Description**: What the course is about
   - **Category**: Subject area (e.g., "Mathematics", "Science")
   - **Resources**: Add Google resources (YouTube links, articles, etc.)
5. Click **"Publish Course"**
6. Students can now see and access your course

---

## 📚 Course Management API

### Admin: Create a Course
```bash
POST http://localhost:8000/api/courses
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN

{
  "name": "Python Basics",
  "description": "Learn Python programming from scratch",
  "category": "Programming",
  "resources": [
    {
      "title": "Python Official Docs",
      "url": "https://docs.python.org/3/",
      "type": "documentation"
    },
    {
      "title": "Python Tutorial Video",
      "url": "https://www.youtube.com/watch?v=...",
      "type": "youtube"
    }
  ]
}
```

### Student: List All Courses
```bash
GET http://localhost:8000/api/courses?skip=0&limit=10
Authorization: Bearer YOUR_TOKEN
```

### Student: Get Course Details
```bash
GET http://localhost:8000/api/courses/{course_id}
Authorization: Bearer YOUR_TOKEN
```

### Admin: Update a Course
```bash
PUT http://localhost:8000/api/courses/{course_id}
Authorization: Bearer YOUR_TOKEN

{
  "name": "Updated Course Name",
  "description": "Updated description"
}
```

### Admin: Delete a Course
```bash
DELETE http://localhost:8000/api/courses/{course_id}
Authorization: Bearer YOUR_TOKEN
```

---

## 🔧 Google Resources Integration

The course system supports multiple types of learning resources:

### Resource Types:
- **YouTube** - Video tutorials and lectures
- **Documentation** - Official guides and references
- **Scholar** - Academic papers and research
- **Classroom** - Google Classroom links

### Adding Resources Example:
When creating/updating a course, include resources like:
```json
{
  "resources": [
    {
      "title": "Official Python Documentation",
      "url": "https://docs.python.org/",
      "type": "documentation"
    },
    {
      "title": "Data Science Course",
      "url": "https://www.youtube.com/playlist?list=...",
      "type": "youtube"
    },
    {
      "title": "Machine Learning Research Papers",
      "url": "https://scholar.google.com/scholar?q=...",
      "type": "scholar"
    }
  ]
}
```

---

## 🗄️ Database Details

### Database File Location
```
c:\Users\gmite\Downloads\INTERSHIP WORK\AI STUDY APP\backend\ai_study_app.db
```

### Main Tables
- **users** - User accounts with id, email, username, is_admin, is_active
- **courses** - Courses created by admins
- **chats** - AI chat conversations
- **quizzes** - Quiz history
- **notes** - User-created notes
- **flashcards** - Study flashcards
- **progress** - Subject-wise progress tracking

---

## 🌍 Environment Variables

### Backend (`backend/.env`)
```
PORT=8000
ENVIRONMENT=development
DATABASE_URL=sqlite:///./ai_study_app.db
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=local-dev-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440
AI_PROVIDER=gemini
GEMINI_API_KEY=your-key-here (optional)
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEV_BYPASS_AUTH=true
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## 🐛 Troubleshooting

### Backend won't start
**Error:** `ModuleNotFoundError: No module named 'fastapi'`
- **Solution:** Activate virtual environment and install requirements
  ```bash
  venv\Scripts\activate.bat
  pip install -r requirements.txt
  ```

### Port 8000 or 3000 already in use
**Error:** `Address already in use`
- **Solution:** Kill the existing process or use a different port
  ```bash
  netstat -ano | findstr :8000  # Find the PID
  taskkill /PID <PID> /F        # Kill the process
  ```

### Database locked error
**Error:** `database is locked`
- **Solution:** Close all DB connections and restart the backend
  - Make sure no SQLite browser is open
  - Restart both backend and frontend

### Frontend not connecting to backend
**Error:** `Connection refused` or `CORS error`
- **Solution:** 
  - Make sure backend is running on port 8000
  - Check `NEXT_PUBLIC_API_URL=http://localhost:8000` in frontend/.env.local
  - Clear browser cache and reload

---

## 📱 Features Available

### Student Features
- ✅ User Authentication (Register/Login)
- ✅ View Available Courses
- ✅ Access Course Materials & Resources
- ✅ AI Chat Tutor
- ✅ Quiz Generator
- ✅ Flashcard Creator
- ✅ Notes Generator
- ✅ Study Planner
- ✅ PDF Summarizer
- ✅ Progress Tracking

### Admin Features
- ✅ Create & Manage Courses
- ✅ Add Learning Resources
- ✅ View User Analytics
- ✅ Manage Course Publishing
- ✅ Track Usage Statistics

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in Terminal
3. Check database with SQLite Browser
4. Verify all environment variables are set

---

## 🚀 Deployment (Future)

For production:
- Frontend: Deploy to **Vercel** (Free tier available)
- Backend: Deploy to **Railway** (Free tier available)
- Database: Use **PostgreSQL** on Railway instead of SQLite

Setup guides available in main README.md

---

**Good luck! 🎉 Your AI Study App is ready to run!**
