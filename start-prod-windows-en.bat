@echo off
echo Starting AWANA Production Environment (182.231.199.64)...

REM Change to the script directory
cd /d "%~dp0"

REM Check if docker-compose.prod.yml exists
if not exist "docker-compose.prod.yml" (
    echo docker-compose.prod.yml file not found in current directory.
    echo Current directory: %CD%
    echo Please run this script from the AWANA project root directory.
    pause
    exit /b 1
)

REM Check MongoDB data directory
if not exist "D:\eventdb\data" (
    echo MongoDB data directory does not exist.
    echo Please run setup-mongodb-windows-en.bat first.
    pause
    exit /b 1
)

REM Start all services with Docker Compose (Production)
echo Building and starting production services...
docker-compose -f docker-compose.prod.yml up --build -d

echo Waiting for services to start...
timeout /t 15 /nobreak > nul

echo Checking production service status:
docker-compose -f docker-compose.prod.yml ps

echo.
echo Production Environment Endpoints:
echo   - Frontend: http://182.231.199.64:3000
echo   - Event Service: http://182.231.199.64:3001
echo   - Church Service: http://182.231.199.64:3002
echo   - Receipt Service: http://182.231.199.64:3003
echo   - MongoDB: 182.231.199.64:27017
echo.
echo Logs: docker-compose -f docker-compose.prod.yml logs -f [service-name]
echo Stop: docker-compose -f docker-compose.prod.yml down
pause 