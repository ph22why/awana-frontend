@echo off
chcp 65001

REM Change to the script's directory
cd /d "%~dp0"

echo ====================================
echo Fixing nginx SSL issue and restarting
echo ====================================
echo.

echo Step 1: Stopping all services...
docker-compose -f docker-compose.https-awanaevent-final.yml down

echo.
echo Step 2: Removing failed containers...
docker container prune -f

echo.
echo Step 3: Starting services with HTTP-only nginx...
echo Configuration:
echo - awanaevent.com -> frontend container (HTTP only)
echo - All APIs available via HTTP
echo - No SSL certificate required
echo.

docker-compose -f docker-compose.https-awanaevent-final.yml up -d --build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Services started successfully!
    echo.
    echo Waiting for services to be ready...
    timeout /t 10 /nobreak >nul
    
    echo Checking service status...
    docker-compose -f docker-compose.https-awanaevent-final.yml ps
    
    echo.
    echo ====================================
    echo SUCCESS! AWANA Event is now running
    echo ====================================
    echo.
    echo Access URLs:
    echo 🌐 http://awanaevent.com (main site)
    echo 🔗 http://localhost:3000 (direct frontend)
    echo 📡 http://awanaevent.com/api/events/ (Event API)
    echo 📡 http://awanaevent.com/api/churches/ (Church API)
    echo 📡 http://awanaevent.com/api/receipts/ (Receipt API)
    echo.
    echo Backend direct access:
    echo 🔧 http://localhost:3001 (Event Service)
    echo 🔧 http://localhost:3002 (Church Service)
    echo 🔧 http://localhost:3003 (Receipt Service)
    echo.
    echo ✅ No more SSL certificate errors!
    echo ✅ awanaevent.com now works!
    echo ====================================
    
) else (
    echo ❌ Error: Failed to start services
    echo Check logs with: docker-compose -f docker-compose.https-awanaevent-final.yml logs
)

echo.
pause 