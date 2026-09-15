@echo off
setlocal

set "ROOT_DIR=%~dp0"

echo ===================================================
echo AI Scam ^& Phishing Detector - Launcher
echo ===================================================
echo.
echo Starting Backend and Frontend servers in separate windows...
echo.

:: 1. Launch Backend (FastAPI / Uvicorn)
echo [1/2] Launching Backend on http://localhost:8000 ...
if exist "%ROOT_DIR%backend\venv\Scripts\activate.bat" (
    start "AI Scam Detector - Backend" cmd /k "cd /d "%ROOT_DIR%backend" && call "%ROOT_DIR%backend\venv\Scripts\activate.bat" && set "PYTHONPATH=%ROOT_DIR%;%%PYTHONPATH%%" && uvicorn app.main:app --reload"
) else if exist "%ROOT_DIR%backend\.venv\Scripts\activate.bat" (
    start "AI Scam Detector - Backend" cmd /k "cd /d "%ROOT_DIR%backend" && call "%ROOT_DIR%backend\.venv\Scripts\activate.bat" && set "PYTHONPATH=%ROOT_DIR%;%%PYTHONPATH%%" && uvicorn app.main:app --reload"
) else if exist "%ROOT_DIR%venv\Scripts\activate.bat" (
    start "AI Scam Detector - Backend" cmd /k "cd /d "%ROOT_DIR%backend" && call "%ROOT_DIR%venv\Scripts\activate.bat" && set "PYTHONPATH=%ROOT_DIR%;%%PYTHONPATH%%" && uvicorn app.main:app --reload"
) else if exist "%ROOT_DIR%.venv\Scripts\activate.bat" (
    start "AI Scam Detector - Backend" cmd /k "cd /d "%ROOT_DIR%backend" && call "%ROOT_DIR%.venv\Scripts\activate.bat" && set "PYTHONPATH=%ROOT_DIR%;%%PYTHONPATH%%" && uvicorn app.main:app --reload"
) else (
    start "AI Scam Detector - Backend" cmd /k "cd /d "%ROOT_DIR%backend" && set "PYTHONPATH=%ROOT_DIR%;%%PYTHONPATH%%" && uvicorn app.main:app --reload"
)

:: 2. Launch Frontend (React / Vite)
echo [2/2] Launching Frontend on http://localhost:5173 ...
start "AI Scam Detector - Frontend" cmd /k "cd /d "%ROOT_DIR%frontend" && npm run dev"

echo.
echo Both servers have been launched in separate windows:
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:5173
echo.
exit /b 0
