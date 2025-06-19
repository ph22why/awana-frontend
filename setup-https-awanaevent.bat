@echo off
chcp 65001
echo ====================================
echo AWANA HTTPS Setup for awanaevent.com
echo ====================================
echo.

echo Configuration:
echo - Domain: awanaevent.com
echo - Frontend: https://awanaevent.com (port 443)
echo - Event Service: https://awanaevent.com:3001
echo - Church Service: https://awanaevent.com:3002
echo - Receipt Service: https://awanaevent.com:3003
echo.

set /p EMAIL="Enter your email for Let's Encrypt notifications: "
if "%EMAIL%"=="" (
    echo Error: Email is required
    pause
    exit /b 1
)

echo.
echo IMPORTANT REQUIREMENTS:
echo 1. awanaevent.com DNS must point to 182.231.199.64
echo 2. Ports 80, 443, 3001, 3002, 3003 must be open
echo 3. Domain must be accessible from the internet
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause

echo.
echo [Step 1] Creating SSL certificate directory...
if not exist "ssl" mkdir ssl

echo.
echo [Step 2] Creating Certbot configuration for awanaevent.com...
(
echo version: '3.8'
echo.
echo services:
echo   certbot:
echo     image: certbot/certbot
echo     container_name: awana-certbot
echo     volumes:
echo       - ./ssl:/etc/letsencrypt
echo       - ./ssl/www:/var/www/certbot
echo     command: certonly --webroot -w /var/www/certbot --email %EMAIL% --agree-tos --no-eff-email -d awanaevent.com
) > docker-compose.certbot.yml

echo.
echo [Step 3] Creating HTTPS nginx configuration...
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
echo     # HTTPS server for main frontend
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
echo         add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'" always;
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
) > nginx-https-awanaevent.conf

echo.
echo [Step 4] Creating HTTPS docker-compose configuration...
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
echo       - ./nginx-https-awanaevent.conf:/etc/nginx/nginx.conf
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
) > docker-compose.https-awanaevent.yml

echo.
echo [Step 5] Creating certificate renewal script...
(
echo @echo off
echo chcp 65001
echo echo Renewing SSL certificate for awanaevent.com...
echo docker-compose -f docker-compose.certbot.yml run --rm certbot renew
echo if %%ERRORLEVEL%% EQU 0 ^(
echo     echo Certificate renewed successfully!
echo     echo Restarting nginx...
echo     docker-compose -f docker-compose.https-awanaevent.yml restart frontend
echo ^) else ^(
echo     echo Certificate renewal failed!
echo ^)
echo pause
) > renew-ssl-certificate.bat

echo.
echo [Step 6] Creating startup script for HTTPS...
(
echo @echo off
echo chcp 65001
echo echo ====================================
echo echo Starting AWANA with HTTPS
echo echo ====================================
echo echo.
echo echo Domain: awanaevent.com
echo echo Frontend: https://awanaevent.com
echo echo Services: https://awanaevent.com:3001/3002/3003
echo echo.
echo echo Stopping existing services...
echo docker-compose -f docker-compose.prod.yml down 2^>nul
echo docker-compose -f docker-compose.https-awanaevent.yml down
echo echo.
echo echo Starting HTTPS services...
echo docker-compose -f docker-compose.https-awanaevent.yml up -d --build
echo if %%ERRORLEVEL%% EQU 0 ^(
echo     echo.
echo     echo ====================================
echo     echo AWANA HTTPS Services Started!
echo     echo ====================================
echo     echo.
echo     echo Access URLs:
echo     echo - Main Site: https://awanaevent.com
echo     echo - Event API: https://awanaevent.com:3001
echo     echo - Church API: https://awanaevent.com:3002
echo     echo - Receipt API: https://awanaevent.com:3003
echo     echo.
echo     echo Checking service status...
echo     timeout /t 5 /nobreak ^>nul
echo     docker-compose -f docker-compose.https-awanaevent.yml ps
echo ^) else ^(
echo     echo Error: Failed to start services
echo ^)
echo echo.
echo pause
) > start-https-awanaevent.bat

echo.
echo ====================================
echo HTTPS Setup for awanaevent.com Completed!
echo ====================================
echo.
echo Files created:
echo - docker-compose.certbot.yml ^(Certificate generation^)
echo - docker-compose.https-awanaevent.yml ^(HTTPS services^)
echo - nginx-https-awanaevent.conf ^(HTTPS nginx config^)
echo - start-https-awanaevent.bat ^(HTTPS startup script^)
echo - renew-ssl-certificate.bat ^(Certificate renewal^)
echo.
echo Next steps:
echo 1. Make sure awanaevent.com points to 182.231.199.64
echo 2. Run: docker-compose -f docker-compose.certbot.yml run --rm certbot
echo 3. Run: .\start-https-awanaevent.bat
echo.
echo Certificate will auto-renew every 90 days using renew-ssl-certificate.bat
echo.
pause 