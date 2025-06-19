@echo off
chcp 65001

REM Change to the script's directory
cd /d "%~dp0"

echo ====================================
echo Starting AWANA Event Services
echo ====================================
echo.

echo Stopping existing services...
docker-compose -f docker-compose.final.yml down 2>nul
docker-compose -f docker-compose.https-awanaevent-final.yml down 2>nul
docker-compose -f docker-compose.prod.yml down 2>nul

echo.
echo Starting all services...
docker-compose -f docker-compose.final.yml up -d --build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Services started successfully!
    echo.
    echo Waiting for services to be ready...
    timeout /t 10 /nobreak >nul
    
    echo Service Status:
    docker-compose -f docker-compose.final.yml ps
    
    echo.
    echo ====================================
    echo 🎉 AWANA Event is now running!
    echo ====================================
    echo.
    echo 🌐 Main Site: http://awanaevent.com
    echo 📡 Event API: http://awanaevent.com/api/events/
    echo 📡 Church API: http://awanaevent.com/api/churches/
    echo 📡 Receipt API: http://awanaevent.com/api/receipts/
    echo.
    echo 🔧 Direct Backend Access:
    echo - Event Service: http://localhost:3001
    echo - Church Service: http://localhost:3002
    echo - Receipt Service: http://localhost:3003
    echo - Frontend: http://localhost:3000
    echo.
    echo ✅ All services running successfully!
    echo ====================================
    
) else (
    echo ❌ Error: Failed to start services
    echo.
    echo Check logs: docker-compose -f docker-compose.final.yml logs
)

echo.
pause 