@echo off
title CLARION — Launcher
echo =====================================================================
echo                         CLARION
echo   AI Threat Intelligence Correlation & Alert Prioritisation
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Clarion Backend (FastAPI on http://127.0.0.1:8000)...
start "Clarion Backend" cmd /k "cd src\backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak > nul

echo [2/3] Starting Clarion Frontend (Vite on http://localhost:3000)...
start "Clarion Frontend" cmd /k "cd src\frontend && npm run dev"

echo.
echo [3/3] System successfully initialized!
echo - Operations Console: http://localhost:3000
echo - FastAPI Swagger:    http://127.0.0.1:8000/docs
echo.
echo Press any key to exit this launcher window (services will stay running)...
pause > nul
