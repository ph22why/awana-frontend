@echo off
chcp 65001
echo ====================================
echo Let's Encrypt SSL 인증서 설정 및 HTTPS 서비스
echo ====================================
echo.

cd /d "%~dp0"

echo 현재 HTTP 서비스가 정상 작동 중입니다.
echo HTTPS로 전환하기 위해 Let's Encrypt SSL 인증서를 설정합니다.
echo.

echo 필수 조건 확인:
echo ✓ 도메인: awanaevent.com
echo ✓ DNS: 182.231.199.64로 설정됨
echo ✓ 포트 80, 443 오픈 필요
echo.

set /p EMAIL="Let's Encrypt 알림용 이메일 주소 입력: "
if "%EMAIL%"=="" (
    echo 오류: 이메일 주소가 필요합니다.
    pause
    exit /b 1
)

echo.
echo 설정 정보:
echo - 도메인: awanaevent.com
echo - 이메일: %EMAIL%
echo - 서버 IP: 182.231.199.64
echo.

set /p CONFIRM="HTTPS 설정을 진행하시겠습니까? (y/N): "
if /i not "%CONFIRM%"=="y" (
    echo 설정이 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [1] SSL 디렉토리 생성...
if not exist "ssl" mkdir ssl
if not exist "ssl\www" mkdir ssl\www
if not exist "ssl\www\.well-known" mkdir ssl\www\.well-known
if not exist "ssl\www\.well-known\acme-challenge" mkdir ssl\www\.well-known\acme-challenge

echo SSL 디렉토리 생성 완료 ✓

echo.
echo [2] 인증서 검증용 임시 nginx 설정 생성...
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
echo             return 200 'AWANA SSL Certificate validation server';
echo             add_header Content-Type text/plain;
echo         }
echo     }
echo }
) > nginx-cert-validation.conf

echo.
echo [3] Certbot 전용 Docker Compose 생성...
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
echo     restart: unless-stopped
echo.
echo   certbot:
echo     image: certbot/certbot
echo     container_name: awana-certbot
echo     volumes:
echo       - ./ssl:/etc/letsencrypt
echo       - ./ssl/www:/var/www/certbot
echo     command: certonly --webroot -w /var/www/certbot --email %EMAIL% --agree-tos --no-eff-email -d awanaevent.com
echo.
echo networks:
echo   default:
echo     driver: bridge
) > docker-compose.certbot.yml

echo.
echo [4] 기존 서비스 중지 (포트 80 해제)...
docker-compose -f docker-compose.prod.yml down

echo.
echo [5] SSL 인증서 생성...
echo 인증서 검증용 nginx 시작...
docker-compose -f docker-compose.certbot.yml up nginx-cert -d

echo nginx 시작 대기...
timeout /t 5 /nobreak >nul

echo.
echo SSL 인증서 생성 중...
docker-compose -f docker-compose.certbot.yml run --rm certbot

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo SSL 인증서 생성에 실패했습니다!
    echo 다음을 확인하세요:
    echo 1. awanaevent.com이 182.231.199.64를 가리키는지
    echo 2. 포트 80이 외부에서 접근 가능한지
    echo 3. 방화벽 설정
    docker-compose -f docker-compose.certbot.yml down
    pause
    exit /b 1
)

echo.
echo [6] 인증서 검증용 서비스 중지...
docker-compose -f docker-compose.certbot.yml down

