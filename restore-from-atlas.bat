@echo off
chcp 65001
echo ====================================
echo MongoDB Atlas에서 데이터 복원
echo ====================================
echo.

cd /d "%~dp0"

echo 현재 모든 데이터베이스가 비어있는 상태입니다.
echo Atlas에서 데이터를 복원하는 방법:
echo.

echo [방법 1] mongodump/mongorestore 사용
echo ========================================
echo.
echo 1. Atlas에서 데이터 다운로드:
echo    mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/database"
echo.
echo 2. 로컬 MongoDB로 복원:
echo    mongorestore --host localhost:27017 --username admin --password awana123 --authenticationDatabase admin dump/
echo.

echo [방법 2] 직접 연결 설정
echo ========================================
echo.
echo 서비스들을 Atlas에 직접 연결하도록 설정 변경
echo - Docker Compose의 MONGODB_URI를 Atlas URI로 변경
echo - 로컬 MongoDB 대신 Atlas 사용
echo.

echo [방법 3] Atlas 백업 복원
echo ========================================
echo.
echo Atlas 대시보드에서:
echo 1. Clusters → 백업 탭
echo 2. 최근 백업 선택
echo 3. 복원 옵션 선택
echo.

echo ====================================
echo 추천 방법:
echo ====================================
echo.
echo Atlas Connection String이 있다면 방법 2가 가장 간단합니다.
echo.

set /p ATLAS_URI="Atlas Connection String을 입력하세요 (또는 Enter로 건너뛰기): "

if not "%ATLAS_URI%"=="" (
    echo.
    echo Atlas URI로 서비스 설정을 변경하시겠습니까?
    set /p CHANGE_CONFIG="(y/N): "
    
    if /i "%CHANGE_CONFIG%"=="y" (
        echo.
        echo Docker Compose 설정을 Atlas URI로 변경합니다...
        echo.
        echo 현재 docker-compose.prod.yml 백업 생성...
        copy docker-compose.prod.yml docker-compose.prod.backup.yml
        
        echo.
        echo [주의] 수동으로 다음을 수정해야 합니다:
        echo docker-compose.prod.yml 파일에서
        echo MONGODB_URI를 다음으로 변경:
        echo MONGODB_URI=%ATLAS_URI%
        echo.
        echo 수정 후 서비스 재시작:
        echo .\restart-with-existing-data.bat
    )
) else (
    echo.
    echo Atlas Connection String이 필요합니다.
    echo.
    echo Atlas에서 Connection String 가져오는 방법:
    echo 1. Atlas 대시보드 로그인
    echo 2. Clusters → Connect
    echo 3. "Connect your application" 선택
    echo 4. Connection string 복사
    echo.
    echo 예시: mongodb+srv://username:password@cluster.mongodb.net/database
)

echo.
echo ====================================
echo 임시 해결책: 샘플 데이터 생성
echo ====================================
echo.
echo Atlas 복원 전까지 테스트용 샘플 데이터를 생성할 수도 있습니다.
echo.
set /p CREATE_SAMPLE="샘플 데이터를 생성하시겠습니까? (y/N): "

if /i "%CREATE_SAMPLE%"=="y" (
    echo.
    echo awana 데이터베이스에 샘플 데이터 생성 중...
    
    docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "
    use('awana');
    
    // 샘플 이벤트 생성
    db.events.insertMany([
        {
            event_Name: '2024 AWANA 여름캠프',
            event_Description: '여름 특별 캠프',
            event_Location: '경기도 양평',
            event_Year: 2024,
            event_Start_Date: new Date('2024-07-15'),
            event_End_Date: new Date('2024-07-17'),
            event_Registration_Start_Date: new Date('2024-06-01'),
            event_Registration_End_Date: new Date('2024-07-10'),
            event_Open_Available: '공개',
            event_Place: '양평수련원',
            event_Month: 7,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);
    
    // 샘플 교회 생성
    db.churches.insertMany([
        {
            mainId: '001',
            subId: '001',
            name: '서울중앙교회',
            managerName: '김목사',
            phone: '02-1234-5678',
            address: '서울시 중구',
            location: '서울',
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);
    
    console.log('샘플 데이터 생성 완료');
    console.log('Events:', db.events.countDocuments());
    console.log('Churches:', db.churches.countDocuments());
    "
    
    echo.
    echo 샘플 데이터 생성 완료!
    echo 서비스들을 awana 데이터베이스로 다시 설정해야 합니다.
)

echo.
pause 