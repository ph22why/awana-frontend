@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
if exist "%SCRIPT_DIR%secrets\credentials.bat" (
    call "%SCRIPT_DIR%secrets\credentials.bat"
) else (
    echo [ERROR] secrets\credentials.bat not found. Copy secrets\credentials.example.bat and set your credentials.
    exit /b 1
)

set "BACKUP_DATE=%date:~0,4%%date:~5,2%%date:~8,2%"
echo ====================================
echo MongoDB 백업 (%BACKUP_DATE%)
echo ====================================

echo [1] 백업 디렉토리 생성...
mkdir D:\eventdb\backup\%BACKUP_DATE% 2>nul

echo [2] 데이터베이스 백업...
docker exec awana-mongodb-1 mongodump --authenticationDatabase %MONGO_AUTH_DB% --username %MONGO_INITDB_ROOT_USERNAME% --password %MONGO_INITDB_ROOT_PASSWORD% --out /data/backup/%BACKUP_DATE%

echo [3] 백업 파일 확인...
dir D:\eventdb\backup\%BACKUP_DATE%

echo.
echo ====================================
echo 백업 완료: D:\eventdb\backup\%BACKUP_DATE%
echo ====================================
pause
