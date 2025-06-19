@echo off
echo Checking Docker and AWANA Services Status...

REM Change to the script directory
cd /d "%~dp0"

echo.
echo === Docker Desktop Status ===
docker version >nul 2>&1
if %errorLevel% == 0 (
    echo Docker is running
) else (
    echo Docker is NOT running or not installed
    echo Please start Docker Desktop
    pause
    exit /b 1
)

echo.
echo === Current Directory ===
echo %CD%

echo.
echo === Available Docker Compose Files ===
if exist "docker-compose.dev.yml" (
    echo ✓ docker-compose.dev.yml (Development)
) else (
    echo ✗ docker-compose.dev.yml (Missing)
)

if exist "docker-compose.prod.yml" (
    echo ✓ docker-compose.prod.yml (Production)
) else (
    echo ✗ docker-compose.prod.yml (Missing)
)

echo.
echo === Running Docker Containers ===
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo === MongoDB Data Directory ===
if exist "D:\eventdb\data" (
    echo ✓ D:\eventdb\data exists
) else (
    echo ✗ D:\eventdb\data does not exist
    echo Run setup-mongodb-windows-en.bat first
)

echo.
echo === AWANA Services Status ===
docker ps --filter "name=awana" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

pause 