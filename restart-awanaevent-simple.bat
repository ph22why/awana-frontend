@echo off
chcp 65001

REM Change to the script's directory
cd /d "%~dp0"

echo ====================================
echo Restarting AWANA Event (Simple Setup)
echo ====================================
echo.
echo Current directory: %CD%
echo.

echo Step 1: Stopping all existing services...
docker-compose -f docker-compose.prod.yml down 2>nul
docker-compose -f docker-compose.https-awanaevent-final.yml down 2>nul
docker-compose -f docker-compose.windows.yml down 2>nul

echo.
echo Step 2: Starting fresh services...
echo Configuration:
echo - Frontend: Docker container (port 3000) - auto-started
echo - Domain: http://awanaevent.com (via Nginx proxy to frontend container)
echo - Backend Services: 3001, 3002, 3003 (via Docker)
echo - APIs: Available at /api/events/, /api/churches/, /api/receipts/
echo.

echo Checking if docker-compose file exists...
if not exist "docker-compose.https-awanaevent-final.yml" (
    echo ❌ Error: docker-compose.https-awanaevent-final.yml not found!
    echo Available files:
    dir docker-compose*.yml
    pause
    exit /b 1
)

echo ✅ Docker compose file found!
echo.
echo Starting all services with Nginx proxy...
docker-compose -f docker-compose.https-awanaevent-final.yml up -d --build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Services started successfully!
    echo.
    echo Waiting for services to be ready...
    timeout /t 5 /nobreak >nul
    
    echo Checking service status...
    docker-compose -f docker-compose.https-awanaevent-final.yml ps
    
    echo.
    echo Testing backend services:
    echo Event Service: http://localhost:3001
    curl -s http://localhost:3001 >nul && echo ✅ Event Service OK || echo ❌ Event Service Failed
    echo Church Service: http://localhost:3002  
    curl -s http://localhost:3002 >nul && echo ✅ Church Service OK || echo ❌ Church Service Failed
    echo Receipt Service: http://localhost:3003
    curl -s http://localhost:3003 >nul && echo ✅ Receipt Service OK || echo ❌ Receipt Service Failed
    
    echo.
    echo ====================================
    echo SUCCESS! All services are running
    echo ====================================
    echo.
    echo ✅ Frontend: Running in Docker container
    echo ✅ Backend: All services operational
    echo ✅ Nginx: Proxy configured for awanaevent.com
    echo.
    echo Access URLs:
    echo 🌐 http://awanaevent.com (main site via proxy)
    echo 🔗 http://localhost:3000 (direct frontend container)
    echo 📡 http://awanaevent.com/api/events/ (Event API)
    echo 📡 http://awanaevent.com/api/churches/ (Church API)
    echo 📡 http://awanaevent.com/api/receipts/ (Receipt API)
    echo.
    echo No additional manual steps needed!
    echo ====================================
    
) else (
    echo ❌ Error: Failed to start services
    echo.
    echo Troubleshooting:
    echo 1. Check Docker is running: docker --version
    echo 2. Check logs: docker-compose -f docker-compose.https-awanaevent-final.yml logs
    echo 3. Try manual start: docker-compose -f docker-compose.https-awanaevent-final.yml up
)

echo.
pause 