@echo off
REM Startup script for Backend (FastAPI)
echo ============================================
echo Starting AI Study App - BACKEND (FastAPI)
echo ============================================
echo.

cd /d "%~dp0"

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt -q

echo.
echo ============================================
echo Backend is starting on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ============================================
echo.

python main.py

pause
