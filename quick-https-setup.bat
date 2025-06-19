@echo off
chcp 65001
echo ====================================
echo 빠른 HTTPS 설정
echo ====================================
echo.

cd /d "%~dp0"

echo 현재 HTTP 서비스를 HTTPS로 전환합니다.
echo.

set EMAIL=your-email@example.com
set /p EMAIL="이메일 주소 (기본값: %EMAIL%): "

echo.
echo 설정 정보:
echo - 도메인: awanaevent.com  
echo - 이메일: %EMAIL%
echo - 서버: 182.231.199.64
echo.

set /p CONFIRM="계속 진행하시겠습니까? (y/N): "
if /i not "%CONFIRM%"=="y" exit /b 0

echo.
echo [1] 기존 서비스 중지...
docker-compose -f docker-compose.prod.yml down

echo.
echo [2] SSL 디렉토리 생성...
if not exist ssl mkdir ssl
if not exist ssl\www mkdir ssl\www

echo.
echo [3] 간단한 인증서 검증 설정...
echo events { worker_connections 1024; } > nginx-simple.conf
echo http { >> nginx-simple.conf
echo   server { >> nginx-simple.conf
echo     listen 80; >> nginx-simple.conf
echo     server_name awanaevent.com; >> nginx-simple.conf
echo     location /.well-known/acme-challenge/ { >> nginx-simple.conf
echo       root /var/www/certbot; >> nginx-simple.conf
echo     } >> nginx-simple.conf
echo     location / { >> nginx-simple.conf
echo       return 200 'Certificate validation'; >> nginx-simple.conf
echo       add_header Content-Type text/plain; >> nginx-simple.conf
echo     } >> nginx-simple.conf
echo   } >> nginx-simple.conf
echo } >> nginx-simple.conf

echo.
echo [4] Certbot 설정 생성...
echo services: > docker-compose.simple-cert.yml
echo   nginx: >> docker-compose.simple-cert.yml
echo     image: nginx:alpine >> docker-compose.simple-cert.yml
echo     ports: >> docker-compose.simple-cert.yml
echo       - "80:80" >> docker-compose.simple-cert.yml
echo     volumes: >> docker-compose.simple-cert.yml
echo       - ./ssl/www:/var/www/certbot >> docker-compose.simple-cert.yml
echo       - ./nginx-simple.conf:/etc/nginx/nginx.conf >> docker-compose.simple-cert.yml

echo.
echo [5] 인증 서버 시작...
docker-compose -f docker-compose.simple-cert.yml up -d

echo 5초 대기...
timeout /t 5 /nobreak >nul

echo.
echo [6] 인증서 생성...
docker run --rm -v "%cd%\ssl:/etc/letsencrypt" -v "%cd%\ssl\www:/var/www/certbot" certbot/certbot certonly --webroot -w /var/www/certbot --email %EMAIL% --agree-tos --no-eff-email -d awanaevent.com

if %ERRORLEVEL% EQU 0 (
    echo ✅ 인증서 생성 성공!
    
    echo.
    echo [7] 임시 서버 중지...
    docker-compose -f docker-compose.simple-cert.yml down
    
    echo.
    echo [8] 원래 서비스 재시작...
    docker-compose -f docker-compose.prod.yml up -d
    
    echo.
    echo ====================================
    echo 기본 인증서 생성 완료! ✅
    echo ====================================
    echo.
    echo SSL 인증서가 생성되었습니다: ssl\live\awanaevent.com\
    echo.
    echo 다음 단계:
    echo 1. nginx 설정을 HTTPS용으로 수정
    echo 2. Docker Compose를 HTTPS 버전으로 교체
    echo 3. 서비스 재시작
    echo.
    echo 자동 설정을 원하면: .\apply-https-config.bat
    
) else (
    echo ❌ 인증서 생성 실패
    echo.
    echo 확인사항:
    echo 1. awanaevent.com이 182.231.199.64를 가리키는지
    echo 2. 포트 80이 열려있는지
    echo 3. 방화벽 설정
    echo.
    docker-compose -f docker-compose.simple-cert.yml down
    docker-compose -f docker-compose.prod.yml up -d
)

echo.
pause 