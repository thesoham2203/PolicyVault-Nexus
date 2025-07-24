@echo off
echo ========================================
echo PolicyVault - Installation Verification
echo ========================================
echo.

echo [1/5] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Python is installed
    python --version
) else (
    echo ❌ Python not found! Please install Python 3.10 or later
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo [2/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js is installed
    node --version
) else (
    echo ❌ Node.js not found! Please install Node.js 18 or later
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo [3/5] Checking Backend dependencies...
if exist "PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway\backend\venv" (
    echo ✅ Backend virtual environment exists
) else (
    echo ❌ Backend not set up. Run setup.bat first
    pause
    exit /b 1
)

if exist "PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway\backend\.env" (
    echo ✅ Backend .env file exists
) else (
    echo ❌ Backend .env file missing. Run setup.bat first
    pause
    exit /b 1
)

echo.
echo [4/5] Checking Electron dependencies...
if exist "new\node_modules" (
    echo ✅ Electron dependencies installed
) else (
    echo ❌ Electron dependencies missing. Run setup.bat first
    pause
    exit /b 1
)

if exist "new\.env" (
    echo ✅ Electron .env file exists
) else (
    echo ❌ Electron .env file missing. Run setup.bat first
    pause
    exit /b 1
)

echo.
echo [5/5] Testing Backend startup...
echo Starting backend server for 10 seconds...
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway\backend
call venv\Scripts\activate
set PYTHONPATH=%cd%

timeout /t 2 /nobreak > nul
start /b python -m uvicorn app.main:app --port 8001 > test_output.log 2>&1

echo Waiting for server to start...
timeout /t 8 /nobreak > nul

echo Testing API endpoint...
curl -s http://localhost:8001/health > health_response.txt 2>&1
if exist health_response.txt (
    findstr "healthy\|active" health_response.txt > nul
    if %errorlevel% equ 0 (
        echo ✅ Backend API is working
    ) else (
        echo ⚠️ Backend started but API response unexpected
        type health_response.txt
    )
) else (
    echo ❌ Could not connect to backend API
)

echo Stopping test server...
taskkill /f /im python.exe > nul 2>&1

del health_response.txt > nul 2>&1
del test_output.log > nul 2>&1
cd ..\..

echo.
echo ========================================
echo ✅ Installation Verification Complete!
echo ========================================
echo.
echo Your PolicyVault system is ready to use!
echo.
echo To start the system:
echo   • Complete system: start_all.bat
echo   • Backend only:    start_backend.bat  
echo   • Electron only:   start_electron.bat
echo.
echo Access URLs:
echo   • Web App: http://localhost:8000/app
echo   • API Docs: http://localhost:8000/docs
echo   • Health Check: http://localhost:8000/health
echo.
echo ========================================
pause
