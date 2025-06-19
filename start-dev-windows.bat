@echo off
echo 🚀 AWANA 개발 환경을 시작합니다...

REM MongoDB 데이터 디렉토리 확인
if not exist "D:\eventdb\data" (
    echo ❌ MongoDB 데이터 디렉토리가 존재하지 않습니다.
    echo ⚙️ setup-mongodb-windows.bat를 먼저 실행해주세요.
    pause
    exit /b 1
)

REM Docker Compose로 백엔드 서비스만 실행 (개발 환경)
echo 📦 백엔드 서비스들을 실행합니다...
docker-compose -f docker-compose.dev.yml up --build -d

echo ⏳ 서비스들이 시작되는 동안 잠시 기다립니다...
timeout /t 10 /nobreak > nul

echo ✅ 백엔드 서비스 상태 확인:
docker-compose -f docker-compose.dev.yml ps

echo.
echo 🌐 개발 환경 엔드포인트:
echo   - Event Service: http://localhost:3001
echo   - Church Service: http://localhost:3002
echo   - Receipt Service: http://localhost:3003
echo   - MongoDB: localhost:27017
echo.
echo 📊 프론트엔드 실행: npm start (별도 터미널에서)
echo 📊 로그 확인: docker-compose -f docker-compose.dev.yml logs -f [service-name]
echo 🛑 서비스 중지: docker-compose -f docker-compose.dev.yml down
pause 