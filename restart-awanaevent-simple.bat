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
echo - Frontend: http://localhost:3000 (React Dev Server - start manually)
echo - Domain: http://awanaevent.com (via Nginx redirect to localhost:3000)
echo - Backend Services: 3001, 3002, 3003 (via Docker)
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
echo Starting backend services with Nginx redirect...
docker-compose -f docker-compose.https-awanaevent-final.yml up -d --build nginx-redirect event-service church-service receipt-service mongodb

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
    echo SUCCESS! Backend services are running
    echo ====================================
    echo.
    echo Next Steps:
    echo 1. Open NEW terminal/command prompt
    echo 2. Navigate to: %CD%
    echo 3. Run: npm start
    echo 4. Wait for React to start on http://localhost:3000
    echo 5. Test access:
    echo    - http://awanaevent.com (should redirect to localhost:3000)
    echo    - http://localhost:3000 (direct React dev server)
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