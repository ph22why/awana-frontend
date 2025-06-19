@echo off
chcp 65001
echo ====================================
echo Restarting Frontend Only (HTTP)
echo ====================================
echo.

cd /d "%~dp0"

echo [1] Stopping frontend container...
docker stop awana-frontend-1 2>nul
docker rm awana-frontend-1 2>nul

echo [2] Rebuilding frontend with updated API endpoints...
docker-compose -f docker-compose.prod.yml up frontend -d --build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo Frontend Restarted Successfully!
    echo ====================================
    echo.
    echo Updated API endpoints:
    echo - Event API: http://182.231.199.64:3001/api/events/
    echo - Church API: http://182.231.199.64:3002/api/churches/
    echo - Receipt API: http://182.231.199.64:3003/api/receipts/
    echo.
    echo Frontend URL: http://182.231.199.64:3000
    echo.
    echo Checking container status...
    timeout /t 5 /nobreak >nul
    docker ps | findstr awana-frontend
) else (
    echo.
    echo Error: Failed to restart frontend
)

pause 