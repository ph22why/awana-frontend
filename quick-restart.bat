@echo off
chcp 65001
echo ====================================
echo AWANA 서비스 빠른 재시작
echo ====================================

echo [1] 서비스 재시작...
docker-compose -f docker-compose.https-awanaevent-final.yml restart

echo [2] 서비스 상태 확인...
timeout /t 3 /nobreak
docker-compose -f docker-compose.https-awanaevent-final.yml ps

echo.
echo ====================================
echo 재시작 완료!
echo ==================================== 