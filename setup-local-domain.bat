@echo off
chcp 65001
echo ====================================
echo Setup Local Domain for Testing
echo ====================================
echo.
echo This script will add awanaevent.com to your hosts file
echo for local testing purposes.
echo.
echo IMPORTANT: Run this as Administrator!
echo.

REM Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script requires Administrator privileges!
    echo Please run as Administrator.
    pause
    exit /b 1
)

echo Current hosts file entries for awanaevent:
type C:\Windows\System32\drivers\etc\hosts | findstr awanaevent
echo.

echo Choose your setup option:
echo 1. Local testing (127.0.0.1 - for localhost development)
echo 2. Server testing (182.231.199.64 - for production server)
echo 3. Remove domain entries
echo.
set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="1" (
    echo Adding local domain entries...
    echo 127.0.0.1 awanaevent.com >> C:\Windows\System32\drivers\etc\hosts
    echo 127.0.0.1 www.awanaevent.com >> C:\Windows\System32\drivers\etc\hosts
    echo.
    echo Added local domain entries. You can now access:
    echo - http://awanaevent.com (will point to localhost)
    echo - https://awanaevent.com (will point to localhost)
)

if "%choice%"=="2" (
    echo Adding server domain entries...
    echo 182.231.199.64 awanaevent.com >> C:\Windows\System32\drivers\etc\hosts
    echo 182.231.199.64 www.awanaevent.com >> C:\Windows\System32\drivers\etc\hosts
    echo.
    echo Added server domain entries. You can now access:
    echo - http://awanaevent.com (will point to 182.231.199.64)
    echo - https://awanaevent.com (will point to 182.231.199.64)
)

if "%choice%"=="3" (
    echo Removing domain entries...
    type C:\Windows\System32\drivers\etc\hosts | findstr /v awanaevent > C:\Windows\System32\drivers\etc\hosts.temp
    move C:\Windows\System32\drivers\etc\hosts.temp C:\Windows\System32\drivers\etc\hosts
    echo Domain entries removed.
)

echo.
echo Updated hosts file:
type C:\Windows\System32\drivers\etc\hosts | findstr awanaevent
echo.
echo NOTE: You may need to clear your browser cache or flush DNS:
echo   ipconfig /flushdns
echo.
pause 