@echo off
chcp 65001
echo ====================================
echo Atlas 데이터를 로컬 D:\db로 복원
echo ====================================
echo.

cd /d "%~dp0"

echo 덤프된 데이터:
echo - event-service: 8개 이벤트 + 17개 샘플 이벤트
echo - church-service: 437개 교회 + 17개 샘플 이벤트
echo - receipt-service: 632개 영수증
echo.

echo [1] D:\db 디렉토리 구조 생성...
if not exist "D:\db" mkdir "D:\db"
if not exist "D:\db\data" mkdir "D:\db\data"
if not exist "D:\db\logs" mkdir "D:\db\logs"
if not exist "D:\db\backup" mkdir "D:\db\backup"

echo D:\db 디렉토리 구조 생성 완료 ✓
echo.

echo [2] Docker Compose 설정을 D:\db로 변경...
echo 현재 docker-compose.prod.yml 백업...
copy docker-compose.prod.yml docker-compose.prod.backup-%date:~0,4%%date:~5,2%%date:~8,2%.yml

echo Docker Compose 볼륨 경로를 D:\db로 변경...
powershell -Command "(Get-Content docker-compose.prod.yml) -replace 'D:\\eventdb', 'D:\db' | Set-Content docker-compose.prod.yml"

echo 볼륨 경로 변경 완료 ✓
echo.

echo [3] 기존 서비스 중지...
docker-compose -f docker-compose.prod.yml down

echo.
echo [4] 새로운 D:\db 경로로 MongoDB 시작...
docker-compose -f docker-compose.prod.yml up mongodb -d

echo MongoDB 시작 대기 중...
timeout /t 10 /nobreak >nul

echo.
echo [5] Atlas 덤프 데이터 복원...
echo.
echo 덤프 파일 위치 확인...
if exist "C:\Users\awana\Downloads\dump\atlas_backup" (
    set DUMP_PATH=C:\Users\awana\Downloads\dump\atlas_backup
    echo 덤프 파일 발견: C:\Users\awana\Downloads\dump\atlas_backup ✓
) else if exist "D:\dump\atlas_backup" (
    set DUMP_PATH=D:\dump\atlas_backup
    echo 덤프 파일 발견: D:\dump\atlas_backup ✓
) else (
    echo 덤프 파일을 찾을 수 없습니다!
    echo 덤프 파일 경로를 수동으로 입력하세요.
    set /p DUMP_PATH="덤프 파일 경로 입력: "
)

echo.
echo 데이터 복원 중...
echo Event Service 데이터 복원...
C:\Users\awana\Downloads\mongodb-database-tools-windows-x86_64-100.12.2\mongodb-database-tools-windows-x86_64-100.12.2\bin\mongorestore --host localhost:27017 --username admin --password awana123 --authenticationDatabase admin --db event-service "%DUMP_PATH%\event-service"

echo.
echo Church Service 데이터 복원...
C:\Users\awana\Downloads\mongodb-database-tools-windows-x86_64-100.12.2\mongodb-database-tools-windows-x86_64-100.12.2\bin\mongorestore --host localhost:27017 --username admin --password awana123 --authenticationDatabase admin --db church-service "%DUMP_PATH%\church-service"

echo.
echo Receipt Service 데이터 복원...
C:\Users\awana\Downloads\mongodb-database-tools-windows-x86_64-100.12.2\mongodb-database-tools-windows-x86_64-100.12.2\bin\mongorestore --host localhost:27017 --username admin --password awana123 --authenticationDatabase admin --db receipt-service "%DUMP_PATH%\receipt-service"

echo.
echo [6] 복원된 데이터 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
console.log('=== 복원된 데이터 확인 ===');
['event-service', 'church-service', 'receipt-service'].forEach(dbName => {
    const db = db.getSiblingDB(dbName);
    console.log(dbName + ':');
    db.getCollectionNames().forEach(collection => {
        const count = db.getCollection(collection).countDocuments();
        console.log('  - ' + collection + ': ' + count + ' documents');
    });
});
"

echo.
echo [7] 모든 서비스 시작...
docker-compose -f docker-compose.prod.yml up -d --build

echo.
echo 서비스 시작 대기...
timeout /t 15 /nobreak >nul

echo.
echo [8] 최종 확인...
echo.
echo === 서비스 상태 ===
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo === API 테스트 ===
echo Event API:
curl -s http://182.231.199.64:3001/api/events/ | echo

echo.
echo Church API:
curl -s http://182.231.199.64:3002/api/churches/ | echo

echo.
echo Receipt API:
curl -s http://182.231.199.64:3003/api/receipts/ | echo

echo.
echo ====================================
echo 복원 완료! ✓
echo ====================================
echo.
echo ✓ 데이터가 D:\db에 저장됨
echo ✓ Docker가 D:\db 사용하도록 설정됨
echo ✓ Atlas 데이터 복원 완료:
echo   - Events: 8개 + 샘플 17개
echo   - Churches: 437개 + 샘플 17개  
echo   - Receipts: 632개
echo.
echo Frontend 접속: http://182.231.199.64:3000
echo.
pause 