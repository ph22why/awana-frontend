@echo off
echo 🔄 MongoDB 데이터를 복구합니다...

REM 백업 디렉토리 확인
if not exist "D:\eventdb\backup" (
    echo ❌ 백업 디렉토리가 존재하지 않습니다.
    pause
    exit /b 1
)

REM MongoDB 컨테이너가 실행 중인지 확인
docker ps | findstr mongodb >nul
if %errorLevel% neq 0 (
    echo ❌ MongoDB 컨테이너가 실행 중이지 않습니다. 서비스를 먼저 시작해주세요.
    pause
    exit /b 1
)

echo 📁 사용 가능한 백업 목록:
dir "D:\eventdb\backup" /b /ad

echo.
set /p backup_folder="복구할 백업 폴더명을 입력하세요 (예: event-service_2024-01-01_12-00-00): "

REM 백업 폴더 존재 확인
if not exist "D:\eventdb\backup\%backup_folder%" (
    echo ❌ 지정한 백업 폴더가 존재하지 않습니다.
    pause
    exit /b 1
)

echo ⚠️ 경고: 기존 데이터가 덮어써집니다. 계속하시겠습니까?
set /p confirm="계속하려면 'yes'를 입력하세요: "
if not "%confirm%"=="yes" (
    echo ❌ 복구가 취소되었습니다.
    pause
    exit /b 1
)

echo 🔄 데이터를 복구합니다...

REM 백업 파일을 컨테이너로 복사
echo 📁 백업 파일을 컨테이너로 복사합니다...
docker cp "D:\eventdb\backup\%backup_folder%" awana-mongodb-1:/data/backup/

REM 데이터베이스 이름 추출 (폴더명에서)
for /f "tokens=1 delims=_" %%a in ("%backup_folder%") do set db_name=%%a

echo 📊 %db_name% 데이터베이스를 복구합니다...
docker exec awana-mongodb-1 mongorestore --username admin --password awana123 --authenticationDatabase admin --db %db_name% --drop /data/backup/%backup_folder%/%db_name%/

REM 컨테이너 내부의 임시 파일 정리
docker exec awana-mongodb-1 rm -rf /data/backup/%backup_folder%

echo ✅ 복구가 완료되었습니다!
echo.
echo 📊 복구된 데이터베이스: %db_name%
echo 💡 서비스를 재시작하여 변경사항을 적용하세요.
pause 