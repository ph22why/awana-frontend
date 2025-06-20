@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo Church Service 재시작 중...

echo.
echo 1. Church Service 중지 중...
docker-compose -f docker-compose.prod.yml stop church-service

echo.
echo 2. Church Service 컨테이너 제거 중...
docker-compose -f docker-compose.prod.yml rm -f church-service

echo.
echo 3. Church Service 이미지 재빌드 및 시작 중...
docker-compose -f docker-compose.prod.yml up -d --build church-service

echo.
echo 4. Church Service 상태 확인 중...
timeout /t 3 > nul
docker ps | findstr church-service

echo.
echo Church Service 재시작 완료!
echo.
echo 포트 3002가 노출되었는지 확인해보세요.
echo Church Service URL: http://182.231.199.64:3002

pause 