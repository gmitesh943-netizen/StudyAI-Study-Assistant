# ✅ AI Study App - Getting Started Checklist

## Phase 1: Initial Setup

- [ ] Extract/Download the project
- [ ] Double-click **`RUN_PROJECT.bat`** to install dependencies
- [ ] Wait for completion (first time takes ~5 minutes)

## Phase 2: Start Servers

- [ ] Open **Terminal 1**, run:
  ```bash
  cd backend && venv\Scripts\activate.bat && python main.py
  ```
  ✓ Should show: `Uvicorn running on http://0.0.0.0:8000`

- [ ] Open **Terminal 2**, run:
  ```bash
  cd frontend && npm run dev
  ```
  ✓ Should show: `Ready in X ms`

## Phase 3: Access Application

- [ ] Open browser: **http://localhost:3000**
  ✓ You should see the AI Study App home page

- [ ] Check API is working: **http://localhost:8000/docs**
  ✓ You should see Swagger API documentation

## Phase 4: Create Your Account

- [ ] Click **"Sign Up"** on home page
- [ ] Fill in:
  - Email: `test@example.com` (or your email)
  - Username: `testuser`
  - Password: `password123`
- [ ] Click **"Create Account"**
- [ ] Login with your credentials

## Phase 5: Make Yourself an Admin (IMPORTANT!)

**Option A: Easy Python Method**

- [ ] Open **Terminal 3** in backend folder:
  ```bash
  cd backend && venv\Scripts\activate.bat && python setup_admin.py
  ```
- [ ] Follow the prompts
- [ ] Logout and login again (roles may be cached)

**Option B: SQLite Browser Method**

- [ ] Download SQLite Browser: https://sqlitebrowser.org/dl/
- [ ] Open file: `backend/ai_study_app.db`
- [ ] Go to **Browse Data** tab
- [ ] Select **users** table
- [ ] Find your user row
- [ ] Change `is_admin` column from `0` to `1`
- [ ] Click **Write Changes**
- [ ] Refresh browser

## Phase 6: Test Admin Features

- [ ] Refresh page or logout/login
- [ ] Go to **Dashboard** → **Admin**
- [ ] You should see "Admin Dashboard" heading
- [ ] Click **"Manage Courses"** tab
- [ ] Form should appear to create a course

## Phase 7: Create Your First Course

- [ ] In Admin → Manage Courses, fill:
  - **Course Name:** `Python Basics`
  - **Description:** `Learn Python programming fundamentals`
  - **Category:** `Programming`
  
- [ ] Click **"Add Resource"**:
  - Title: `Python Official Docs`
  - URL: `https://docs.python.org/`
  - Type: `documentation`
  - Click **"Add Resource"**

- [ ] Add another resource:
  - Title: `Python Tutorial`
  - URL: `https://www.youtube.com/` (any Python video)
  - Type: `youtube`
  - Click **"Add Resource"**

- [ ] Click **"Create Course"** button
- [ ] You should see success message ✅

## Phase 8: Test as Student

- [ ] Logout from admin account
- [ ] Create new account as student (different email):
  - Email: `student@example.com`
  - Username: `student1`
  - Password: `password123`

- [ ] Login as student
- [ ] Go to **Dashboard** → **Courses**
- [ ] You should see "Python Basics" course listed
- [ ] Click on course to view details
- [ ] You should see resources you added ✨

## Phase 9: Test Other Features

- [ ] **AI Tutor:** Go to **Dashboard** → **AI Tutor**
  - Type a message, get AI response

- [ ] **Quiz Generator:** Go to **Dashboard** → **Quiz**
  - Generate a quiz on any topic

- [ ] **Flashcards:** Go to **Dashboard** → **Flashcards**
  - Create study flashcards

- [ ] **Notes:** Go to **Dashboard** → **Notes**
  - Generate notes for a topic

- [ ] **Study Planner:** Go to **Dashboard** → **Planner**
  - Create a daily study schedule

- [ ] **Admin Analytics:** Go to **Dashboard** → **Admin** → **Analytics**
  - View user stats and platform metrics

## Phase 10: Verify Database

- [ ] Open SQLite Browser
- [ ] Open `backend/ai_study_app.db`
- [ ] Check tables:
  - [ ] **users** - Should have your accounts
  - [ ] **courses** - Should have "Python Basics"
  - [ ] **chats** - Should have your AI conversations
  - [ ] Other tables might be empty (that's OK)

## ✅ All Set!

You're done! Your AI Study App is fully functional:

### What Works:
- ✅ User registration and login
- ✅ Admin role and authentication
- ✅ Course creation and management
- ✅ Course visibility for students
- ✅ Google resource integration
- ✅ AI tutor, quizzes, notes, flashcards
- ✅ Study planning
- ✅ Admin analytics
- ✅ Database persistence

### Where to Go Next:
- 🌍 **Deployment:** See `README.md` for Railway + Vercel setup
- 🎨 **Customization:** Edit components in `frontend/components/`
- 🔧 **API:** Add more endpoints in `backend/routes/`
- 📚 **Database:** Extend models in `backend/database/init_db.py`

### Need Help?
- 📖 Read `QUICK_START.md` for quick reference
- 📖 Read `SETUP_GUIDE.md` for detailed setup
- 🔍 Check browser console (F12) for errors
- 🔍 Check terminal logs for backend errors
- 💾 Use SQLite Browser to inspect database

---

**Enjoy your AI Study App! 🎉**
