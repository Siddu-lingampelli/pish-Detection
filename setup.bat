@echo off
echo ========================================
echo   Phishing Detection System - Setup
echo ========================================
echo.

echo [1/4] Checking Prerequisites...
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js found: 
node --version

:: Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed!
    pause
    exit /b 1
)
echo [OK] npm found: 
npm --version

:: Check MongoDB
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB not found in PATH
    echo Please ensure MongoDB is installed and running
) else (
    echo [OK] MongoDB found
)

echo.
echo [2/4] Installing Backend Dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..

echo.
echo [3/4] Installing Frontend Dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..

echo.
echo [4/4] Setup Complete!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Start MongoDB (if not running):
echo    mongod
echo.
echo 2. Start Backend (in new terminal):
echo    cd server
echo    npm run dev
echo.
echo 3. Start Frontend (in new terminal):
echo    cd client
echo    npm run dev
echo.
echo 4. Open browser:
echo    http://localhost:3000
echo.
echo ========================================
echo.
pause
