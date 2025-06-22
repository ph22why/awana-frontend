@echo off
chcp 65001
echo ====================================
echo TNT Camp 데이터베이스 백업
echo ====================================

set BACKUP_DATE=%date:~0,4%-%date:~5,2%-%date:~8,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set BACKUP_DATE=%BACKUP_DATE: =0%

echo [1] 백업 디렉토리 생성...
if not exist "D:\eventdb\backup\%BACKUP_DATE%" mkdir "D:\eventdb\backup\%BACKUP_DATE%"
if not exist "D:\tntcampdb\backup\%BACKUP_DATE%" mkdir "D:\tntcampdb\backup\%BACKUP_DATE%"

echo [2] MongoDB 백업 중...
docker exec awana-mongodb-1 mongodump --username admin --password awana123 --authenticationDatabase admin --db event-service --out /data/backup/%BACKUP_DATE%/
docker exec awana-mongodb-1 mongodump --username admin --password awana123 --authenticationDatabase admin --db church-service --out /data/backup/%BACKUP_DATE%/
docker exec awana-mongodb-1 mongodump --username admin --password awana123 --authenticationDatabase admin --db receipt-service --out /data/backup/%BACKUP_DATE%/

echo [3] MySQL 백업 중...
docker exec awana-mysql-1 mysqldump -u root -proot123 --single-transaction --routines --triggers tntcamp > D:\tntcampdb\backup\%BACKUP_DATE%\tntcamp_backup.sql

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