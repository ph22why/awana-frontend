@echo off
echo 🚀 AWANA 프로덕션 환경을 시작합니다 (182.231.199.64)...

REM MongoDB 데이터 디렉토리 확인
if not exist "D:\eventdb\data" (
    echo ❌ MongoDB 데이터 디렉토리가 존재하지 않습니다.
    echo ⚙️ setup-mongodb-windows.bat를 먼저 실행해주세요.
    pause
    exit /b 1
)

REM Docker Compose로 모든 서비스 실행 (프로덕션 환경)
echo 📦 프로덕션 서비스들을 빌드하고 실행합니다...
docker-compose -f docker-compose.prod.yml up --build -d

echo ⏳ 서비스들이 시작되는 동안 잠시 기다립니다...
timeout /t 15 /nobreak > nul

echo ✅ 프로덕션 서비스 상태 확인:
docker-compose -f docker-compose.prod.yml ps

echo.
echo 🌐 프로덕션 환경 엔드포인트:
echo   - Frontend: http://182.231.199.64:3000
echo   - Event Service: http://182.231.199.64:3001
echo   - Church Service: http://182.231.199.64:3002
echo   - Receipt Service: http://182.231.199.64:3003
echo   - MongoDB: 182.231.199.64:27017
echo.
echo 📊 로그 확인: docker-compose -f docker-compose.prod.yml logs -f [service-name]
echo 🛑 서비스 중지: docker-compose -f docker-compose.prod.yml down
pause 