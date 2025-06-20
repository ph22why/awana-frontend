@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo 프론트엔드 재시작 중...

echo.
echo 1. 프론트엔드 컨테이너 중지 중...
docker-compose -f docker-compose.prod.yml stop frontend

echo.
echo 2. 프론트엔드 컨테이너 제거 중...
docker-compose -f docker-compose.prod.yml rm -f frontend

echo.
echo 3. 프론트엔드 이미지 재빌드 및 시작 중...
docker-compose -f docker-compose.prod.yml up -d --build frontend

echo.
echo 4. 프론트엔드 상태 확인 중...
timeout /t 3 > nul
docker ps | findstr frontend

echo.
echo 5. 프론트엔드 로그 확인 (최근 10줄):
docker logs --tail 10 awana-frontend-1

echo.
echo 프론트엔드 재시작 완료!
echo 사이트 URL: https://awanaevent.com

pause 