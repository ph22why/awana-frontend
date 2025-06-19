@echo off
chcp 65001
echo ====================================
echo AWANA HTTPS Setup for awanaevent.com (Fixed)
echo ====================================
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo Configuration:
echo - Domain: awanaevent.com
echo - Working Directory: %CD%
echo - SSL Directory: %CD%\ssl
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
echo 2. Ports 80, 443 must be open
echo 3. Domain must be accessible from the internet
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause

echo.
echo [Step 1] Creating SSL certificate directory...
if not exist "%CD%\ssl" mkdir "%CD%\ssl"
if not exist "%CD%\ssl\www" mkdir "%CD%\ssl\www"

echo SSL directory created at: %CD%\ssl
echo Web directory created at: %CD%\ssl\www

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
echo       - %CD%/ssl:/etc/letsencrypt
echo       - %CD%/ssl/www:/var/www/certbot
echo     command: certonly --webroot -w /var/www/certbot --email %EMAIL% --agree-tos --no-eff-email -d awanaevent.com --dry-run
echo.
echo   # Temporary nginx for certificate validation
echo   nginx-cert:
echo     image: nginx:alpine
echo     container_name: awana-nginx-cert
echo     ports:
echo       - "80:80"
echo     volumes:
echo       - %CD%/ssl/www:/var/www/certbot
echo       - %CD%/nginx-cert-temp.conf:/etc/nginx/nginx.conf
echo     restart: unless-stopped
) > docker-compose.certbot-fixed.yml

echo.
echo [Step 3] Creating temporary nginx config for certificate validation...
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
echo         }
echo.
echo         location / {
echo             return 200 'Certificate validation server is running';
echo             add_header Content-Type text/plain;
echo         }
echo     }
echo }
) > nginx-cert-temp.conf

echo.
echo [Step 4] Testing certificate validation setup...
echo Starting temporary nginx for certificate validation...
docker-compose -f docker-compose.certbot-fixed.yml up nginx-cert -d

echo.
echo Waiting for nginx to start...
timeout /t 5 /nobreak >nul

echo.
echo Testing if nginx is accessible...
docker exec awana-nginx-cert nginx -t
if %ERRORLEVEL% EQU 0 (
    echo Nginx configuration is valid!
) else (
    echo Error: Nginx configuration is invalid
    docker-compose -f docker-compose.certbot-fixed.yml logs nginx-cert
    pause
    exit /b 1
)

echo.
echo [Step 5] Running certificate validation (DRY RUN)...
docker-compose -f docker-compose.certbot-fixed.yml run --rm certbot

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo DRY RUN SUCCESSFUL!
    echo ====================================
    echo.
    echo The certificate validation test passed.
    echo Now you can run the actual certificate generation.
    echo.
    set /p PROCEED="Proceed with actual certificate generation? (y/N): "
    if /i "%PROCEED%"=="y" (
        echo.
        echo Stopping dry-run setup...
        docker-compose -f docker-compose.certbot-fixed.yml down
        
        echo.
        echo Creating production certbot configuration...
        (
        echo version: '3.8'
        echo.
        echo services:
        echo   certbot:
        echo     image: certbot/certbot
        echo     container_name: awana-certbot
        echo     volumes:
        echo       - %CD%/ssl:/etc/letsencrypt
        echo       - %CD%/ssl/www:/var/www/certbot
        echo     command: certonly --webroot -w /var/www/certbot --email %EMAIL% --agree-tos --no-eff-email -d awanaevent.com
        echo.
        echo   nginx-cert:
        echo     image: nginx:alpine
        echo     container_name: awana-nginx-cert
        echo     ports:
        echo       - "80:80"
        echo     volumes:
        echo       - %CD%/ssl/www:/var/www/certbot
        echo       - %CD%/nginx-cert-temp.conf:/etc/nginx/nginx.conf
        echo     restart: unless-stopped
        ) > docker-compose.certbot-production.yml
        
        echo.
        echo Starting nginx for actual certificate generation...
        docker-compose -f docker-compose.certbot-production.yml up nginx-cert -d
        
        echo.
        echo Generating actual SSL certificate...
        docker-compose -f docker-compose.certbot-production.yml run --rm certbot
        
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ====================================
            echo SSL CERTIFICATE GENERATED SUCCESSFULLY!
            echo ====================================
            echo.
            echo Certificate files should be in: %CD%\ssl\live\awanaevent.com\
            echo.
            echo Stopping certificate generation setup...
            docker-compose -f docker-compose.certbot-production.yml down
            
            echo.
            echo You can now run the HTTPS services with:
            echo .\start-https-awanaevent-final.bat
        ) else (
            echo.
            echo Certificate generation failed!
            echo Check the logs above for errors.
        )
    ) else (
        echo.
        echo Certificate generation cancelled.
        echo You can run it later with the generated configuration files.
    )
) else (
    echo.
    echo ====================================
    echo DRY RUN FAILED!
    echo ====================================
    echo.
    echo Please check:
    echo 1. awanaevent.com DNS points to 182.231.199.64
    echo 2. Port 80 is accessible from the internet
    echo 3. No firewall blocking the domain
    echo.
    echo Check logs above for specific errors.
)

echo.
echo Cleaning up...
docker-compose -f docker-compose.certbot-fixed.yml down 2>nul

echo.
echo Setup completed!
pause 