@echo off
echo ========================================
echo   VoiceStudio AI - Starting...
echo ========================================

REM Check prerequisites
where python >nul 2>&1 || (echo Python not found! & exit /b 1)
where node >nul 2>&1 || (echo Node.js not found! & exit /b 1)

REM Install Python dependencies
echo [1/4] Installing Python dependencies...
pip install -r requirements.txt

REM Create storage directories
echo [2/4] Creating storage directories...
if not exist "uploads" mkdir uploads
if not exist "outputs" mkdir outputs
if not exist "voices" mkdir voices

REM Start FastAPI (new window)
echo [3/4] Starting FastAPI server...
start "FastAPI Server" cmd /k "python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000"

REM Start Next.js in current window
echo [4/4] Starting Next.js dev server...
cd web && npx next dev --webpack

echo ========================================
echo   All services started!
echo   Landing Page:     http://localhost:3000
echo   Dashboard:        http://localhost:3000/dashboard
echo   AI Voice Studio:  http://localhost:3000/tts
echo   Admin Panel:      http://localhost:3000/admin
echo   API:              http://localhost:8000
echo   API Docs:         http://localhost:8000/docs
echo   WhatsApp Support: +923283224277
echo ========================================
