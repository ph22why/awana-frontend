@echo off
chcp 65001 > nul
setlocal

echo ====================================
echo AWANA BT Backend - Full Deployment
echo ====================================

set COMPOSE_FILE=docker-compose.https-awanaevent-final.yml

echo [1] Stopping running BT backend container...
docker-compose -f %COMPOSE_FILE% stop bt-service

echo.
echo [2] Building fresh BT backend image (no cache)...
docker-compose -f %COMPOSE_FILE% build --no-cache bt-service

echo.
echo [3] Starting BT backend container...
docker-compose -f %COMPOSE_FILE% up -d bt-service

echo.
echo [4] Waiting for container to stabilise...
timeout /t 5 /nobreak > nul

echo.
echo [5] Current status:
docker-compose -f %COMPOSE_FILE% ps bt-service

echo.
echo ====================================
echo Deployment complete!
echo - API: https://awanaevent.com/api/bt
echo - Check logs: docker-compose -f %COMPOSE_FILE% logs -f bt-service
echo ====================================

endlocal
pause
