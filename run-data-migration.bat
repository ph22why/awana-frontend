@echo off
chcp 65001
echo ====================================
echo AWANA 데이터 마이그레이션 실행
echo ====================================
echo.

cd /d "%~dp0"

echo 기존에 작동했던 migrate-data-to-awana.bat를 실행합니다.
echo.

echo [1] 데이터 마이그레이션 실행...
call migrate-data-to-awana.bat

echo.
echo [2] 백엔드 서비스들이 새 데이터를 사용하도록 재시작...
echo.
set /p RESTART="백엔드 서비스를 재시작하시겠습니까? (y/N): "
if /i "%RESTART%"=="y" (
    echo.
    echo 백엔드 서비스 재시작 중...
    docker-compose -f docker-compose.prod.yml restart event-service church-service receipt-service
    
    echo.
    echo 서비스 상태 확인...
    timeout /t 5 /nobreak >nul
    docker ps | findstr "awana-.*-service"
    
    echo.
    echo ====================================
    echo 마이그레이션 및 재시작 완료! ✓
    echo ====================================
    echo.
    echo 이제 웹사이트에서 데이터를 확인하세요:
    echo Frontend: http://182.231.199.64:3000
    echo.
) else (
    echo.
    echo 마이그레이션만 완료되었습니다.
    echo 나중에 서비스를 재시작하려면:
    echo .\restart-backend-services.bat
)

pause 