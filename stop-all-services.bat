@echo off
echo Stopping All AWANA Services...

REM Change to the script directory
cd /d "%~dp0"

echo.
echo === Stopping Development Services ===
if exist "docker-compose.dev.yml" (
    docker-compose -f docker-compose.dev.yml down
) else (
    echo docker-compose.dev.yml not found
)

echo.
echo === Stopping Production Services ===
if exist "docker-compose.prod.yml" (
    docker-compose -f docker-compose.prod.yml down
) else (
    echo docker-compose.prod.yml not found
)

echo.
echo === Stopping Legacy Services ===
if exist "docker-compose.yml" (
    docker-compose -f docker-compose.yml down
) else (
    echo docker-compose.yml not found
)

if exist "docker-compose.windows.yml" (
    docker-compose -f docker-compose.windows.yml down
) else (
    echo docker-compose.windows.yml not found
)

echo.
echo === Checking Remaining Containers ===
docker ps --filter "name=awana" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo All AWANA services stopped!
pause 