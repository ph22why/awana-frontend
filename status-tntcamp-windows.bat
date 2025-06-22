@echo off
chcp 65001
echo ====================================
echo TNT Camp 서비스 상태 확인
echo ====================================

echo [1] Docker 컨테이너 상태...
docker-compose -f docker-compose.https-awanaevent-final.yml ps

echo.
echo [2] 포트 사용 현황...
echo MongoDB (27017):
netstat -an | findstr :27017
echo MySQL (3306):
netstat -an | findstr :3306
echo HTTPS (443):
netstat -an | findstr :443
echo HTTP (80):
netstat -an | findstr :80

echo.
echo [3] 디스크 사용량...
echo MongoDB 데이터:
dir "D:\eventdb" /s | find "bytes"
echo MySQL 데이터:
dir "D:\tntcampdb" /s | find "bytes"

echo.
echo [4] 서비스 URL...
echo - 메인 서비스: https://awanaevent.com
echo - TNT Camp App: https://awanaevent.com/tntcamp
echo - TNT Camp Admin: https://awanaevent.com/tntadmin
echo - MongoDB: localhost:27017
echo - MySQL: localhost:3306

echo.
echo [5] 로그 확인 (최근 10줄)...
echo === 컨테이너 로그 ===
docker-compose -f docker-compose.https-awanaevent-final.yml logs --tail=10

echo.
echo ====================================
pause 