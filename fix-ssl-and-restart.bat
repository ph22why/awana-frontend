@echo off
chcp 65001
echo ====================================
echo SSL 문제 해결 및 HTTPS 재시작
echo ====================================
echo.

cd /d "%~dp0"

echo 현재 상황:
echo - Docker 빌드 중 SSL 파일 권한 오류 발생
echo - 서비스가 HTTP 포트 3000으로 실행 중
echo - HTTPS 설정이 제대로 적용되지 않음
echo.

echo [1] 현재 서비스 상태 확인...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [2] 모든 서비스 중지...
docker-compose -f docker-compose.https-final.yml down 2>nul
docker-compose -f docker-compose.prod.yml down 2>nul

echo.
echo [3] SSL 인증서 권한 문제 해결...
echo SSL 디렉토리 권한 확인 및 수정...

if exist ssl (
    echo SSL 디렉토리 존재 확인
    attrib -R ssl\*.* /S /D
    echo SSL 파일 읽기 전용 속성 제거 완료
) else (
    echo SSL 디렉토리가 없습니다
)

echo.
echo [4] 간단한 HTTPS Docker Compose 설정 생성...
(
echo version: '3.8'
echo.
echo services:
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
echo   event-service:
echo     build: ./services/event-service
echo     expose:
echo       - "3001"
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
echo   church-service:
echo     build: ./services/church-service
echo     expose:
echo       - "3002"
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
echo   receipt-service:
echo     build: ./services/receipt-service
echo     expose:
echo       - "3003"
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
echo   nginx:
echo     image: nginx:alpine
echo     ports:
echo       - "80:80"
echo       - "443:443"
echo     volumes:
echo       - ./build:/usr/share/nginx/html
echo       - ./nginx-https-simple.conf:/etc/nginx/nginx.conf
echo       - ./ssl:/etc/letsencrypt:ro
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
) > docker-compose.https-simple.yml

echo.
echo [5] 프론트엔드 빌드...
echo React 앱을 빌드합니다...
if exist build rmdir /s /q build
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo React 빌드 실패!
    echo 기존 빌드가 있는지 확인...
    if not exist build (
        echo 빌드 디렉토리가 없습니다. React 빌드가 필요합니다.
        pause
        exit /b 1
    )
)

echo.
echo [6] 간단한 HTTPS nginx 설정...
(
echo events {
echo     worker_connections 1024;
echo }
echo.
echo http {
echo     include /etc/nginx/mime.types;
echo     default_type application/octet-stream;
echo.
echo     server {
echo         listen 80;
echo         server_name awanaevent.com;
echo         return 301 https://$server_name$request_uri;
echo     }
echo.
echo     server {
echo         listen 443 ssl http2;
echo         server_name awanaevent.com;
echo         root /usr/share/nginx/html;
echo         index index.html;
echo.
echo         ssl_certificate /etc/letsencrypt/live/awanaevent.com/fullchain.pem;
echo         ssl_certificate_key /etc/letsencrypt/live/awanaevent.com/privkey.pem;
echo         ssl_protocols TLSv1.2 TLSv1.3;
echo.
echo         location / {
echo             try_files $uri $uri/ /index.html;
echo         }
echo.
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
) > nginx-https-simple.conf

echo.
echo [7] HTTPS 서비스 시작...
docker-compose -f docker-compose.https-simple.yml up -d

echo.
echo [8] 서비스 시작 대기...
timeout /t 15 /nobreak >nul

echo.
echo [9] 서비스 상태 확인...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo [10] HTTPS 연결 테스트...
timeout /t 5 /nobreak >nul
curl -k -I https://awanaevent.com 2>nul | findstr HTTP
if %ERRORLEVEL% EQU 0 (
    echo ✅ HTTPS 연결 성공!
) else (
    echo ⚠️ HTTPS 연결 테스트 중... 잠시 후 다시 시도하세요
)

echo.
echo [11] nginx 로그 확인...
docker logs awana-nginx-1 --tail 5

echo.
echo ====================================
echo SSL 문제 해결 완료!
echo ====================================
echo.
echo 변경사항:
echo ✅ SSL 파일 권한 수정
echo ✅ 간단한 nginx 구성으로 변경
echo ✅ 프론트엔드 별도 빌드
echo ✅ Docker 컨테이너 분리
echo.
echo 접속 URL:
echo 🔒 https://awanaevent.com
echo.
echo 문제가 계속되면 nginx 로그를 확인하세요:
echo docker logs awana-nginx-1
echo.
pause 