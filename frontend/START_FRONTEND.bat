@echo off
REM Startup script for Frontend (Next.js)
echo ============================================
echo Starting AI Study App - FRONTEND (Next.js)
echo ============================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo.
echo ============================================
echo Frontend is starting on http://localhost:3000
echo ============================================
echo.

call npm run dev

pause
