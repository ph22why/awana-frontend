@echo off
chcp 65001
echo ====================================
echo SSL Certificate Troubleshooting
echo ====================================
echo.

cd /d "%~dp0"
echo Current working directory: %CD%
echo.

echo [1] Checking Docker status...
docker --version
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running or not installed!
    pause
    exit /b 1
)
echo Docker is running ✓

echo.
echo [2] Checking current containers...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [3] Checking if port 80 is available...
netstat -an | findstr ":80 "
if %ERRORLEVEL% EQU 0 (
    echo WARNING: Port 80 might be in use by another service
    echo You may need to stop other web servers
) else (
    echo Port 80 appears to be available ✓
)

echo.
echo [4] Testing DNS resolution for awanaevent.com...
nslookup awanaevent.com
echo.

echo [5] Testing connectivity to awanaevent.com...
ping awanaevent.com -n 4

echo.
echo [6] Checking SSL directory structure...
if exist "%CD%\ssl" (
    echo SSL directory exists ✓
    dir "%CD%\ssl" /b
    if exist "%CD%\ssl\live\awanaevent.com" (
        echo Certificate directory found ✓
        dir "%CD%\ssl\live\awanaevent.com" /b
    ) else (
        echo Certificate directory not found - certificates not generated yet
    )
) else (
    echo SSL directory does not exist - run setup first
)

echo.
echo [7] Checking configuration files...
if exist "%CD%\nginx-https-awanaevent-with-api-proxy.conf" (
    echo Nginx HTTPS config found ✓
) else (
    echo WARNING: Nginx HTTPS config not found
)

if exist "%CD%\docker-compose.https-awanaevent-final.yml" (
    echo Docker Compose HTTPS config found ✓
) else (
    echo WARNING: Docker Compose HTTPS config not found
)

echo.
echo [8] Cleanup any leftover containers...
docker stop awana-nginx-cert 2>nul
docker rm awana-nginx-cert 2>nul
docker stop awana-certbot 2>nul
docker rm awana-certbot 2>nul

echo.
echo ====================================
echo Troubleshooting Summary
echo ====================================
echo.
echo Next steps based on current status:
echo.
echo 1. If DNS/connectivity issues: Check domain configuration
echo 2. If port 80 in use: Stop other web servers
echo 3. If no SSL directory: Run .\setup-https-awanaevent-fixed.bat
echo 4. If certificates exist: Run .\start-https-awanaevent-final.bat
echo.

set /p CHOICE="Would you like to (R)un SSL setup, (S)tart HTTPS services, or (Q)uit? "
if /i "%CHOICE%"=="R" (
    echo.
    echo Starting SSL setup...
    call .\setup-https-awanaevent-fixed.bat
) else if /i "%CHOICE%"=="S" (
    echo.
    echo Starting HTTPS services...
    call .\start-https-awanaevent-final.bat
) else (
    echo.
    echo Exiting troubleshooter.
)

pause 