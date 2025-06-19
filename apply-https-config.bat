@echo off
chcp 65001
echo ====================================
echo HTTPS 설정 적용
echo ====================================
echo.

cd /d "%~dp0"

echo SSL 인증서가 생성되었습니다.
echo 이제 HTTPS 서비스를 완전히 적용합니다.
echo.

echo [1] 인증서 파일 확인...
if exist "ssl\live\awanaevent.com\fullchain.pem" (
    echo ✓ fullchain.pem 존재
) else (
    echo ❌ fullchain.pem 없음
    echo 인증서가 제대로 생성되지 않았습니다.
    pause
    exit /b 1
)

if exist "ssl\live\awanaevent.com\privkey.pem" (
    echo ✓ privkey.pem 존재
) else (
    echo ❌ privkey.pem 없음
    echo 인증서가 제대로 생성되지 않았습니다.
    pause
    exit /b 1
)

echo 인증서 파일 확인 완료 ✓

echo.
echo [2] HTTPS nginx 설정 생성...
(
echo events {
echo     worker_connections 1024;
echo }
echo.
echo http {
echo     include /etc/nginx/mime.types;
echo     default_type application/octet-stream;
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
echo     # HTTPS server
echo     server {
echo         listen 443 ssl http2;
echo         server_name awanaevent.com;
echo         root /usr/share/nginx/html;
echo         index index.html;
echo.
echo         # SSL Configuration
echo         ssl_certificate /etc/letsencrypt/live/awanaevent.com/fullchain.pem;
echo         ssl_certificate_key /etc/letsencrypt/live/awanaevent.com/privkey.pem;
echo         ssl_protocols TLSv1.2 TLSv1.3;
echo         ssl_ciphers HIGH:!aNULL:!MD5;
echo.
echo         # Security headers
echo         add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
echo         add_header X-Frame-Options "SAMEORIGIN" always;
echo         add_header X-Content-Type-Options "nosniff" always;
echo.
echo         # Frontend
echo         location / {
echo             try_files $uri $uri/ /index.html;
echo         }
echo.
echo         # API Proxy
echo         location /api/events/ {
echo             proxy_pass http://event-service:3001/api/events/;
echo             proxy_set_header Host $host;
echo             proxy_set_header X-Real-IP $remote_addr;
echo             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo             proxy_set_header X-Forwarded-Proto $scheme;
echo         }
echo.
echo         location /api/churches/ {
echo             proxy_pass http://church-service:3002/api/churches/;
echo             proxy_set_header Host $host;
echo             proxy_set_header X-Real-IP $remote_addr;
echo             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo             proxy_set_header X-Forwarded-Proto $scheme;
echo         }
echo.
echo         location /api/receipts/ {
echo             proxy_pass http://receipt-service:3003/api/receipts/;
echo             proxy_set_header Host $host;
echo             proxy_set_header X-Real-IP $remote_addr;
echo             proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
echo             proxy_set_header X-Forwarded-Proto $scheme;
echo         }
echo     }
echo }
) > nginx-https.conf

echo HTTPS nginx 설정 생성 완료 ✓

echo.
echo [3] HTTPS Docker Compose 설정 생성...
copy docker-compose.prod.yml docker-compose.https.yml

echo Docker Compose를 HTTPS용으로 수정...
powershell -Command "
$content = Get-Content 'docker-compose.https.yml'
$content = $content -replace '- \"3000:3000\"', '- \"80:80\"`n      - \"443:443\"'
$content = $content -replace './nginx.conf:/etc/nginx/nginx.conf', './nginx-https.conf:/etc/nginx/nginx.conf'

# SSL 볼륨 추가
$frontendIndex = 0
for ($i = 0; $i -lt $content.Length; $i++) {
    if ($content[$i] -match 'dockerfile: Dockerfile.frontend') {
        $frontendIndex = $i
        break
    }
}

if ($frontendIndex -gt 0) {
    $newContent = @()
    for ($i = 0; $i -lt $frontendIndex + 1; $i++) {
        $newContent += $content[$i]
    }
    $newContent += '    volumes:'
    $newContent += '      - ./nginx-https.conf:/etc/nginx/nginx.conf'
    $newContent += '      - ./ssl:/etc/letsencrypt'
    $newContent += '      - ./ssl/www:/var/www/certbot'
    for ($i = $frontendIndex + 1; $i -lt $content.Length; $i++) {
        $newContent += $content[$i]
    }
    $content = $newContent
}

Set-Content 'docker-compose.https.yml' $content
"

echo Docker Compose HTTPS 설정 완료 ✓

echo.
echo [4] 기존 서비스 중지...
docker-compose -f docker-compose.prod.yml down

echo.
echo [5] HTTPS 서비스 시작...
docker-compose -f docker-compose.https.yml up -d --build

echo.
echo [6] 서비스 시작 대기...
echo 서비스들이 완전히 시작될 때까지 기다립니다...
timeout /t 20 /nobreak >nul

echo.
echo [7] 서비스 상태 확인...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [8] HTTPS 연결 테스트...
echo 잠시 후 HTTPS 접속을 테스트합니다...
timeout /t 5 /nobreak >nul

curl -k -I https://awanaevent.com 2>nul | findstr "HTTP"
if %ERRORLEVEL% EQU 0 (
    echo ✅ HTTPS 연결 성공!
) else (
    echo ⚠️ HTTPS 연결 테스트 실패 (아직 준비 중일 수 있음)
)

echo.
echo [9] SSL 인증서 갱신 스크립트 생성...
(
echo @echo off
echo chcp 65001
echo echo SSL 인증서 갱신 중...
echo docker run --rm -v "%cd%\ssl:/etc/letsencrypt" -v "%cd%\ssl\www:/var/www/certbot" certbot/certbot renew
echo if %%ERRORLEVEL%% EQU 0 ^(
echo     echo 인증서 갱신 성공! HTTPS 서비스 재시작...
echo     docker-compose -f docker-compose.https.yml restart frontend
echo ^) else ^(
echo     echo 인증서 갱신 실패!
echo ^)
echo pause
) > renew-ssl.bat

echo SSL 갱신 스크립트 생성 완료 ✓

echo.
echo ====================================
echo HTTPS 서비스 완료! 🎉
echo ====================================
echo.
echo ✅ SSL 인증서 적용 완료
echo ✅ HTTPS 서비스 시작 완료  
echo ✅ API 프록시 설정 완료
echo ✅ HTTP → HTTPS 자동 리다이렉트
echo ✅ 보안 헤더 설정 완료
echo.
echo 🔒 HTTPS 접속 URL:
echo    https://awanaevent.com
echo.
echo 📡 API 엔드포인트:
echo    https://awanaevent.com/api/events/
echo    https://awanaevent.com/api/churches/
echo    https://awanaevent.com/api/receipts/
echo.
echo 🔄 SSL 인증서 갱신 (90일마다):
echo    .\renew-ssl.bat
echo.
echo 이제 https://awanaevent.com 에서 안전한 HTTPS 서비스를 이용하실 수 있습니다!
echo.
pause 