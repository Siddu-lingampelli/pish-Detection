@echo off
echo ========================================
echo   Google Safe Browsing API Setup
echo ========================================
echo.
echo This script will help you add your API key.
echo.
echo STEP 1: Get your API key from Google Cloud Console
echo         https://console.cloud.google.com/
echo.
echo STEP 2: Follow these steps:
echo         1. Create a new project (or select existing)
echo         2. Go to APIs ^& Services ^> Library
echo         3. Search "Safe Browsing API" and ENABLE it
echo         4. Go to APIs ^& Services ^> Credentials
echo         5. Click CREATE CREDENTIALS ^> API Key
echo         6. Copy the generated API key
echo.
echo ========================================
echo.
set /p apikey="Paste your API key here and press ENTER: "
echo.

if "%apikey%"=="" (
    echo [ERROR] No API key provided!
    pause
    exit /b 1
)

echo [INFO] Updating .env file...

REM Backup original .env
copy server\.env server\.env.backup >nul 2>&1

REM Update the API key in .env
powershell -Command "(Get-Content server\.env) -replace 'GOOGLE_SAFE_BROWSING_API_KEY=.*', 'GOOGLE_SAFE_BROWSING_API_KEY=%apikey%' | Set-Content server\.env"

echo.
echo ========================================
echo   API Key Added Successfully!
echo ========================================
echo.
echo Your API key has been saved to: server\.env
echo Backup saved as: server\.env.backup
echo.
echo NEXT STEPS:
echo 1. Restart your backend server
echo 2. Test with a known phishing URL
echo 3. The detection accuracy will be much better!
echo.
echo ========================================
pause
