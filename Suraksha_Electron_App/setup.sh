#!/bin/bash

echo "========================================"
echo "PolicyVault - Quick Setup Script"
echo "========================================"
echo

echo "[1/4] Setting up Backend..."
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/backend

echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
pip install supabase==1.0.3
pip install uvicorn[standard]
pip install cryptography

echo "Creating .env file..."
if [ ! -f .env ]; then
    cat > .env << EOL
AES_256_GCM_KEY_HEX=adc3a230627f6ae9bc2fee551e87c90ef36c94a85870143a95143e95ea19e9dc
CONTACT_SALT=hEuHBktn_q1r6-4q0Pq9Sw==

# Supabase Configuration
SUPABASE_URL=https://pqkkmddkvcvyfnyctyct.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxa2ttZGRrdmN2eWZueWN0eWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3NTIxNywiZXhwIjoyMDY4NDUxMjE3fQ.7dxhxZ1z03jJyJQO-KCPs11u3ps2qyP-fzwvHCkmauM
EOL
    echo "✅ Created .env file"
fi

cd ../..

echo
echo "[2/4] Setting up Electron App..."
cd new

echo "Installing Node.js dependencies..."
npm install

echo "Creating Electron .env file..."
if [ ! -f .env ]; then
    cat > .env << EOL
SUPABASE_URL=https://pqkkmddkvcvyfnyctyct.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxa2ttZGRrdmN2eWZueWN0eWN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjg3NTIxNywiZXhwIjoyMDY4NDUxMjE3fQ.7dxhxZ1z03jJyJQO-KCPs11u3ps2qyP-fzwvHCkmauM
NODE_ENV=production
EOL
    echo "✅ Created Electron .env file"
fi

cd ..

echo
echo "[3/4] Creating startup scripts..."

echo "Creating start_backend.sh..."
cat > start_backend.sh << 'EOL'
#!/bin/bash
cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/backend
source venv/bin/activate
export PYTHONPATH=$(pwd)
echo "Starting PolicyVault Backend Server..."
echo "Backend will be available at: http://localhost:8000"
echo "Web Interface: http://localhost:8000/app"
echo "Press Ctrl+C to stop the server"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
EOL
chmod +x start_backend.sh

echo "Creating start_electron.sh..."
cat > start_electron.sh << 'EOL'
#!/bin/bash
cd new
echo "Starting PolicyVault Electron App..."
npm start
EOL
chmod +x start_electron.sh

echo "Creating start_all.sh..."
cat > start_all.sh << 'EOL'
#!/bin/bash
echo "========================================"
echo "Starting PolicyVault Complete System"
echo "========================================"
echo

echo "Starting Backend Server..."
gnome-terminal -- bash -c "./start_backend.sh; exec bash" 2>/dev/null || 
xterm -e "./start_backend.sh" 2>/dev/null ||
osascript -e 'tell app "Terminal" to do script "./start_backend.sh"' 2>/dev/null ||
echo "Please run './start_backend.sh' in a separate terminal"

sleep 5

echo "Starting Electron App..."
gnome-terminal -- bash -c "./start_electron.sh; exec bash" 2>/dev/null ||
xterm -e "./start_electron.sh" 2>/dev/null ||
osascript -e 'tell app "Terminal" to do script "./start_electron.sh"' 2>/dev/null ||
./start_electron.sh

echo
echo "✅ Applications started!"
echo "Backend: http://localhost:8000"
echo "Web App: http://localhost:8000/app"
EOL
chmod +x start_all.sh

echo
echo "[4/4] Setup Complete!"
echo
echo "========================================"
echo "✅ PolicyVault Setup Successful!"
echo "========================================"
echo
echo "Available commands:"
echo "  ./start_backend.sh  - Start REST API server only"
echo "  ./start_electron.sh - Start Electron app only"
echo "  ./start_all.sh      - Start complete system"
echo
echo "Manual start:"
echo "  Backend:  cd PolicyVault-Nexus-Real-Time-RBI-Compliant-Data-Gateway/backend && source venv/bin/activate && python -m uvicorn app.main:app --reload"
echo "  Electron: cd new && npm start"
echo
echo "URLs:"
echo "  REST API: http://localhost:8000"
echo "  Web App:  http://localhost:8000/app"
echo "  API Docs: http://localhost:8000/docs"
echo
echo "Ready to use! Run './start_all.sh' to begin."
echo "========================================"
