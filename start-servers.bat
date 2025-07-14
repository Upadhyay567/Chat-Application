@echo off
echo 🚀 Starting Chat Application...
echo.

echo 📡 Starting Socket.io server on port 3003...
start /min cmd /c "cd server && set PORT=3003 && node index.js"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo 🌐 Starting Next.js frontend on port 3000...
echo.
echo ✅ Both servers will be running:
echo    - Frontend: http://localhost:3000
echo    - Socket.io: http://localhost:3003
echo.
echo Press Ctrl+C to stop the frontend server
echo The Socket.io server will continue running in the background
echo.

npm run dev
