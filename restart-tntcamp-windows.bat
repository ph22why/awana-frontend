@echo off
chcp 65001
echo ====================================
echo TNT Camp 서비스 재시작
echo ====================================

echo [1] 서비스 중지...
docker-compose -f docker-compose.https-awanaevent-final.yml restart

echo [2] 서비스 상태 확인...
timeout /t 5 /nobreak
docker-compose -f docker-compose.https-awanaevent-final.yml ps

echo.
echo ====================================
echo 재시작 완료!
echo - 메인 서비스: https://awanaevent.com
echo - TNT Camp App: https://awanaevent.com/tntcamp
echo - TNT Camp Admin: https://awanaevent.com/tntadmin
echo ====================================
pause 