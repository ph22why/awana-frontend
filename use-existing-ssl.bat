@echo off
chcp 65001
echo ====================================
echo 기존 SSL 인증서로 HTTPS 설정
echo ====================================
echo.

cd /d "%~dp0"

echo 기존에 생성된 SSL 인증서를 사용해서 HTTPS를 설정합니다.
echo.

echo [1] 기존 인증서 파일 확인...
echo SSL 디렉토리 내용:
if exist "ssl" (
    dir ssl /s /b | findstr -i "awanaevent.com"
) else (
    echo SSL 디렉토리가 없습니다.
)

echo.
echo [2] 기존 인증서 찾기...
set CERT_FOUND=0

if exist "ssl\live\awanaevent.com\fullchain.pem" (
    echo ✓ 인증서 발견: ssl\live\awanaevent.com\fullchain.pem
    set CERT_FOUND=1
)

if exist "ssl\live\awanaevent.com-0001\fullchain.pem" (
    echo ✓ 인증서 발견: ssl\live\awanaevent.com-0001\fullchain.pem
    set CERT_FOUND=1
    set CERT_PATH=awanaevent.com-0001
) else (
    set CERT_PATH=awanaevent.com
)

if %CERT_FOUND%==0 (
    echo ❌ 인증서를 찾을 수 없습니다.
    echo Docker 컨테이너에서 인증서를 찾아보겠습니다...
    
    echo 임시 certbot 컨테이너 실행...
    docker run --rm -v "%cd%\ssl:/etc/letsencrypt" certbot/certbot certificates
    
    echo 인증서 파일을 수동으로 확인하세요:
    docker run --rm -v "%cd%\ssl:/etc/letsencrypt" -it alpine sh -c "find /etc/letsencrypt -name '*.pem' | head -10"
    
    pause
    exit /b 1
)

echo.
echo 인증서 경로: %CERT_PATH%
echo.

echo [3] HTTPS nginx 설정 생성 (기존 인증서 사용)...
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
echo         ssl_certificate /etc/letsencrypt/live/%CERT_PATH%/fullchain.pem;
echo         ssl_certificate_key /etc/letsencrypt/live/%CERT_PATH%/privkey.pem;
echo         ssl_protocols TLSv1.2 TLSv1.3;
echo         ssl_ciphers HIGH:!aNULL:!MD5;
echo         ssl_session_timeout 5m;
echo         ssl_session_cache shared:SSL:10m;
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
) > nginx-https-existing.conf

echo HTTPS nginx 설정 완료 ✓

echo.
echo [4] HTTPS Docker Compose 설정 생성...
(
echo version: '3.8'
echo.
echo services:
echo   # MongoDB ^(공통 데이터베이스^)
echo   mongodb:
echo     image: mongo:latest
echo     ports:
echo       - "27017:27017"
echo     volumes:
echo       - D:\db\data:/data/db
echo       - D:\db\logs:/var/log/mongodb
echo       - D:\db\backup:/data/backup
echo     networks:
echo       - awana-network
echo     restart: unless-stopped
echo     environment:
echo       - MONGO_INITDB_ROOT_USERNAME=admin
echo       - MONGO_INITDB_ROOT_PASSWORD=awana123
echo     command: mongod --logpath /var/log/mongodb/mongod.log --logappend
echo.
echo   # Event Service
echo   event-service:
echo     build: ./services/event-service
echo     ports:
echo       - "3001:3001"
echo     environment:
echo       - MONGODB_URI=mongodb://admin:awana123@mongodb:27017/event-service?authSource=admin
echo       - PORT=3001
echo       - NODE_ENV=production
echo     depends_on:
echo       - mongodb
echo     networks:
echo       - awana-network
echo     restart: unless-stopped
echo.
echo   # Church Service
echo   church-service:
echo     build: ./services/church-service
echo     ports:
echo       - "3002:3002"
echo     environment:
echo       - MONGODB_URI=mongodb://admin:awana123@mongodb:27017/church-service?authSource=admin
echo       - PORT=3002
echo       - NODE_ENV=production
echo     depends_on:
echo       - mongodb
echo     networks:
echo       - awana-network
echo     restart: unless-stopped
echo.
echo   # Receipt Service
echo   receipt-service:
echo     build: ./services/receipt-service
echo     ports:
echo       - "3003:3003"
echo     environment:
echo       - MONGODB_URI=mongodb://admin:awana123@mongodb:27017/receipt-service?authSource=admin
echo       - PORT=3003
echo       - NODE_ENV=production
echo     depends_on:
echo       - mongodb
echo     networks:
echo       - awana-network
echo     restart: unless-stopped
echo.
echo   # Frontend Service ^(React + Nginx with HTTPS^)
echo   frontend:
echo     build: 
echo       context: .
echo       dockerfile: Dockerfile.frontend
echo       args:
echo         - NODE_ENV=production
echo     ports:
echo       - "80:80"
echo       - "443:443"
echo     volumes:
echo       - ./nginx-https-existing.conf:/etc/nginx/nginx.conf
echo       - ./ssl:/etc/letsencrypt
echo       - ./ssl/www:/var/www/certbot
echo     environment:
echo       - NODE_ENV=production
echo       - SERVER_IP=182.231.199.64
echo     depends_on:
echo       - event-service
echo       - church-service
echo       - receipt-service
echo     networks:
echo       - awana-network
echo     restart: unless-stopped
echo.
echo volumes:
echo   mongodb_data:
echo     driver: local
echo.
echo networks:
echo   awana-network:
echo     driver: bridge
) > docker-compose.https-final.yml

echo Docker Compose HTTPS 설정 완료 ✓

echo.
echo [5] 기존 서비스 중지...
docker-compose -f docker-compose.prod.yml down 2>nul

echo.
echo [6] HTTPS 서비스 시작...
docker-compose -f docker-compose.https-final.yml up -d --build

echo.
echo [7] 서비스 시작 대기...
timeout /t 20 /nobreak >nul

echo.
echo [8] 서비스 상태 확인...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [9] SSL 인증서 갱신 스크립트 생성...
(
echo @echo off
echo chcp 65001
echo echo SSL 인증서 갱신 중...
echo docker run --rm -v "%cd%\ssl:/etc/letsencrypt" -v "%cd%\ssl\www:/var/www/certbot" certbot/certbot renew --force-renewal
echo if %%ERRORLEVEL%% EQU 0 ^(
echo     echo 인증서 갱신 성공! HTTPS 서비스 재시작...
echo     docker-compose -f docker-compose.https-final.yml restart frontend
echo ^) else ^(
echo     echo 인증서 갱신 실패!
echo ^)
echo pause
) > renew-ssl-final.bat

echo.
echo ====================================
echo HTTPS 서비스 완료! 🎉
echo ====================================
echo.
echo ✅ 기존 SSL 인증서 사용
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
echo 🔄 SSL 인증서 갱신:
echo    .\renew-ssl-final.bat
echo.
echo 이제 https://awanaevent.com 에서 안전한 HTTPS 서비스를 이용하실 수 있습니다!
echo.
pause 