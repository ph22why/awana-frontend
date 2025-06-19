@echo off
chcp 65001
echo ====================================
echo 간단한 데이터 마이그레이션
echo ====================================
echo.

cd /d "%~dp0"

echo 디버그 결과를 보니 데이터가 여러 데이터베이스에 분산되어 있습니다:
echo - awana: 68 KB (일부 데이터)
echo - church-service: 28 KB (교회 데이터)
echo - event-service: 20 KB (이벤트 데이터)
echo - receipt-service: 20 KB (영수증 데이터)
echo.
echo 모든 데이터를 awana 데이터베이스로 통합합니다.
echo.

set /p PROCEED="데이터 마이그레이션을 진행하시겠습니까? (y/N): "
if /i not "%PROCEED%"=="y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [1] 기존 작동했던 migrate-data-to-awana.bat 실행...
call migrate-data-to-awana.bat

echo.
echo [2] 마이그레이션 결과 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "show dbs"

echo.
echo [3] awana 데이터베이스 내용 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use awana; show collections"

echo.
echo [4] 각 컬렉션 문서 수 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use awana; db.events.countDocuments()"
echo Events 문서 수: 위 숫자

docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use awana; db.churches.countDocuments()"
echo Churches 문서 수: 위 숫자

docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use awana; db.receipts.countDocuments()"
echo Receipts 문서 수: 위 숫자

echo.
echo [5] 백엔드 서비스 재시작...
echo CORS 문제도 함께 해결하기 위해 백엔드를 재시작합니다.
docker-compose -f docker-compose.prod.yml restart event-service church-service receipt-service

echo.
echo 서비스 재시작 완료를 기다리는 중...
timeout /t 10 /nobreak >nul

echo.
echo [6] 최종 상태 확인...
docker ps | findstr service

echo.
echo ====================================
echo 마이그레이션 완료! ✓
echo ====================================
echo.
echo 이제 웹사이트를 새로고침하고 데이터가 표시되는지 확인하세요.
echo Frontend: http://182.231.199.64:3000
echo.
echo API 테스트:
echo - Events: http://182.231.199.64:3001/api/events/
echo - Churches: http://182.231.199.64:3002/api/churches/
echo - Receipts: http://182.231.199.64:3003/api/receipts/
echo.
pause 