@echo off
chcp 65001
echo ====================================
echo AWANA Production Services Restart
echo ====================================
echo.

cd /d "%~dp0"

echo [1/3] Stopping all services...
docker-compose -f docker-compose.prod.yml down
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to stop services
    pause
    exit /b 1
)

echo.
echo [2/3] Rebuilding services...
docker-compose -f docker-compose.prod.yml build --no-cache
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to build services
    pause
    exit /b 1
)

echo.
echo [3/3] Starting services...
docker-compose -f docker-compose.prod.yml up -d
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to start services
    pause
    exit /b 1
)

echo.
echo ====================================
echo Services restarted successfully!
echo ====================================
echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak

echo.
echo Checking service status...
docker-compose -f docker-compose.prod.yml ps

echo.
echo Access URLs:
echo - Frontend: http://182.231.199.64:3000
echo - Event Service: http://182.231.199.64:3001
echo - Church Service: http://182.231.199.64:3002
echo - Receipt Service: http://182.231.199.64:3003

echo.
echo Restart completed!
pause 