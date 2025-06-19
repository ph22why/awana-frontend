@echo off
chcp 65001
echo ====================================
echo Starting AWANA with HTTPS (Final)
echo ====================================
echo.

echo Configuration:
echo - Domain: awanaevent.com
echo - Frontend: https://awanaevent.com (React on port 3000 -> Nginx on 443)
echo - API Endpoints (via Nginx proxy):
echo   - Events: https://awanaevent.com/api/events/
echo   - Churches: https://awanaevent.com/api/churches/
echo   - Receipts: https://awanaevent.com/api/receipts/
echo.

echo Stopping existing services...
docker-compose -f docker-compose.prod.yml down 2>nul
docker-compose -f docker-compose.https-awanaevent.yml down 2>nul
docker-compose -f docker-compose.https-awanaevent-final.yml down

echo.
echo Building and starting HTTPS services with API proxy...
docker-compose -f docker-compose.https-awanaevent-final.yml up -d --build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo AWANA HTTPS Services Started!
    echo ====================================
    echo.
    echo Access URLs:
    echo - Main Site: https://awanaevent.com
    echo - Event API: https://awanaevent.com/api/events/
    echo - Church API: https://awanaevent.com/api/churches/
    echo - Receipt API: https://awanaevent.com/api/receipts/
    echo.
    echo Technical Details:
    echo - Frontend: React (internal port 3000) -> Nginx (external port 443)
    echo - Backend Services: Proxied through Nginx (no external ports)
    echo - MongoDB: Port 27017 (accessible for backup/admin)
    echo.
    echo Waiting for services to be ready...
    timeout /t 10 /nobreak >nul
    
    echo Checking service status...
    docker-compose -f docker-compose.https-awanaevent-final.yml ps
    
    echo.
    echo Testing direct backend services (for development/debugging):
    echo Event Service: http://localhost:3001
    echo Church Service: http://localhost:3002  
    echo Receipt Service: http://localhost:3003
    echo.
    echo Testing API endpoints via Nginx proxy...
    echo Event Service Health Check:
    curl -k https://awanaevent.com/api/events/ 2>nul | echo
    echo.
    echo Alternative access (if domain not configured):
    echo Frontend: http://localhost (or http://www.awanaevent.com:3000 if available)
    echo HTTPS: https://localhost (self-signed certificate)
    
) else (
    echo Error: Failed to start services
    echo Check logs with: docker-compose -f docker-compose.https-awanaevent-final.yml logs
)

echo.
pause 