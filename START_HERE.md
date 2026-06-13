# 🎯 Getting Started - Super Simple Version

## 1️⃣ First Run (One Time Only)

Double-click this file:
```
RUN_PROJECT.bat
```

Wait for it to finish. It will install everything you need.

---

## 2️⃣ Start the Application

Open **2 Command Prompts** or **2 PowerShell windows**:

### Window 1 - Backend Server
Copy and paste this:
```
cd "c:\Users\gmite\Downloads\INTERSHIP WORK\AI STUDY APP\backend" && venv\Scripts\activate.bat && python main.py
```

You should see: ✅ `Uvicorn running on http://0.0.0.0:8000`

### Window 2 - Frontend Server  
Copy and paste this:
```
cd "c:\Users\gmite\Downloads\INTERSHIP WORK\AI STUDY APP\frontend" && npm run dev
```

You should see: ✅ `Ready in X ms`

---

## 3️⃣ Open in Browser

Go to: **http://localhost:3000**

You should see the AI Study App! 🎉

---

## 4️⃣ Create Your Account

- Click **"Sign Up"**
- Enter email, username, password
- Click **"Create Account"**
- Login with your credentials

---

## 5️⃣ Make Yourself an Admin (IMPORTANT!)

Open **Window 3** and copy:
```
cd "c:\Users\gmite\Downloads\INTERSHIP WORK\AI STUDY APP\backend" && venv\Scripts\activate.bat && python setup_admin.py
```

Follow the prompts to make yourself an admin.

---

## 6️⃣ Create a Course

1. Refresh the browser page
2. Go to **Dashboard** → **Admin** → **Manage Courses**
3. Fill in:
   - **Name:** Python Basics
   - **Description:** Learn Python programming
   - **Category:** Programming
4. Click **"Add Resource"** and add YouTube/documentation links
5. Click **"Create Course"** ✨

---

## 7️⃣ Test as a Student

1. Logout
2. Create a new account (different email)
3. Go to **Dashboard** → **Courses**
4. See your course listed!

---

## 🎉 That's It!

Your app is now **fully working** with:
- ✅ User authentication
- ✅ Admin features
- ✅ Course creation
- ✅ Course viewing
- ✅ All AI features

---

## 🆘 If Something Doesn't Work

### Backend won't start?
```
venv\Scripts\activate.bat
pip install -r requirements.txt
```

### Frontend won't start?
```
npm install
npm run dev
```

### Can't login?
Make sure backend is running in Window 1

### Can't create course?
Make sure you ran `python setup_admin.py`

### Questions?
Check **INDEX.md** for detailed guides

---

## 📍 URLs to Remember

- **App:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

---

**You're all set! Enjoy! 🚀**
