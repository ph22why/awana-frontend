@echo off
chcp 65001
echo ====================================
echo SSL 인증서 갱신
echo ====================================

echo [1] Certbot 설치 확인...
where certbot >nul 2>&1
if %errorlevel% neq 0 (
    echo Certbot이 설치되지 않았습니다.
    echo 다음 명령어로 설치하세요:
    echo choco install certbot
    echo 또는 https://certbot.eff.org/instructions?ws=other^&os=windows 에서 다운로드
    pause
    exit /b 1
)

echo [2] Certbot으로 인증서 갱신...
certbot renew --webroot --webroot-path=C:\AWANA\ssl\www

echo [3] 인증서 파일 권한 수정...
if exist "C:\AWANA\ssl\live\awanaevent.com\*.pem" (
    attrib -R C:\AWANA\ssl\live\awanaevent.com\*.pem
    echo 인증서 파일 권한 수정 완료
) else (
    echo 인증서 파일을 찾을 수 없습니다: C:\AWANA\ssl\live\awanaevent.com\
)

echo [4] Frontend 서비스 재시작 (새 인증서 적용)...
cd /d "%~dp0"
if exist "docker-compose.https-awanaevent-final.yml" (
    docker-compose -f docker-compose.https-awanaevent-final.yml restart frontend
    echo Frontend 서비스 재시작 완료
) else (
    echo Docker Compose 파일을 찾을 수 없습니다: docker-compose.https-awanaevent-final.yml
    echo 현재 디렉토리: %CD%
    dir *.yml
)

echo [5] SSL 인증서 정보 확인...
certbot certificates

echo.
echo ====================================
echo SSL 인증서 갱신 완료!
echo ====================================
pause 