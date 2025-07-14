# Chat Application Startup Script
# This script starts both the Socket.io server and Next.js frontend

Write-Host "🚀 Starting Chat Application..." -ForegroundColor Green
Write-Host ""

# Start Socket.io server in background
Write-Host "📡 Starting Socket.io server on port 3003..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command", "cd '$PWD/server'; `$env:PORT=3003; node index.js" -WindowStyle Minimized

# Wait a moment for the server to start
Start-Sleep -Seconds 2

# Start Next.js frontend
Write-Host "🌐 Starting Next.js frontend on port 3000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Both servers will be running:" -ForegroundColor Green
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Socket.io: http://localhost:3003" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the frontend server" -ForegroundColor Yellow
Write-Host "The Socket.io server will continue running in the background" -ForegroundColor Yellow
Write-Host ""

# Start frontend (this will block until stopped)
npm run dev
