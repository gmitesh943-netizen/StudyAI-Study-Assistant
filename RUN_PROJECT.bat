@echo off
echo ============================================
echo AI Study App - Local Development Setup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [✓] Python and Node.js are installed
echo.

REM Setup Backend
echo ============================================
echo Setting up BACKEND (FastAPI)...
echo ============================================
cd /d "%~dp0\backend"

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing backend dependencies...
pip install -r requirements.txt -q
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ============================================
echo Setting up FRONTEND (Next.js)...
echo ============================================
cd /d "%~dp0\frontend"

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)

echo.
echo ============================================
echo SETUP COMPLETE!
echo ============================================
echo.
echo Next steps:
echo.
echo 1. TERMINAL 1 - Start Backend (FastAPI):
echo    cd "c:\Users\gmite\Downloads\INTERSHIP WORK\AI STUDY APP\backend"
echo    venv\Scripts\activate.bat
echo    python main.py
echo.
echo 2. TERMINAL 2 - Start Frontend (Next.js):
echo    cd "c:\Users\gmite\Downloads\INTERSHIP WORK\AI STUDY APP\frontend"
echo    npm run dev
echo.
echo 3. Open browser:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:8000/docs
echo.
echo 4. Test Login:
echo    - Register: Create a new account
echo    - Login: Use your credentials
echo    - After login, check your role (user/admin) in the database
echo.
echo 5. Admin Setup:
echo    - To make a user an admin, update the database:
echo      UPDATE users SET is_admin=true WHERE id=1;
echo.
echo ============================================
echo.
pause
