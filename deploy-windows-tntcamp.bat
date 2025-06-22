@echo off
chcp 65001
echo ====================================
echo AWANA TNT Camp 윈도우즈 배포
echo ====================================

echo [1] 데이터 디렉토리 생성...
if not exist "D:\eventdb" mkdir "D:\eventdb"
if not exist "D:\eventdb\data" mkdir "D:\eventdb\data"
if not exist "D:\eventdb\logs" mkdir "D:\eventdb\logs"
if not exist "D:\eventdb\backup" mkdir "D:\eventdb\backup"
if not exist "D:\tntcampdb" mkdir "D:\tntcampdb"
if not exist "D:\tntcampdb\mysql" mkdir "D:\tntcampdb\mysql"
if not exist "D:\tntcampdb\uploads" mkdir "D:\tntcampdb\uploads"
if not exist "D:\tntcampdb\logs" mkdir "D:\tntcampdb\logs"
if not exist "D:\tntcampdb\backup" mkdir "D:\tntcampdb\backup"

echo [2] 기존 서비스 중지...
docker-compose -f docker-compose.https-awanaevent-final.yml down

echo [3] 최신 코드로 빌드...
docker-compose -f docker-compose.https-awanaevent-final.yml build --no-cache

echo [4] 서비스 시작...
docker-compose -f docker-compose.https-awanaevent-final.yml up -d

echo [5] 서비스 상태 확인...
timeout /t 10 /nobreak
docker-compose -f docker-compose.https-awanaevent-final.yml ps

echo.
echo ====================================
echo TNT Camp 배포 완료!
echo - 메인 서비스: https://awanaevent.com
echo - TNT Camp App: https://awanaevent.com/tntcamp
echo - TNT Camp Admin: https://awanaevent.com/tntadmin
echo - MongoDB: localhost:27017
echo - MySQL: localhost:3306
echo ====================================
pause 