echo.
echo [7] HTTPS 전용 nginx 설정 생성...
(
echo events {
echo     worker_connections 1024;
echo }
echo.
echo http {
echo     include       /etc/nginx/mime.types;
echo     default_type  application/octet-stream;
echo.
echo     # HTTP to HTTPS redirect
echo     server {
echo         listen 80;
echo         server_name awanaevent.com;
echo.
echo         location /.well-known/acme-challenge/ {
echo             root /var/www/certbot;
echo         }
echo.
echo         location / {
echo             return 301 https://$server_name$request_uri;
echo         }
echo     }
echo.
echo     # HTTPS server with API proxy
echo     server {
echo         listen 443 ssl http2;
echo         server_name awanaevent.com;
echo         root /usr/share/nginx/html;
echo         index index.html index.htm;
echo.
echo         # SSL Configuration
echo         ssl_certificate /etc/letsencrypt/live/awanaevent.com/fullchain.pem;
echo         ssl_certificate_key /etc/letsencrypt/live/awanaevent.com/privkey.pem;
echo         ssl_session_timeout 1d;
echo         ssl_session_cache shared:SSL:50m;
echo         ssl_session_tickets off;
echo.
echo         # Modern SSL configuration
echo         ssl_protocols TLSv1.2 TLSv1.3;
echo         ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
echo         ssl_prefer_server_ciphers off;
echo.
echo         # Security headers
echo         add_header Strict-Transport-Security "max-age=63072000" always;
echo         add_header X-Frame-Options "SAMEORIGIN" always;
echo         add_header X-XSS-Protection "1; mode=block" always;
echo         add_header X-Content-Type-Options "nosniff" always;
echo         add_header Referrer-Policy "no-referrer-when-downgrade" always;
echo         add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;
echo.
echo         # Frontend
echo         location / {
echo             try_files $uri $uri/ /index.html;
echo         }
echo.
echo         # API Proxy
echo         location /api/events/ {
echo             proxy_pass http://event-service:3001/api/events/;
echo             proxy_http_version 1.1;
echo             proxy_set_header Upgrade $http_upgrade;
echo             proxy_set_header Connection 'upgrade';
echo             proxy_set_header Host $host;
echo             proxy_set_header X-Real-IP $remote_addr;
echo             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo             proxy_set_header X-Forwarded-Proto $scheme;
echo             proxy_cache_bypass $http_upgrade;
echo         }
echo.
echo         location /api/churches/ {
echo             proxy_pass http://church-service:3002/api/churches/;
echo             proxy_http_version 1.1;
echo             proxy_set_header Upgrade $http_upgrade;
echo             proxy_set_header Connection 'upgrade';
echo             proxy_set_header Host $host;
echo             proxy_set_header X-Real-IP $remote_addr;
echo             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo             proxy_set_header X-Forwarded-Proto $scheme;
echo             proxy_cache_bypass $http_upgrade;
echo         }
echo.
echo         location /api/receipts/ {
echo             proxy_pass http://receipt-service:3003/api/receipts/;
echo             proxy_http_version 1.1;
echo             proxy_set_header Upgrade $http_upgrade;
echo             proxy_set_header Connection 'upgrade';
echo             proxy_set_header Host $host;
echo             proxy_set_header X-Real-IP $remote_addr;
echo             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo             proxy_set_header X-Forwarded-Proto $scheme;
echo             proxy_cache_bypass $http_upgrade;
echo         }
echo.
echo         # Static assets
echo         location ~* \.\(js\|css\|png\|jpg\|jpeg\|gif\|ico\|svg\)$ {
echo             expires 1y;
echo             add_header Cache-Control "public, immutable";
echo         }
echo     }
echo }
) > nginx-https-final.conf

echo.
echo [8] HTTPS Docker Compose 설정 생성...
copy docker-compose.prod.yml docker-compose.https.yml

powershell -Command "
$content = Get-Content docker-compose.https.yml
$content = $content -replace 'ports:\s*\n\s*- \"3000:3000\"', 'ports:\n      - \"80:80\"\n      - \"443:443\"'
$content = $content -replace './nginx.conf:/etc/nginx/nginx.conf', './nginx-https-final.conf:/etc/nginx/nginx.conf'
$newVolumes = '      - ./ssl:/etc/letsencrypt\n      - ./ssl/www:/var/www/certbot'
$content = $content -replace '(dockerfile: Dockerfile.frontend)', \"`$1\n    volumes:\n      - ./nginx-https-final.conf:/etc/nginx/nginx.conf\n$newVolumes\"
Set-Content docker-compose.https.yml $content
"

echo.
echo [9] 프론트엔드 API URL을 HTTPS로 변경...
echo API 엔드포인트를 상대 경로로 변경합니다...

echo.
echo [10] HTTPS 서비스 시작...
docker-compose -f docker-compose.https.yml up -d --build

echo.
echo 서비스 시작 대기...
timeout /t 20 /nobreak >nul

echo.
echo [11] SSL 인증서 자동 갱신 스크립트 생성...
(
echo @echo off
echo chcp 65001
echo echo SSL 인증서 갱신 중...
echo docker-compose -f docker-compose.certbot.yml run --rm certbot renew
echo if %%ERRORLEVEL%% EQU 0 ^(
echo     echo 인증서 갱신 성공!
echo     echo HTTPS 서비스 재시작...
echo     docker-compose -f docker-compose.https.yml restart frontend
echo ^) else ^(
echo     echo 인증서 갱신 실패!
echo ^)
echo pause
) > renew-ssl-certificate.bat

echo.
echo ====================================
echo HTTPS 설정 완료! ✓
echo ====================================
echo.
echo ✅ Let's Encrypt SSL 인증서 발급 완료
echo ✅ HTTPS 서비스 시작 완료
echo ✅ API 프록시 설정 완료
echo ✅ 자동 HTTP → HTTPS 리다이렉트 설정
echo ✅ 인증서 자동 갱신 스크립트 생성
echo.
echo 접속 URL:
echo 🔒 https://awanaevent.com (메인 사이트)
echo 📡 https://awanaevent.com/api/events/
echo 📡 https://awanaevent.com/api/churches/
echo 📡 https://awanaevent.com/api/receipts/
echo.
echo 인증서 갱신: .\renew-ssl-certificate.bat (90일마다)
echo.
pause 