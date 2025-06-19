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
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
console.log('=== 데이터베이스 목록 ===');
db.adminCommand('listDatabases').databases.forEach(db => {
    console.log('Database:', db.name, '- Size:', db.sizeOnDisk || 0);
});

console.log('\n=== awana 데이터베이스 확인 ===');
use awana;
console.log('Collections in awana database:');
db.getCollectionNames().forEach(collection => {
    console.log('- ' + collection + ':', db.getCollection(collection).countDocuments());
});

console.log('\n=== 기존 데이터베이스들 확인 ===');
['event-service', 'church-service', 'receipt-service'].forEach(dbName => {
    const result = db.adminCommand('listDatabases').databases.find(db => db.name === dbName);
    if (result) {
        console.log('Found database:', dbName);
        const collections = db.getSiblingDB(dbName).getCollectionNames();
        console.log('Collections:', collections);
        collections.forEach(collection => {
            const count = db.getSiblingDB(dbName).getCollection(collection).countDocuments();
            console.log('  - ' + collection + ':', count, 'documents');
        });
    }
});
"

echo.
echo [5] 데이터 마이그레이션이 필요한지 확인...
echo 만약 기존 데이터가 다른 데이터베이스에 있다면 마이그레이션이 필요합니다.
echo.

pause 