@echo off
chcp 65001 > nul
cd /d "%~dp0"

echo Church Service API 테스트 중...

echo.
echo 1. Church Service 컨테이너 상태 확인:
docker ps | findstr church-service

echo.
echo 2. Church Service 로그 확인 (최근 20줄):
docker logs --tail 20 awana-church-service-1

echo.
echo 3. Church Service API 응답 테스트:
echo GET http://112.145.65.29:3002/api/churches?page=1^&limit=15
echo.

curl -s -w "HTTP Status: %%{http_code}\n" "http://112.145.65.29:3002/api/churches?page=1&limit=15" || echo "연결 실패"

echo.
echo 4. 로컬호스트에서도 테스트:
curl -s -w "HTTP Status: %%{http_code}\n" "http://localhost:3002/api/churches?page=1&limit=15" || echo "로컬호스트 연결 실패"

echo.
echo 테스트 완료!
pause 