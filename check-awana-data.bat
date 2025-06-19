@echo off
chcp 65001
echo ====================================
echo AWANA 데이터베이스 확인
echo ====================================
echo.

cd /d "%~dp0"

echo [1] AWANA 데이터베이스 컬렉션 목록...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('awana'); db.getCollectionNames()"

echo.
echo [2] AWANA 데이터베이스 - 모든 컬렉션의 문서 수...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('awana'); db.getCollectionNames().forEach(col => print(col + ': ' + db.getCollection(col).countDocuments()))"

echo.
echo [3] AWANA 데이터베이스 - 샘플 데이터...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('awana'); db.getCollectionNames().forEach(col => { if(db.getCollection(col).countDocuments() > 0) { print('=== ' + col + ' ==='); printjson(db.getCollection(col).findOne()); } })"

echo.
echo ====================================
echo 해결 방안:
echo ====================================
echo.
echo 만약 awana 데이터베이스에 실제 데이터가 있다면:
echo 1) 기존 migrate-data-to-awana.bat를 반대로 실행
echo 2) awana에서 각 서비스 DB로 데이터 복사
echo 3) 또는 모든 서비스를 awana DB로 다시 설정
echo.
pause 