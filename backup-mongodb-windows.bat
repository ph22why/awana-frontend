@echo off
echo 💾 MongoDB 데이터를 백업합니다...

REM 현재 날짜와 시간으로 백업 파일명 생성
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"
set "backup_date=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

echo 📅 백업 날짜: %backup_date%

REM 백업 디렉토리 확인
if not exist "D:\awanadb\backup" (
    echo ❌ 백업 디렉토리가 존재하지 않습니다. setup-mongodb-windows.bat를 먼저 실행해주세요.
    pause
    exit /b 1
)

REM MongoDB 컨테이너가 실행 중인지 확인
docker ps | findstr mongodb >nul
if %errorLevel% neq 0 (
    echo ❌ MongoDB 컨테이너가 실행 중이지 않습니다. 서비스를 먼저 시작해주세요.
    pause
    exit /b 1
)

echo 🔄 MongoDB 데이터를 백업합니다...

REM 각 데이터베이스별 백업
echo 📊 Event Service 데이터베이스 백업...
docker exec awana-mongodb-1 mongodump --username admin --password awana123 --authenticationDatabase admin --db event-service --out /data/backup/event-service_%backup_date%

echo 📊 Church Service 데이터베이스 백업...
docker exec awana-mongodb-1 mongodump --username admin --password awana123 --authenticationDatabase admin --db church-service --out /data/backup/church-service_%backup_date%

echo 📊 Receipt Service 데이터베이스 백업...
docker exec awana-mongodb-1 mongodump --username admin --password awana123 --authenticationDatabase admin --db receipt-service --out /data/backup/receipt-service_%backup_date%

REM 백업 파일을 윈도우 호스트로 복사
echo 📁 백업 파일을 호스트로 복사합니다...
docker cp awana-mongodb-1:/data/backup/event-service_%backup_date% D:\awanadb\backup\
docker cp awana-mongodb-1:/data/backup/church-service_%backup_date% D:\awanadb\backup\
docker cp awana-mongodb-1:/data/backup/receipt-service_%backup_date% D:\awanadb\backup\

REM 컨테이너 내부의 임시 백업 파일 정리
docker exec awana-mongodb-1 rm -rf /data/backup/event-service_%backup_date%
docker exec awana-mongodb-1 rm -rf /data/backup/church-service_%backup_date%
docker exec awana-mongodb-1 rm -rf /data/backup/receipt-service_%backup_date%

echo ✅ 백업이 완료되었습니다!
echo.
echo 📁 백업 위치: D:\awanadb\backup\
echo 📊 백업된 데이터베이스:
echo   - event-service_%backup_date%
echo   - church-service_%backup_date%
echo   - receipt-service_%backup_date%
echo.
echo 💡 백업 파일을 안전한 위치에 복사해두세요.
pause 