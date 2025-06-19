@echo off
chcp 65001
echo ====================================
echo AWANA HTTPS Setup with Self-Signed Certificate
echo ====================================
echo.

echo WARNING: Self-signed certificates will show security warnings in browsers.
echo This is suitable for development/testing only.
echo For production, use Let's Encrypt instead.
echo.

set /p DOMAIN="Enter your domain or IP (default: 182.231.199.64): "
if "%DOMAIN%"=="" set DOMAIN=182.231.199.64

echo.
echo Configuration:
echo - Domain/IP: %DOMAIN%
echo - Certificate will be valid for 365 days
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause

echo.
echo [Step 1] Creating SSL directory...
if not exist "ssl" mkdir ssl
cd ssl

echo.
echo [Step 2] Creating OpenSSL configuration...
(
echo [req]
echo default_bits = 2048
echo prompt = no
echo default_md = sha256
echo distinguished_name = dn
echo req_extensions = v3_req
echo.
echo [dn]
echo CN=%DOMAIN%
echo.
echo [v3_req]
echo basicConstraints = CA:FALSE
echo keyUsage = nonRepudiation, digitalSignature, keyEncipherment
echo subjectAltName = @alt_names
echo.
echo [alt_names]
echo DNS.1 = %DOMAIN%
echo IP.1 = 182.231.199.64
) > openssl.cnf

echo.
echo [Step 3] Generating private key...
docker run --rm -v "%cd%":/ssl -w /ssl alpine/openssl genrsa -out server.key 2048

echo.
echo [Step 4] Generating certificate signing request...
docker run --rm -v "%cd%":/ssl -w /ssl alpine/openssl req -new -key server.key -out server.csr -config openssl.cnf

echo.
echo [Step 5] Generating self-signed certificate...
docker run --rm -v "%cd%":/ssl -w /ssl alpine/openssl x509 -req -in server.csr -signkey server.key -out server.crt -days 365 -extensions v3_req -extfile openssl.cnf

cd ..

echo.
echo [Step 6] Creating HTTPS nginx configuration...
(
echo events {
echo     worker_connections 1024;
echo }
echo.
echo http {
echo     include       /etc/nginx/mime.types;
echo     default_type  application/octet-stream;
echo.
echo     # Logging Settings
echo     log_format main '$remote_addr - $remote_user [$time_local] "$request" '
echo                     '$status $body_bytes_sent "$http_referer" '
echo                     '"$http_user_agent" "$http_x_forwarded_for"';
echo.
echo     access_log /var/log/nginx/access.log main;
echo     error_log /var/log/nginx/error.log;
echo.
echo     # Gzip Settings
echo     gzip on;
echo     gzip_vary on;
echo     gzip_min_length 1024;
echo     gzip_types
echo         text/plain
echo         text/css
echo         text/xml
echo         text/javascript
echo         application/javascript
echo         application/xml+rss
echo         application/json;
echo.
echo     # HTTP to HTTPS redirect
echo     server {
echo         listen 80;
echo         server_name _;
echo         return 301 https://$server_name:443$request_uri;
echo     }
echo.
echo     # HTTPS server
echo     server {
echo         listen 443 ssl http2;
echo         server_name _;
echo         root /usr/share/nginx/html;
echo         index index.html index.htm;
echo.
echo         # SSL Configuration
echo         ssl_certificate /etc/ssl/server.crt;
echo         ssl_certificate_key /etc/ssl/server.key;
echo         ssl_session_timeout 1d;
echo         ssl_session_cache shared:SSL:50m;
echo         ssl_session_tickets off;
echo.
echo         # Modern configuration
echo         ssl_protocols TLSv1.2 TLSv1.3;
echo         ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
echo         ssl_prefer_server_ciphers off;
echo.
echo         # Security headers
echo         add_header X-Frame-Options "SAMEORIGIN" always;
echo         add_header X-XSS-Protection "1; mode=block" always;
echo         add_header X-Content-Type-Options "nosniff" always;
echo         add_header Referrer-Policy "no-referrer-when-downgrade" always;
echo         add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
echo.
echo         # Handle React Router
echo         location / {
echo             try_files $uri $uri/ /index.html;
echo         }
echo.
echo         # Handle static assets
echo         location ~* \.\(js\|css\|png\|jpg\|jpeg\|gif\|ico\|svg\)$ {
echo             expires 1y;
echo             add_header Cache-Control "public, immutable";
echo         }
echo     }
echo }
) > nginx-https-selfsigned.conf

echo.
echo [Step 7] Creating HTTPS docker-compose configuration...
copy docker-compose.prod.yml docker-compose.prod.backup.yml
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
echo       - D:\eventdb\data:/data/db
echo       - D:\eventdb\logs:/var/log/mongodb
echo       - D:\eventdb\backup:/data/backup
echo     networks:
echo       - awana-network
echo     restart: unless-stopped
echo     environment:
echo       - MONGO_INITDB_ROOT_USERNAME=admin
echo       - MONGO_INITDB_ROOT_PASSWORD=awana123
echo       - MONGO_INITDB_DATABASE=awana
echo     command: mongod --logpath /var/log/mongodb/mongod.log --logappend
echo.
echo   # Event Service
echo   event-service:
echo     build: ./services/event-service
echo     ports:
echo       - "3001:3001"
echo     environment:
echo       - MONGODB_URI=mongodb://admin:awana123@mongodb:27017/awana?authSource=admin
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
echo       - MONGODB_URI=mongodb://admin:awana123@mongodb:27017/awana?authSource=admin
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
echo       - MONGODB_URI=mongodb://admin:awana123@mongodb:27017/awana?authSource=admin
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
echo       - ./nginx-https-selfsigned.conf:/etc/nginx/nginx.conf
echo       - ./ssl/server.crt:/etc/ssl/server.crt
echo       - ./ssl/server.key:/etc/ssl/server.key
echo     environment:
echo       - NODE_ENV=production
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
) > docker-compose.https-selfsigned.yml

echo.
echo ====================================
echo HTTPS Setup with Self-Signed Certificate Completed!
echo ====================================
echo.
echo Files created:
echo - ssl\server.crt ^(Certificate^)
echo - ssl\server.key ^(Private Key^)
echo - nginx-https-selfsigned.conf ^(HTTPS Nginx config^)
echo - docker-compose.https-selfsigned.yml ^(Docker compose with HTTPS^)
echo.
echo To start with HTTPS:
echo 1. docker-compose -f docker-compose.https-selfsigned.yml down
echo 2. docker-compose -f docker-compose.https-selfsigned.yml up -d --build
echo.
echo Access: https://%DOMAIN%:443 or https://182.231.199.64:443
echo ^(You'll see a security warning - click "Advanced" and "Proceed"^)
echo.
pause 