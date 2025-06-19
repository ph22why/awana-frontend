@echo off
echo Starting AWANA Development Environment...

REM Change to the script directory
cd /d "%~dp0"

REM Check if docker-compose.dev.yml exists
if not exist "docker-compose.dev.yml" (
    echo docker-compose.dev.yml file not found in current directory.
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

REM Start backend services with Docker Compose (Development)
echo Starting backend services...
docker-compose -f docker-compose.dev.yml up --build -d

echo Waiting for services to start...
timeout /t 10 /nobreak > nul

echo Checking backend service status:
docker-compose -f docker-compose.dev.yml ps

echo.
echo Development Environment Endpoints:
echo   - Event Service: http://localhost:3001
echo   - Church Service: http://localhost:3002
echo   - Receipt Service: http://localhost:3003
echo   - MongoDB: localhost:27017
echo.
echo Frontend: Run 'npm start' in a separate terminal
echo Logs: docker-compose -f docker-compose.dev.yml logs -f [service-name]
echo Stop: docker-compose -f docker-compose.dev.yml down
pause 