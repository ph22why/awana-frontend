@echo off
echo Restarting AWANA Production Services...

REM Change to the script directory
cd /d "%~dp0"

echo.
echo === Stopping existing services ===
docker-compose -f docker-compose.prod.yml down

echo.
echo === Removing old images (optional) ===
set /p rebuild="Do you want to rebuild images? (y/n): "
if /i "%rebuild%"=="y" (
    docker-compose -f docker-compose.prod.yml build --no-cache
    echo Images rebuilt
)

echo.
echo === Starting services ===
docker-compose -f docker-compose.prod.yml up -d

echo.
echo === Waiting for services to start ===
timeout /t 20 /nobreak > nul

echo.
echo === Checking service status ===
docker-compose -f docker-compose.prod.yml ps

echo.
echo === Checking service logs (last 10 lines) ===
docker-compose -f docker-compose.prod.yml logs --tail=10

echo.
echo Production Environment Endpoints:
echo   - Frontend: http://182.231.199.64:3000
echo   - Event Service: http://182.231.199.64:3001
echo   - Church Service: http://182.231.199.64:3002
echo   - Receipt Service: http://182.231.199.64:3003

pause 