@echo off
chcp 65001

REM Change to the script's directory
cd /d "%~dp0"

echo ====================================
echo Restarting AWANA with HTTPS (Self-Signed SSL)
echo ====================================
echo.

echo Step 1: Stopping all services...
docker-compose -f docker-compose.https-awanaevent-final.yml down

echo.
echo Step 2: Removing old containers...
docker container prune -f

echo.
echo Step 3: Checking SSL certificate files...
if exist "ssl\live\awanaevent.com\privkey.pem" (
    echo ✅ SSL private key found
) else (
    echo ❌ SSL private key missing!
    echo Please run SSL setup first
    pause
    exit /b 1
)

if exist "ssl\live\awanaevent.com\fullchain.pem" (
    echo ✅ SSL certificate found
) else (
    echo ❌ SSL certificate missing!
    echo Please run SSL setup first
    pause
    exit /b 1
)

echo.
echo Step 4: Starting services with HTTPS...
echo Configuration:
echo - Frontend: Docker container (port 3000) 
echo - HTTP: http://awanaevent.com (redirects to HTTPS)
echo - HTTPS: https://awanaevent.com (main site)
echo - Backend Services: 3001, 3002, 3003
echo - SSL: Self-signed certificate

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
    echo SUCCESS! AWANA Event is now running with HTTPS
    echo ====================================
    echo.
    echo 🔒 HTTPS Access URLs:
    echo 🌐 https://awanaevent.com (main site - HTTPS)
    echo 📡 https://awanaevent.com/api/events/ (Event API)
    echo 📡 https://awanaevent.com/api/churches/ (Church API)
    echo 📡 https://awanaevent.com/api/receipts/ (Receipt API)
    echo.
    echo 🔧 Direct access:
    echo 🔗 http://localhost:3000 (direct frontend)
    echo 🔧 http://localhost:3001 (Event Service)
    echo 🔧 http://localhost:3002 (Church Service)
    echo 🔧 http://localhost:3003 (Receipt Service)
    echo.
    echo ⚠️  IMPORTANT NOTES:
    echo - Browser will show security warning (self-signed certificate)
    echo - Click "Advanced" then "Proceed to awanaevent.com"
    echo - HTTP requests will automatically redirect to HTTPS
    echo.
    echo ✅ HTTPS is now properly configured!
    echo ====================================
    
) else (
    echo ❌ Error: Failed to start services
    echo.
    echo Troubleshooting:
    echo 1. Check nginx logs: docker logs awana-nginx-proxy-1
    echo 2. Check SSL files in ssl\live\awanaevent.com\
    echo 3. Verify certificate format with OpenSSL
)

echo.
pause 