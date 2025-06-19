@echo off
chcp 65001
echo ====================================
echo MongoDB 연결 문제 안전 해결
echo ====================================
echo.

cd /d "%~dp0"

echo [1] MongoDB 컨테이너 상태 확인...
docker ps | findstr mongo
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB 컨테이너가 실행되지 않았습니다!
    echo 먼저 서비스를 시작하세요: .\restart-all-prod.bat
    pause
    exit /b 1
)

echo MongoDB 컨테이너가 실행 중입니다 ✓
echo.

echo [2] 간단한 MongoDB 연결 테스트...
echo 기본 연결 테스트를 시도합니다...
docker exec awana-mongodb-1 mongosh --version
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB Shell을 사용할 수 없습니다!
    pause
    exit /b 1
)

echo MongoDB Shell 사용 가능 ✓
echo.

echo [3] 인증 테스트...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "print('인증 성공')"
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB 인증에 실패했습니다!
    echo 비밀번호나 사용자명을 확인하세요.
    pause
    exit /b 1
)

echo MongoDB 인증 성공 ✓
echo.

echo [4] 데이터베이스 목록 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
try {
    const dbs = db.adminCommand('listDatabases').databases;
    console.log('=== 데이터베이스 목록 ===');
    dbs.forEach(database => {
        console.log('- ' + database.name);
    });
} catch(e) {
    console.log('데이터베이스 목록 조회 실패: ' + e.message);
}
"

echo.
echo [5] awana 데이터베이스 상태 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
try {
    use('awana');
    const collections = db.getCollectionNames();
    console.log('=== awana 데이터베이스 ===');
    if (collections.length === 0) {
        console.log('awana 데이터베이스가 비어있습니다.');
    } else {
        collections.forEach(collection => {
            try {
                const count = db.getCollection(collection).countDocuments();
                console.log('- ' + collection + ': ' + count + ' documents');
            } catch(e) {
                console.log('- ' + collection + ': 카운트 조회 실패');
            }
        });
    }
} catch(e) {
    console.log('awana 데이터베이스 접근 실패: ' + e.message);
}
"

echo.
echo [6] 기존 서비스 데이터베이스 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
const serviceDBs = ['event-service', 'church-service', 'receipt-service'];
console.log('=== 기존 서비스 데이터베이스 ===');
serviceDBs.forEach(dbName => {
    try {
        const targetDB = db.getSiblingDB(dbName);
        const collections = targetDB.getCollectionNames();
        if (collections.length > 0) {
            console.log(dbName + ' 데이터베이스 발견:');
            collections.forEach(collection => {
                try {
                    const count = targetDB.getCollection(collection).countDocuments();
                    console.log('  - ' + collection + ': ' + count + ' documents');
                } catch(e) {
                    console.log('  - ' + collection + ': 카운트 조회 실패');
                }
            });
        } else {
            console.log(dbName + ': 데이터 없음');
        }
    } catch(e) {
        console.log(dbName + ': 접근 실패 - ' + e.message);
    }
});
"

echo.
echo ====================================
echo 진단 완료!
echo ====================================
echo.
echo 다음 중 하나를 선택하세요:
echo.
echo 1) 기존 데이터가 있다면: .\migrate-data-to-awana.bat
echo 2) 데이터가 없다면: .\import-sample-data.bat
echo 3) 서비스 재시작: .\restart-all-prod.bat
echo.

set /p CHOICE="선택 (1/2/3 또는 Enter로 종료): "

if "%CHOICE%"=="1" (
    echo.
    echo 데이터 마이그레이션을 실행합니다...
    call migrate-data-to-awana.bat
) else if "%CHOICE%"=="2" (
    echo.
    echo 샘플 데이터를 추가합니다...
    call import-sample-data.bat
) else if "%CHOICE%"=="3" (
    echo.
    echo 서비스를 재시작합니다...
    call restart-all-prod.bat
) else (
    echo 진단만 완료되었습니다.
)

pause 