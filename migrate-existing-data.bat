@echo off
chcp 65001
echo ====================================
echo 기존 데이터를 awana 데이터베이스로 마이그레이션
echo ====================================
echo.

cd /d "%~dp0"

echo 현재 각 서비스가 별도 데이터베이스를 사용하고 있는 경우
echo 모든 데이터를 통합 awana 데이터베이스로 이동시킵니다.
echo.

set /p CONFIRM="데이터 마이그레이션을 진행하시겠습니까? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo 마이그레이션이 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [1] 기존 데이터 백업 생성...
docker exec awana-mongodb-1 mongodump --out /data/backup/migration-backup --authenticationDatabase admin -u admin -p awana123

echo.
echo [2] 데이터 마이그레이션 실행...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
console.log('=== 데이터 마이그레이션 시작 ===');

// Event Service 데이터 마이그레이션
const eventServiceDb = db.getSiblingDB('event-service');
const awanaDb = db.getSiblingDB('awana');

// Events 컬렉션 마이그레이션
if (eventServiceDb.getCollectionNames().includes('events')) {
    const eventsCount = eventServiceDb.events.countDocuments();
    console.log('Migrating', eventsCount, 'events from event-service to awana...');
    
    if (eventsCount > 0) {
        const events = eventServiceDb.events.find().toArray();
        awanaDb.events.insertMany(events);
        console.log('✓ Events migrated successfully');
    }
}

// Sample Events 컬렉션 마이그레이션
if (eventServiceDb.getCollectionNames().includes('sampleevents')) {
    const sampleEventsCount = eventServiceDb.sampleevents.countDocuments();
    console.log('Migrating', sampleEventsCount, 'sample events...');
    
    if (sampleEventsCount > 0) {
        const sampleEvents = eventServiceDb.sampleevents.find().toArray();
        awanaDb.sampleevents.insertMany(sampleEvents);
        console.log('✓ Sample events migrated successfully');
    }
}

// Church Service 데이터 마이그레이션
const churchServiceDb = db.getSiblingDB('church-service');
if (churchServiceDb.getCollectionNames().includes('churches')) {
    const churchesCount = churchServiceDb.churches.countDocuments();
    console.log('Migrating', churchesCount, 'churches from church-service to awana...');
    
    if (churchesCount > 0) {
        const churches = churchServiceDb.churches.find().toArray();
        awanaDb.churches.insertMany(churches);
        console.log('✓ Churches migrated successfully');
    }
}

// Receipt Service 데이터 마이그레이션
const receiptServiceDb = db.getSiblingDB('receipt-service');
if (receiptServiceDb.getCollectionNames().includes('receipts')) {
    const receiptsCount = receiptServiceDb.receipts.countDocuments();
    console.log('Migrating', receiptsCount, 'receipts from receipt-service to awana...');
    
    if (receiptsCount > 0) {
        const receipts = receiptServiceDb.receipts.find().toArray();
        awanaDb.receipts.insertMany(receipts);
        console.log('✓ Receipts migrated successfully');
    }
}

console.log('\n=== 마이그레이션 결과 확인 ===');
console.log('awana 데이터베이스 컬렉션들:');
awanaDb.getCollectionNames().forEach(collection => {
    const count = awanaDb.getCollection(collection).countDocuments();
    console.log('- ' + collection + ':', count, 'documents');
});

console.log('\n=== 마이그레이션 완료 ===');
"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo 마이그레이션 성공! ✓
    echo ====================================
    echo.
    echo 이제 모든 서비스를 재시작해야 합니다.
    echo.
    set /p RESTART="서비스를 재시작하시겠습니까? (y/N): "
    if /i "%RESTART%"=="y" (
        echo.
        echo 서비스 재시작 중...
        docker-compose -f docker-compose.prod.yml restart event-service church-service receipt-service
        echo ✓ 서비스 재시작 완료
    )
) else (
    echo.
    echo 마이그레이션 중 오류가 발생했습니다.
    echo 백업에서 복구가 필요할 수 있습니다.
)

echo.
pause 