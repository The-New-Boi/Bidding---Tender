@echo off
TITLE GeM AI Bid Compliance Verification Platform - Launcher
CLS
echo =========================================================================
echo       Smart India Hackathon 2026 - Problem Statement 100
echo       GeM AI-Powered Bid Compliance Verification Platform
echo =========================================================================
echo.

set PROJECT_ROOT=%~dp0
cd /d "%PROJECT_ROOT%"

echo [1/3] Preparing Backend...
if not exist "backend\data\mock_databases" (
    echo Generating initial synthetic dataset and mock government databases...
    python backend\data\generate_data.py
)

echo.
echo [2/3] Launching FastAPI Backend Server (Port 8000)...
start "GeM Compliance Backend (FastAPI)" cmd /k "cd /d ""%PROJECT_ROOT%"" && python -m uvicorn backend.main:app --reload --reload-dir backend --host 0.0.0.0 --port 8000"

timeout /t 2 /nobreak > nul

echo.
echo [3/3] Launching React Frontend Dashboard (Port 5173)...
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%PROJECT_ROOT%frontend" && npm install
)

start "GeM Compliance Dashboard (React)" cmd /k "cd /d ""%PROJECT_ROOT%frontend"" && npm run dev"

echo.
echo =========================================================================
echo  [SUCCESS] All Services Started!
echo  -------------------------------------------------------------------------
echo  Frontend Dashboard : http://localhost:5173
echo  Backend Swagger API: http://localhost:8000/docs
echo =========================================================================
echo.

timeout /t 3 /nobreak > nul
start http://localhost:5173

echo Press any key to close this launcher...
pause > nul
