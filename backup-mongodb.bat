@echo off
chcp 65001
set BACKUP_DATE=%date:~0,4%%date:~5,2%%date:~8,2%
echo ====================================
echo MongoDB 백업 (%BACKUP_DATE%)
echo ====================================

echo [1] 백업 디렉토리 생성...
mkdir D:\eventdb\backup\%BACKUP_DATE% 2>nul

echo [2] 데이터베이스 백업...
docker exec awana-mongodb-1 mongodump --authenticationDatabase admin -u admin -p awana123 --out /data/backup/%BACKUP_DATE%

echo [3] 백업 파일 확인...
dir D:\eventdb\backup\%BACKUP_DATE%

echo.
echo ====================================
echo 백업 완료: D:\eventdb\backup\%BACKUP_DATE%
echo ====================================
pause 