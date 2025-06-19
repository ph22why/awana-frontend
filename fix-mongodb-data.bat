@echo off
chcp 65001
echo ====================================
echo MongoDB 데이터 문제 해결
echo ====================================
echo.

cd /d "%~dp0"

echo 이 스크립트는 MongoDB 데이터 문제를 자동으로 해결합니다.
echo.

echo [1단계] 현재 데이터 상태 확인 중...
call check-mongodb-connection.bat

echo.
echo [2단계] 기존 데이터 마이그레이션 실행...
echo 기존에 작동했던 migrate-data-to-awana.bat를 실행합니다.
call migrate-data-to-awana.bat

echo.
echo [3단계] 데이터가 부족한 경우 샘플 데이터 추가...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
use('awana');
const eventCount = db.events.countDocuments();
const churchCount = db.churches.countDocuments();
console.log('Current data: Events=' + eventCount + ', Churches=' + churchCount);

if (eventCount === 0 || churchCount === 0) {
    console.log('Need to add sample data');
    process.exit(1);
} else {
    console.log('Data is sufficient');
    process.exit(0);
}
"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo 데이터가 부족합니다. 샘플 데이터를 추가합니다...
    call import-sample-data.bat
)

echo.
echo [4단계] 서비스 재시작...
echo Backend 서비스들을 재시작하여 새로운 데이터를 적용합니다.
call restart-backend-services.bat

echo.
echo ====================================
echo MongoDB 데이터 문제 해결 완료! ✓
echo ====================================
echo.
echo 이제 웹사이트 http://182.231.199.64:3000 에서
echo 이벤트와 교회 데이터를 확인할 수 있습니다.
echo.
pause 