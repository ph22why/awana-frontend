@echo off
chcp 65001
echo ====================================
echo Restarting Backend Services with CORS Fix
echo ====================================
echo.

cd /d "%~dp0"

echo [1] Stopping backend services...
docker stop awana-event-service-1 awana-church-service-1 awana-receipt-service-1 2>nul

echo [2] Rebuilding and starting backend services...
docker-compose -f docker-compose.prod.yml up event-service church-service receipt-service -d --build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo Backend Services Restarted!
    echo ====================================
    echo.
    echo Updated CORS settings allow:
    echo - http://182.231.199.64:3000
    echo - http://localhost:3000  
    echo - http://awanaevent.com
    echo - https://awanaevent.com
    echo.
    echo Waiting for services to be ready...
    timeout /t 10 /nobreak >nul
    
    echo Checking service status...
    docker ps | findstr "awana-.*-service"
    
    echo.
    echo Testing API endpoints...
    echo Event Service:
    curl -s http://182.231.199.64:3001/health 2>nul || echo "Health endpoint not available"
    echo.
    echo Church Service:
    curl -s http://182.231.199.64:3002/health 2>nul || echo "Health endpoint not available"
    echo.
    echo Receipt Service:
    curl -s http://182.231.199.64:3003/health 2>nul || echo "Health endpoint not available"
) else (
    echo.
    echo Error: Failed to restart backend services
    docker-compose -f docker-compose.prod.yml logs event-service church-service receipt-service
)

pause 