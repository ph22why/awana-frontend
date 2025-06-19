@echo off
chcp 65001
echo ====================================
echo 기존 데이터로 서비스 재시작
echo ====================================
echo.

cd /d "%~dp0"

echo 현재 각 서비스가 자신의 데이터베이스를 사용하도록 설정되었습니다:
echo - Event Service → event-service 데이터베이스
echo - Church Service → church-service 데이터베이스  
echo - Receipt Service → receipt-service 데이터베이스
echo.
echo 디버그에서 확인된 기존 데이터:
echo - event-service: 20 KB (이벤트 데이터)
echo - church-service: 28 KB (교회 데이터)
echo - receipt-service: 20 KB (영수증 데이터)
echo.

set /p CONFIRM="서비스를 재시작하시겠습니까? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [1] 백엔드 서비스들을 새로운 설정으로 재시작...
docker-compose -f docker-compose.prod.yml stop event-service church-service receipt-service

echo.
echo [2] 서비스 재빌드 및 시작...
docker-compose -f docker-compose.prod.yml up event-service church-service receipt-service -d --build

echo.
echo [3] 서비스 시작 대기...
echo 서비스들이 완전히 시작될 때까지 기다리는 중...
timeout /t 15 /nobreak >nul

echo.
echo [4] 서비스 상태 확인...
docker ps | findstr service

echo.
echo [5] 각 서비스의 데이터베이스 연결 확인...
echo.
echo Event Service 로그 (최근 5줄):
docker logs awana-event-service-1 --tail 5

echo.
echo Church Service 로그 (최근 5줄):
docker logs awana-church-service-1 --tail 5

echo.
echo Receipt Service 로그 (최근 5줄):
docker logs awana-receipt-service-1 --tail 5

echo.
echo [6] API 엔드포인트 테스트...
echo.
echo Event API 테스트:
curl -s http://182.231.199.64:3001/api/events/ | echo

echo.
echo Church API 테스트:
curl -s http://182.231.199.64:3002/api/churches/ | echo

echo.
echo Receipt API 테스트:
curl -s http://182.231.199.64:3003/api/receipts/ | echo

echo.
echo ====================================
echo 재시작 완료! ✓
echo ====================================
echo.
echo 각 서비스가 자신의 데이터베이스를 사용합니다:
echo ✓ Event Service: event-service DB
echo ✓ Church Service: church-service DB  
echo ✓ Receipt Service: receipt-service DB
echo.
echo 웹사이트 접속:
echo Frontend: http://182.231.199.64:3000
echo.
echo 이제 브라우저에서 새로고침하고 데이터가 표시되는지 확인하세요.
echo.
pause 