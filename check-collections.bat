@echo off
chcp 65001
echo ====================================
echo 컬렉션 및 데이터 구조 확인
echo ====================================
echo.

cd /d "%~dp0"

echo [1] Event Service 데이터베이스 내용...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('event-service'); db.getCollectionNames()"

echo.
echo Event Service - 모든 컬렉션의 문서 수:
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('event-service'); db.getCollectionNames().forEach(col => print(col + ': ' + db.getCollection(col).countDocuments()))"

echo.
echo [2] Church Service 데이터베이스 내용...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('church-service'); db.getCollectionNames()"

echo.
echo Church Service - 모든 컬렉션의 문서 수:
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('church-service'); db.getCollectionNames().forEach(col => print(col + ': ' + db.getCollection(col).countDocuments()))"

echo.
echo [3] Receipt Service 데이터베이스 내용...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('receipt-service'); db.getCollectionNames()"

echo.
echo Receipt Service - 모든 컬렉션의 문서 수:
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('receipt-service'); db.getCollectionNames().forEach(col => print(col + ': ' + db.getCollection(col).countDocuments()))"

echo.
echo [4] 샘플 데이터 확인 (각 컬렉션에서 1개씩)...
echo.
echo Event Service 샘플:
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('event-service'); db.getCollectionNames().forEach(col => { if(db.getCollection(col).countDocuments() > 0) { print('=== ' + col + ' ==='); printjson(db.getCollection(col).findOne()); } })"

echo.
echo Church Service 샘플:
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('church-service'); db.getCollectionNames().forEach(col => { if(db.getCollection(col).countDocuments() > 0) { print('=== ' + col + ' ==='); printjson(db.getCollection(col).findOne()); } })"

echo.
echo Receipt Service 샘플:
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "use('receipt-service'); db.getCollectionNames().forEach(col => { if(db.getCollection(col).countDocuments() > 0) { print('=== ' + col + ' ==='); printjson(db.getCollection(col).findOne()); } })"

echo.
pause 