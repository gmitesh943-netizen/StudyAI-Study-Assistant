# StudyAI — Start frontend + backend together (one URL: http://localhost:3000)
$root = $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

Write-Host ""
Write-Host "  StudyAI Dev Server" -ForegroundColor Red
Write-Host "  ==================" -ForegroundColor Red
Write-Host ""

# Backend setup
if (-not (Test-Path (Join-Path $backend "venv"))) {
    Write-Host "[1/4] Creating Python virtual environment..." -ForegroundColor Yellow
    Set-Location $backend
    python -m venv venv
    .\venv\Scripts\pip install -r requirements.txt
}

if (-not (Test-Path (Join-Path $backend ".env"))) {
    Copy-Item (Join-Path $backend ".env.example") (Join-Path $backend ".env")
}

if (-not (Test-Path (Join-Path $backend "ai_study_app.db"))) {
    Write-Host "[2/4] Initializing database..." -ForegroundColor Yellow
    Set-Location $backend
    .\venv\Scripts\python -m database.init_db
}

# Start backend
Write-Host "[3/4] Starting backend on port 8000..." -ForegroundColor Green
$backendJob = Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$backend'; Write-Host 'Backend: http://localhost:8000' -ForegroundColor Cyan; .\venv\Scripts\uvicorn main:app --reload --host 127.0.0.1 --port 8000"
) -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 3

# Start frontend
Write-Host "[4/4] Starting frontend on port 3000..." -ForegroundColor Green
Write-Host ""
Write-Host "  Open: http://localhost:3000" -ForegroundColor White
Write-Host "  Sign up: http://localhost:3000/sign-up" -ForegroundColor White
Write-Host "  Login:   http://localhost:3000/sign-in" -ForegroundColor White
Write-Host ""

Set-Location $frontend
npm run dev
