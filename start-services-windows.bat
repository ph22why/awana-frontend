@echo off
echo 🚀 AWANA 백엔드 서비스들을 시작합니다...

REM Docker Compose로 모든 서비스 실행
echo 📦 Docker Compose로 서비스들을 빌드하고 실행합니다...
docker-compose -f docker-compose.windows.yml up --build -d

echo ⏳ 서비스들이 시작되는 동안 잠시 기다립니다...
timeout /t 10 /nobreak > nul

echo ✅ 서비스 상태 확인:
docker-compose -f docker-compose.windows.yml ps

echo.
echo 🌐 서비스 엔드포인트:
echo   - Event Service: http://localhost:3001
echo   - Church Service: http://localhost:3002
echo   - Receipt Service: http://localhost:3003
echo   - MongoDB: localhost:27017
echo.
echo 📊 로그 확인: docker-compose -f docker-compose.windows.yml logs -f [service-name]
echo 🛑 서비스 중지: docker-compose -f docker-compose.windows.yml down
pause 