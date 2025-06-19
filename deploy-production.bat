@echo off
chcp 65001
echo ====================================
echo AWANA 프로덕션 HTTPS 배포
echo ====================================

echo [1] 기존 서비스 중지...
docker-compose -f docker-compose.https-awanaevent-final.yml down

echo [2] 최신 코드로 빌드...
docker-compose -f docker-compose.https-awanaevent-final.yml build --no-cache

echo [3] 서비스 시작...
docker-compose -f docker-compose.https-awanaevent-final.yml up -d

echo [4] 서비스 상태 확인...
timeout /t 5 /nobreak
docker-compose -f docker-compose.https-awanaevent-final.yml ps

echo.
echo ====================================
echo HTTPS 서비스 배포 완료!
echo - Frontend: https://awanaevent.com
echo - MongoDB: localhost:27017
echo ====================================
pause 