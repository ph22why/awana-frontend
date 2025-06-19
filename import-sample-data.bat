@echo off
chcp 65001
echo ====================================
echo 샘플 데이터 가져오기
echo ====================================
echo.

cd /d "%~dp0"

echo MongoDB에 샘플 데이터를 추가합니다.
echo 기존 데이터가 있는 경우 건너뛸 수 있습니다.
echo.

echo [1] 현재 데이터 상태 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
use('awana');
console.log('=== 현재 데이터 상태 ===');
const eventCount = db.events.countDocuments();
const churchCount = db.churches.countDocuments();
const receiptCount = db.receipts.countDocuments();
console.log('events: ' + eventCount + ' documents');
console.log('churches: ' + churchCount + ' documents');
console.log('receipts: ' + receiptCount + ' documents');
"

echo.
set /p CONTINUE="샘플 데이터를 추가하시겠습니까? (y/N): "
if /i not "%CONTINUE%"=="y" (
    echo 샘플 데이터 추가가 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [2] 샘플 이벤트 데이터 추가...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
use('awana');

// 샘플 이벤트 데이터
const sampleEvents = [
    {
        event_Name: '2024 AWANA 여름 캠프',
        event_Description: '여름 특별 AWANA 캠프 프로그램',
        event_Location: '경기도 양평',
        event_Year: 2024,
        event_Start_Date: new Date('2024-07-15'),
        event_End_Date: new Date('2024-07-17'),
        event_Registration_Start_Date: new Date('2024-06-01'),
        event_Registration_End_Date: new Date('2024-07-10'),
        event_Open_Available: '공개',
        event_Place: '양평 수련원',
        event_Month: 7,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        event_Name: '2024 AWANA 가을 축제',
        event_Description: '가을을 맞이하는 특별한 AWANA 행사',
        event_Location: '서울시 강남구',
        event_Year: 2024,
        event_Start_Date: new Date('2024-10-12'),
        event_End_Date: new Date('2024-10-12'),
        event_Registration_Start_Date: new Date('2024-09-01'),
        event_Registration_End_Date: new Date('2024-10-05'),
        event_Open_Available: '공개',
        event_Place: '강남 교회',
        event_Month: 10,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

if (db.events.countDocuments() === 0) {
    db.events.insertMany(sampleEvents);
    console.log('✓ 샘플 이벤트', sampleEvents.length, '개 추가됨');
} else {
    console.log('기존 이벤트 데이터가 있어 건너뜀');
}
"

echo.
echo [3] 샘플 교회 데이터 추가...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
use('awana');

// 샘플 교회 데이터
const sampleChurches = [
    {
        mainId: '001',
        subId: '001',
        name: '서울중앙교회',
        managerName: '김담임',
        phone: '02-1234-5678',
        address: '서울시 중구 명동',
        location: '서울',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        mainId: '002',
        subId: '001',
        name: '부산해운대교회',
        managerName: '이목사',
        phone: '051-9876-5432',
        address: '부산시 해운대구',
        location: '부산',
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        mainId: '003',
        subId: '001',
        name: '대구수성교회',
        managerName: '박전도사',
        phone: '053-1111-2222',
        address: '대구시 수성구',
        location: '대구',
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

if (db.churches.countDocuments() === 0) {
    db.churches.insertMany(sampleChurches);
    console.log('✓ 샘플 교회', sampleChurches.length, '개 추가됨');
} else {
    console.log('기존 교회 데이터가 있어 건너뜀');
}
"

echo.
echo [4] 최종 데이터 확인...
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
use('awana');
console.log('=== Final Data Count in AWANA Database ===');
console.log('Events: ' + db.events.countDocuments());
console.log('Churches: ' + db.churches.countDocuments());
console.log('Receipts: ' + db.receipts.countDocuments());

console.log('\n=== Sample Data ===');
if (db.events.countDocuments() > 0) {
    console.log('Sample Event:');
    const sampleEvent = db.events.findOne();
    console.log('- Event Name: ' + sampleEvent.event_Name);
    console.log('- Event Location: ' + sampleEvent.event_Location);
}

if (db.churches.countDocuments() > 0) {
    console.log('Sample Church:');
    const sampleChurch = db.churches.findOne();
    console.log('- Church Name: ' + sampleChurch.name);
    console.log('- Church Location: ' + sampleChurch.location);
}
"

echo.
echo ====================================
echo 샘플 데이터 추가 완료! ✓
echo ====================================
echo.
echo 이제 웹사이트에서 데이터를 확인할 수 있습니다.
echo Frontend URL: http://182.231.199.64:3000
echo.
pause 