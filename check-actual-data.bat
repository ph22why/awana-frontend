@echo off
chcp 65001
echo ====================================
echo 실제 데이터 확인 및 API 응답 점검
echo ====================================
echo.

cd /d "%~dp0"

echo [1] 각 데이터베이스의 실제 데이터 내용 확인...
echo.

echo === Event Service 데이터베이스 ===
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
use('event-service');
console.log('Collections:', db.getCollectionNames());
if (db.getCollectionNames().includes('events')) {
    const count = db.events.countDocuments();
    console.log('Events count:', count);
    if (count > 0) {
        console.log('Sample event:');
        const sample = db.events.findOne();
        console.log(JSON.stringify(sample, null, 2));
    }
}
"

echo.
echo === Church Service 데이터베이스 ===
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
use('church-service');
console.log('Collections:', db.getCollectionNames());
if (db.getCollectionNames().includes('churches')) {
    const count = db.churches.countDocuments();
    console.log('Churches count:', count);
    if (count > 0) {
        console.log('Sample church:');
        const sample = db.churches.findOne();
        console.log(JSON.stringify(sample, null, 2));
    }
}
"

echo.
echo === Receipt Service 데이터베이스 ===
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --quiet --eval "
use('receipt-service');
console.log('Collections:', db.getCollectionNames());
if (db.getCollectionNames().includes('receipts')) {
    const count = db.receipts.countDocuments();
    console.log('Receipts count:', count);
    if (count > 0) {
        console.log('Sample receipt:');
        const sample = db.receipts.findOne();
        console.log(JSON.stringify(sample, null, 2));
    }
}
"

echo.
echo [2] API 응답 상세 확인...
echo.

echo === Event API 응답 ===
curl -v http://182.231.199.64:3001/api/events/

echo.
echo === Church API 응답 ===
curl -v http://182.231.199.64:3002/api/churches/

echo.
echo === Receipt API 응답 ===
curl -v http://182.231.199.64:3003/api/receipts/

echo.
echo [3] 서비스 로그 확인 (최근 10줄)...
echo.

echo === Event Service 로그 ===
docker logs awana-event-service-1 --tail 10

echo.
echo === Church Service 로그 ===
docker logs awana-church-service-1 --tail 10

echo.
echo === Receipt Service 로그 ===
docker logs awana-receipt-service-1 --tail 10

echo.
echo [4] 프론트엔드에서 실제 요청하는 URL 확인...
echo 브라우저 개발자 도구 Network 탭에서 확인해야 할 것들:
echo - 요청 URL이 올바른지
echo - 응답 상태 코드
echo - 응답 데이터 형식
echo.

pause 