@echo off
echo ========================================
echo   Starting Phishing Detection System
echo ========================================
echo.

echo Starting MongoDB...
start "MongoDB" mongod
timeout /t 3 /nobreak >nul

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend...
start "Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   All services started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
