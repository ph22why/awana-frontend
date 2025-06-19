@echo off
chcp 65001
echo ====================================
echo MongoDB 연결 및 데이터 확인
echo ====================================
echo.

cd /d "%~dp0"

echo [1] D:\eventdb 디렉토리 구조 확인...
echo.
if exist "D:\eventdb" (
    echo D:\eventdb 디렉토리 존재 ✓
    dir "D:\eventdb" /b
    echo.
    
    if exist "D:\eventdb\data" (
        echo D:\eventdb\data 디렉토리 존재 ✓
        echo 데이터 파일 크기:
        dir "D:\eventdb\data" /s
    ) else (
        echo D:\eventdb\data 디렉토리가 없습니다!
    )
) else (
    echo D:\eventdb 디렉토리가 없습니다!
)

echo.
echo [2] MongoDB 컨테이너 상태 확인...
docker ps | findstr mongo
echo.

echo [3] MongoDB 컨테이너 로그 확인...
docker logs awana-mongodb-1 --tail 20

echo.
echo [4] MongoDB에 연결하여 데이터베이스 목록 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
console.log('=== Current Data Status ===');

// Check event-service database
use('event-service');
const eventCount = db.events.countDocuments();
console.log('event-service.events: ' + eventCount + ' documents');

// Check church-service database  
use('church-service');
const churchCount = db.churches.countDocuments();
console.log('church-service.churches: ' + churchCount + ' documents');

// Check receipt-service database
use('receipt-service');
const receiptCount = db.receipts.countDocuments();
console.log('receipt-service.receipts: ' + receiptCount + ' documents');

// Check awana database
use('awana');
const awanaEventCount = db.events.countDocuments();
const awanaChurchCount = db.churches.countDocuments();
const awanaReceiptCount = db.receipts.countDocuments();
console.log('awana.events: ' + awanaEventCount + ' documents');
console.log('awana.churches: ' + awanaChurchCount + ' documents');
console.log('awana.receipts: ' + awanaReceiptCount + ' documents');

console.log('\n=== Sample Data Preview ===');
if (awanaEventCount > 0) {
    const sampleEvent = db.events.findOne();
    console.log('Sample Event: ' + sampleEvent.event_Name);
}
if (awanaChurchCount > 0) {
    const sampleChurch = db.churches.findOne();
    console.log('Sample Church: ' + sampleChurch.name);
}
"

echo.
echo [5] 데이터 마이그레이션이 필요한지 확인...
echo 만약 기존 데이터가 다른 데이터베이스에 있다면 마이그레이션이 필요합니다.
echo.

pause 