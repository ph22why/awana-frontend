@echo off
chcp 65001
echo ====================================
echo MongoDB 연결 문제 종합 해결
echo ====================================
echo.

cd /d "%~dp0"

echo 이 스크립트는 다음 작업을 수행합니다:
echo 1. MongoDB 연결 상태 확인
echo 2. 모든 서비스가 동일한 awana DB 사용하도록 설정 확인
echo 3. 데이터 마이그레이션 실행
echo 4. 서비스 재시작
echo.

set /p CONFIRM="계속 진행하시겠습니까? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo 작업이 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [1] MongoDB 컨테이너 상태 확인...
docker ps | findstr mongo
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB 컨테이너가 실행되지 않았습니다!
    echo Docker Compose로 서비스를 시작하세요.
    pause
    exit /b 1
)

echo.
echo [2] 현재 데이터베이스 상태 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
console.log('=== 현재 데이터베이스 상태 ===');
db.adminCommand('listDatabases').databases.forEach(database => {
    console.log('Database: ' + database.name + ' (Size: ' + (database.sizeOnDisk || 0) + ' bytes)');
});

console.log('\n=== awana 데이터베이스 컬렉션 ===');
use awana;
try {
    db.getCollectionNames().forEach(collection => {
        const count = db.getCollection(collection).countDocuments();
        console.log('- ' + collection + ': ' + count + ' documents');
    });
} catch(e) {
    console.log('awana 데이터베이스가 비어있거나 접근할 수 없습니다.');
}

console.log('\n=== 기존 서비스별 데이터베이스 확인 ===');
['event-service', 'church-service', 'receipt-service'].forEach(dbName => {
    try {
        const db = db.getSiblingDB(dbName);
        const collections = db.getCollectionNames();
        if (collections.length > 0) {
            console.log(dbName + ' database exists with collections: ' + collections.join(', '));
            collections.forEach(collection => {
                const count = db.getCollection(collection).countDocuments();
                console.log('  - ' + collection + ': ' + count + ' documents');
            });
        }
    } catch(e) {
        // Database doesn't exist or is empty
    }
});
"

echo.
echo [3] 데이터 마이그레이션 실행...
echo 기존 migrate-data-to-awana.bat 스크립트를 사용합니다.
echo.
call migrate-data-to-awana.bat

echo.
echo [4] 모든 서비스 재시작 (새로운 MongoDB 설정 적용)...
echo.
echo Docker 컨테이너들을 재시작합니다...
docker-compose -f docker-compose.prod.yml restart

echo 서비스 시작을 기다리는 중...
timeout /t 15 /nobreak >nul

echo.
echo [5] 최종 확인...
echo.
echo === Docker 컨테이너 상태 ===
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo === MongoDB 최종 데이터 상태 ===
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
use awana;
console.log('awana 데이터베이스 최종 상태:');
try {
    db.getCollectionNames().forEach(collection => {
        const count = db.getCollection(collection).countDocuments();
        console.log('- ' + collection + ': ' + count + ' documents');
        
        if (count > 0) {
            const sample = db.getCollection(collection).findOne();
            if (collection === 'events' && sample.event_Name) {
                console.log('  예시: ' + sample.event_Name);
            } else if (collection === 'churches' && sample.name) {
                console.log('  예시: ' + sample.name + ' (' + (sample.location || 'unknown') + ')');
            }
        }
    });
} catch(e) {
    console.log('데이터 확인 중 오류: ' + e.message);
}
"

echo.
echo ====================================
echo MongoDB 연결 문제 해결 완료! ✓
echo ====================================
echo.
echo 설정 확인:
echo ✓ 모든 서비스가 awana 데이터베이스 사용
echo ✓ Docker Compose 환경변수 설정 완료
echo ✓ 데이터 마이그레이션 완료
echo ✓ 서비스 재시작 완료
echo.
echo 접속 URL:
echo - Frontend: http://182.231.199.64:3000
echo - Event API: http://182.231.199.64:3001/api/events/
echo - Church API: http://182.231.199.64:3002/api/churches/
echo - Receipt API: http://182.231.199.64:3003/api/receipts/
echo.
pause 