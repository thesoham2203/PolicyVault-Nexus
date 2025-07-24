@echo off
echo ========================================
echo PolicyVault - Quick Setup Script
echo ========================================
echo.

echo [1/4] Setting up Backend...
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway\backend

echo Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

echo Installing Python dependencies...
pip install --upgrade pip
pip install -r requirements.txt
pip install supabase==1.0.3
pip install uvicorn[standard]
pip install cryptography

echo Creating .env file...
if not exist .env (
    echo AES_256_GCM_KEY_HEX=adc3a230627f6ae9bc2fee551e87c90ef36c94a85870143a95143e95ea19e9dc > .env
    echo CONTACT_SALT=hEuHBktn_q1r6-4q0Pq9Sw== >> .env
    echo. >> .env
    echo # Supabase Configuration >> .env
    echo SUPABASE_URL=https://pqkkmddkvcvyfnyctyct.supabase.co >> .env
    echo SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxa2ttZGRrdmN2eWZueWN0eWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3NTIxNywiZXhwIjoyMDY4NDUxMjE3fQ.7dxhxZ1z03jJyJQO-KCPs11u3ps2qyP-fzwvHCkmauM >> .env
    echo ✅ Created .env file
)

cd ..\..

echo.
echo [2/4] Setting up Electron App...
cd new

echo Installing Node.js dependencies...
npm install

echo Creating Electron .env file...
if not exist .env (
    echo SUPABASE_URL=https://pqkkmddkvcvyfnyctyct.supabase.co > .env
    echo SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxa2ttZGRrdmN2eWZueWN0eWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3NTIxNywiZXhwIjoyMDY4NDUxMjE3fQ.7dxhxZ1z03jJyJQO-KCPs11u3ps2qyP-fzwvHCkmauM >> .env
    echo NODE_ENV=production >> .env
    echo ✅ Created Electron .env file
)

cd ..

echo.
echo [3/4] Creating startup scripts...

echo Creating start_backend.bat...
echo @echo off > start_backend.bat
echo cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway\backend >> start_backend.bat
echo call venv\Scripts\activate >> start_backend.bat
echo set PYTHONPATH=%%cd%% >> start_backend.bat
echo echo Starting PolicyVault Backend Server... >> start_backend.bat
echo echo Backend will be available at: http://localhost:8000 >> start_backend.bat
echo echo Web Interface: http://localhost:8000/app >> start_backend.bat
echo echo Press Ctrl+C to stop the server >> start_backend.bat
echo python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 >> start_backend.bat

echo Creating start_electron.bat...
echo @echo off > start_electron.bat
echo cd new >> start_electron.bat
echo echo Starting PolicyVault Electron App... >> start_electron.bat
echo npm start >> start_electron.bat

echo Creating start_all.bat...
echo @echo off > start_all.bat
echo echo ======================================== >> start_all.bat
echo echo Starting PolicyVault Complete System >> start_all.bat
echo echo ======================================== >> start_all.bat
echo echo. >> start_all.bat
echo echo Starting Backend Server... >> start_all.bat
echo start "PolicyVault Backend" start_backend.bat >> start_all.bat
echo timeout /t 5 /nobreak ^> nul >> start_all.bat
echo echo Starting Electron App... >> start_all.bat
echo start "PolicyVault Electron" start_electron.bat >> start_all.bat
echo echo. >> start_all.bat
echo echo ✅ Both applications started! >> start_all.bat
echo echo Backend: http://localhost:8000 >> start_all.bat
echo echo Web App: http://localhost:8000/app >> start_all.bat
echo pause >> start_all.bat

echo.
echo [4/4] Setup Complete!
echo.
echo ========================================
echo ✅ PolicyVault Setup Successful!
echo ========================================
echo.
echo Available commands:
echo   start_backend.bat  - Start REST API server only
echo   start_electron.bat - Start Electron app only  
echo   start_all.bat      - Start complete system
echo.
echo Manual start:
echo   Backend:  cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway\backend ^&^& venv\Scripts\activate ^&^& python -m uvicorn app.main:app --reload
echo   Electron: cd new ^&^& npm start
echo.
echo URLs:
echo   REST API: http://localhost:8000
echo   Web App:  http://localhost:8000/app
echo   API Docs: http://localhost:8000/docs
echo.
echo Ready to use! Run 'start_all.bat' to begin.
echo ========================================
pause
