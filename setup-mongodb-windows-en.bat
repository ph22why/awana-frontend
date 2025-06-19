@echo off
echo Setting up MongoDB data directories...

REM Check administrator privileges
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running with administrator privileges.
) else (
    echo Administrator privileges required. Please run this script as administrator.
    pause
    exit /b 1
)

REM Create MongoDB data directories
echo Creating MongoDB data directories...
if not exist "D:\eventdb" (
    mkdir "D:\eventdb"
    echo D:\eventdb directory created.
) else (
    echo D:\eventdb directory already exists.
)

if not exist "D:\eventdb\data" (
    mkdir "D:\eventdb\data"
    echo D:\eventdb\data directory created.
) else (
    echo D:\eventdb\data directory already exists.
)

if not exist "D:\eventdb\logs" (
    mkdir "D:\eventdb\logs"
    echo D:\eventdb\logs directory created.
) else (
    echo D:\eventdb\logs directory already exists.
)

REM Create backup directory
if not exist "D:\eventdb\backup" (
    mkdir "D:\eventdb\backup"
    echo D:\eventdb\backup directory created.
) else (
    echo D:\eventdb\backup directory already exists.
)

REM Set permissions (for Docker access)
echo Setting directory permissions...
icacls "D:\eventdb" /grant "Everyone:(OI)(CI)F" /T
icacls "D:\eventdb\data" /grant "Everyone:(OI)(CI)F" /T
icacls "D:\eventdb\logs" /grant "Everyone:(OI)(CI)F" /T
icacls "D:\eventdb\backup" /grant "Everyone:(OI)(CI)F" /T

echo MongoDB data directory setup completed!
echo.
echo Created directories:
echo   - D:\eventdb\data (MongoDB data)
echo   - D:\eventdb\logs (MongoDB logs)
echo   - D:\eventdb\backup (Backup files)
echo.
echo How to run:
echo   - Development: start-dev-windows.bat
echo   - Production: start-prod-windows.bat
pause 