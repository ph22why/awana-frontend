@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo HTTPS 버전으로 전환 중...

echo.
echo 1. 현재 서비스 중지 중...
docker-compose -f docker-compose.prod.yml down

echo.
echo 2. HTTPS 버전 시작 중...
docker-compose -f docker-compose.https-awanaevent-final.yml up -d --build

echo.
echo 3. 서비스 상태 확인 중...
timeout /t 5 > nul
docker ps

echo.
echo 4. 프론트엔드 로그 확인 (최근 10줄):
docker logs --tail 10 awana-frontend-1

echo.
echo 전환 완료!
echo.
echo HTTP:  http://awanaevent.com
echo HTTPS: https://awanaevent.com
echo.
echo 이제 Church 관리 페이지에서 API가 제대로 작동할 것입니다.

pause 