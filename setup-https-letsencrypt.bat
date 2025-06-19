@echo off
chcp 65001
echo ====================================
echo AWANA HTTPS Setup with Let's Encrypt
echo ====================================
echo.

echo IMPORTANT REQUIREMENTS:
echo 1. You need a domain name pointing to 182.231.199.64
echo 2. Port 80 and 443 must be open on the server
echo 3. The domain must be accessible from the internet
echo.
echo Example: awana.example.com -> 182.231.199.64
echo.

set /p DOMAIN="Enter your domain name (e.g., awana.example.com): "
if "%DOMAIN%"=="" (
    echo Error: Domain name is required
    pause
    exit /b 1
)

set /p EMAIL="Enter your email for Let's Encrypt notifications: "
if "%EMAIL%"=="" (
    echo Error: Email is required
    pause
    exit /b 1
)

echo.
echo Configuration:
echo - Domain: %DOMAIN%
echo - Email: %EMAIL%
echo - Server IP: 182.231.199.64
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause

echo.
echo [Step 1] Creating SSL certificate directory...
if not exist "ssl" mkdir ssl

echo.
echo [Step 2] Creating Certbot configuration...
echo version: '3.8' > docker-compose.certbot.yml
echo. >> docker-compose.certbot.yml
echo services: >> docker-compose.certbot.yml
echo   certbot: >> docker-compose.certbot.yml
echo     image: certbot/certbot >> docker-compose.certbot.yml
echo     container_name: awana-certbot >> docker-compose.certbot.yml
echo     volumes: >> docker-compose.certbot.yml
echo       - ./ssl:/etc/letsencrypt >> docker-compose.certbot.yml
echo       - ./ssl/www:/var/www/certbot >> docker-compose.certbot.yml
echo     command: certonly --webroot -w /var/www/certbot --email %EMAIL% --agree-tos --no-eff-email -d %DOMAIN% >> docker-compose.certbot.yml

echo.
echo [Step 3] Creating temporary nginx config for certificate verification...
echo server { > ssl\temp-nginx.conf
echo     listen 80; >> ssl\temp-nginx.conf
echo     server_name %DOMAIN%; >> ssl\temp-nginx.conf
echo. >> ssl\temp-nginx.conf
echo     location /.well-known/acme-challenge/ { >> ssl\temp-nginx.conf
echo         root /var/www/certbot; >> ssl\temp-nginx.conf
echo     } >> ssl\temp-nginx.conf
echo. >> ssl\temp-nginx.conf
echo     location / { >> ssl\temp-nginx.conf
echo         return 301 https://$server_name$request_uri; >> ssl\temp-nginx.conf
echo     } >> ssl\temp-nginx.conf
echo } >> ssl\temp-nginx.conf

echo.
echo [Step 4] Instructions for manual setup:
echo.
echo 1. First, copy ssl\temp-nginx.conf content to your nginx configuration
echo 2. Restart nginx to serve the verification endpoint
echo 3. Run: docker-compose -f docker-compose.certbot.yml run --rm certbot
echo 4. If successful, update nginx.conf with HTTPS configuration
echo 5. Restart services with HTTPS enabled
echo.
echo Would you like to continue with automatic setup?
echo WARNING: This will modify your current nginx configuration!
set /p CONTINUE="Continue? (y/N): "
if /i not "%CONTINUE%"=="y" (
    echo Setup cancelled. Manual files created in ssl\ directory.
    pause
    exit /b 0
)

echo.
echo [Step 5] Creating HTTPS nginx configuration...
call :create_https_nginx "%DOMAIN%"

echo.
echo [Step 6] Updating docker-compose for HTTPS...
call :update_docker_compose

echo.
echo ====================================
echo HTTPS Setup Completed!
echo ====================================
echo.
echo Next steps:
echo 1. Run: docker-compose -f docker-compose.certbot.yml run --rm certbot
echo 2. If certificate is obtained successfully:
echo    - Run: .\restart-prod-services.bat
echo 3. Access your site at: https://%DOMAIN%
echo.
echo Certificate will auto-renew every 90 days.
pause
goto :eof

:create_https_nginx
set "domain=%~1"
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
echo         server_name %domain%;
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
echo         server_name %domain%;
echo         root /usr/share/nginx/html;
echo         index index.html index.htm;
echo.
echo         # SSL Configuration
echo         ssl_certificate /etc/letsencrypt/live/%domain%/fullchain.pem;
echo         ssl_certificate_key /etc/letsencrypt/live/%domain%/privkey.pem;
echo         ssl_session_timeout 1d;
echo         ssl_session_cache shared:SSL:50m;
echo         ssl_session_tickets off;
echo.
echo         # Modern configuration
echo         ssl_protocols TLSv1.2 TLSv1.3;
echo         ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
echo         ssl_prefer_server_ciphers off;
echo.
echo         # HSTS
echo         add_header Strict-Transport-Security "max-age=63072000" always;
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
echo         location ~* \.\(js^|css^|png^|jpg^|jpeg^|gif^|ico^|svg\)$ {
echo             expires 1y;
echo             add_header Cache-Control "public, immutable";
echo         }
echo     }
echo }
) > nginx-https.conf
goto :eof

:update_docker_compose
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
echo       - ./nginx-https.conf:/etc/nginx/nginx.conf
echo       - ./ssl:/etc/letsencrypt
echo       - ./ssl/www:/var/www/certbot
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
) > docker-compose.https.yml
goto :eof 