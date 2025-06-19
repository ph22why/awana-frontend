@echo off
chcp 65001
echo ====================================
echo 간단한 데이터 확인
echo ====================================
echo.

cd /d "%~dp0"

echo [1] 데이터베이스 목록 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "show dbs"

echo.
echo [2] Event Service API 테스트...
curl http://182.231.199.64:3001/api/events/

echo.
echo [3] Church Service API 테스트...
curl http://182.231.199.64:3002/api/churches/

echo.
echo [4] Receipt Service API 테스트...
curl http://182.231.199.64:3003/api/receipts/

echo.
echo [5] 서비스 상태...
docker ps | findstr service

echo.
pause 