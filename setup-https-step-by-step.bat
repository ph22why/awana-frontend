@echo off
chcp 65001
echo ====================================
echo HTTPS 설정 (단계별)
echo ====================================
echo.

cd /d "%~dp0"

echo 이 스크립트는 단계별로 HTTPS를 설정합니다.
echo 각 단계에서 문제가 있으면 중단하고 오류를 확인할 수 있습니다.
echo.

set /p EMAIL="Let's Encrypt 이메일 주소 입력: "
if "%EMAIL%"=="" (
    echo 오류: 이메일이 필요합니다
    pause
    exit /b 1
)

echo.
echo === 1단계: 준비 작업 ===
echo.

echo [1-1] SSL 디렉토리 생성...
if not exist "ssl" mkdir ssl
if not exist "ssl\www" mkdir ssl\www
if not exist "ssl\www\.well-known" mkdir ssl\www\.well-known
if not exist "ssl\www\.well-known\acme-challenge" mkdir ssl\www\.well-known\acme-challenge
echo 완료 ✓

echo.
echo [1-2] 현재 서비스 상태 확인...
docker ps | findstr awana

echo.
echo [1-3] 현재 서비스 중지...
docker-compose -f docker-compose.prod.yml down
if %ERRORLEVEL% NEQ 0 (
    echo 경고: 서비스 중지에 문제가 있을 수 있습니다
)
echo 완료 ✓

echo.
echo === 1단계 완료 ===
echo 계속하려면 아무 키나 누르세요...
pause

echo.
echo === 2단계: 인증서 검증용 nginx 설정 ===
echo.

echo [2-1] nginx 설정 파일 생성...
(
echo events {
echo     worker_connections 1024;
echo }
echo.
echo http {
echo     server {
echo         listen 80;
echo         server_name awanaevent.com;
echo.
echo         location /.well-known/acme-challenge/ {
echo             root /var/www/certbot;
echo             try_files $uri $uri/ =404;
echo         }
echo.
echo         location / {
echo             return 200 'SSL certificate validation';
echo             add_header Content-Type text/plain;
echo         }
echo     }
echo }
) > nginx-cert-validation.conf
echo 완료 ✓

echo.
echo [2-2] Certbot Docker Compose 생성...
(
echo services:
echo   nginx-cert:
echo     image: nginx:alpine
echo     container_name: awana-nginx-cert
echo     ports:
echo       - "80:80"
echo     volumes:
echo       - ./ssl/www:/var/www/certbot
echo       - ./nginx-cert-validation.conf:/etc/nginx/nginx.conf
echo.
echo   certbot:
echo     image: certbot/certbot
echo     container_name: awana-certbot
echo     volumes:
echo       - ./ssl:/etc/letsencrypt
echo       - ./ssl/www:/var/www/certbot
echo     command: certonly --webroot -w /var/www/certbot --email %EMAIL% --agree-tos --no-eff-email -d awanaevent.com
) > docker-compose.certbot.yml
echo 완료 ✓

echo.
echo === 2단계 완료 ===
echo 계속하려면 아무 키나 누르세요...
pause

echo.
echo === 3단계: SSL 인증서 생성 ===
echo.

echo [3-1] 인증서 검증용 nginx 시작...
docker-compose -f docker-compose.certbot.yml up nginx-cert -d
if %ERRORLEVEL% NEQ 0 (
    echo 오류: nginx 시작 실패
    pause
    exit /b 1
)
echo 완료 ✓

echo.
echo [3-2] nginx 시작 대기...
timeout /t 5 /nobreak >nul

echo.
echo [3-3] nginx 상태 확인...
docker ps | findstr nginx-cert
if %ERRORLEVEL% NEQ 0 (
    echo 오류: nginx 컨테이너가 실행되지 않음
    pause
    exit /b 1
)
echo 완료 ✓

echo.
echo [3-4] SSL 인증서 생성 시작...
echo 주의: 이 과정은 awanaevent.com 도메인 검증을 포함합니다
echo.
docker-compose -f docker-compose.certbot.yml run --rm certbot

if %ERRORLEVEL% EQU 0 (
    echo.
    echo 🎉 SSL 인증서 생성 성공!
) else (
    echo.
    echo ❌ SSL 인증서 생성 실패
    echo 다음을 확인하세요:
    echo 1. awanaevent.com DNS가 182.231.199.64를 가리키는지
    echo 2. 포트 80이 외부에서 접근 가능한지
    echo.
    echo 인증서 검증용 서비스 중지...
    docker-compose -f docker-compose.certbot.yml down
    pause
    exit /b 1
)

echo.
echo [3-5] 인증서 검증용 서비스 중지...
docker-compose -f docker-compose.certbot.yml down
echo 완료 ✓

echo.
echo === 3단계 완료 ===
echo SSL 인증서가 성공적으로 생성되었습니다!
echo 계속하려면 아무 키나 누르세요...
pause

echo.
echo === 4단계: HTTPS 서비스 설정 완료 ===
echo.

echo 다음 단계를 위해 별도 스크립트를 실행하세요:
echo .\setup-https-nginx-config.bat
echo.
echo 또는 수동으로 nginx 설정을 완료할 수 있습니다.
echo.
pause 