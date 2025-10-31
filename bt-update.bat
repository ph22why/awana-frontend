@echo off
chcp 65001 > nul
setlocal

echo ====================================
echo AWANA BT Backend - Rolling Update
echo ====================================

set COMPOSE_FILE=docker-compose.https-awanaevent-final.yml

echo [1] Building image with latest code (cached layers allowed)...
docker-compose -f %COMPOSE_FILE% build bt-service

if errorlevel 1 (
    echo.
    echo 이미지 빌드 중 오류가 발생했습니다.
    goto :END
)

echo.
echo [2] Applying update with zero-downtime options...
docker-compose -f %COMPOSE_FILE% up -d --no-deps bt-service

if errorlevel 1 (
    echo.
    echo 컨테이너 업데이트 중 오류가 발생했습니다.
    goto :END
)

echo.
echo [3] Latest container status:
docker-compose -f %COMPOSE_FILE% ps bt-service

echo.
echo [4] Tail logs (Ctrl+C to exit)...
docker-compose -f %COMPOSE_FILE% logs --tail 20 bt-service

:END
echo.
echo ====================================
echo Update command finished.
echo ====================================
endlocal
pause
