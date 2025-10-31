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

echo ====================================
echo TNT Camp 데이터베이스 백업
echo ====================================

set "BACKUP_DATE=%date:~0,4%-%date:~5,2%-%date:~8,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%"
set "BACKUP_DATE=%BACKUP_DATE: =0%"

echo [1] 백업 디렉토리 생성...
if not exist "D:\eventdb\backup\%BACKUP_DATE%" mkdir "D:\eventdb\backup\%BACKUP_DATE%"
if not exist "D:\tntcampdb\backup\%BACKUP_DATE%" mkdir "D:\tntcampdb\backup\%BACKUP_DATE%"

echo [2] MongoDB 백업 중...
docker exec awana-mongodb-1 mongodump --username %MONGO_INITDB_ROOT_USERNAME% --password %MONGO_INITDB_ROOT_PASSWORD% --authenticationDatabase %MONGO_AUTH_DB% --db %MONGO_EVENT_DB% --out /data/backup/%BACKUP_DATE%/
docker exec awana-mongodb-1 mongodump --username %MONGO_INITDB_ROOT_USERNAME% --password %MONGO_INITDB_ROOT_PASSWORD% --authenticationDatabase %MONGO_AUTH_DB% --db %MONGO_CHURCH_DB% --out /data/backup/%BACKUP_DATE%/
docker exec awana-mongodb-1 mongodump --username %MONGO_INITDB_ROOT_USERNAME% --password %MONGO_INITDB_ROOT_PASSWORD% --authenticationDatabase %MONGO_AUTH_DB% --db %MONGO_RECEIPT_DB% --out /data/backup/%BACKUP_DATE%/

echo [3] MySQL 백업 중...
docker exec awana-mysql-1 mysqldump -u root -p%MYSQL_ROOT_PASSWORD% --single-transaction --routines --triggers %MYSQL_DATABASE% > D:\tntcampdb\backup\%BACKUP_DATE%\tntcamp_backup.sql

echo [4] 업로드 파일 백업 중...
xcopy "D:\tntcampdb\uploads" "D:\tntcampdb\backup\%BACKUP_DATE%\uploads\" /E /I /Y

echo.
echo ====================================
echo 백업 완료!
echo 백업 위치: 
echo - MongoDB: D:\eventdb\backup\%BACKUP_DATE%\
echo - MySQL: D:\tntcampdb\backup\%BACKUP_DATE%\
echo - 업로드 파일: D:\tntcampdb\backup\%BACKUP_DATE%\uploads\
echo ====================================
pause
