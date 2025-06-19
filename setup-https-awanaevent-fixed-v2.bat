@echo off
chcp 65001
echo ====================================
echo AWANA HTTPS Setup for awanaevent.com (Fixed V2)
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
echo [Step 1] Stopping existing services to free up ports...
docker-compose -f docker-compose.prod.yml down 2>nul
docker-compose -f docker-compose.https-awanaevent-final.yml down 2>nul
docker-compose -f docker-compose.certbot-fixed.yml down 2>nul

echo Cleaning up any remaining containers...
docker stop awana-nginx-cert awana-nginx-1 2>nul
docker rm awana-nginx-cert awana-nginx-1 2>nul

echo.
echo [Step 2] Creating SSL certificate directory...
if not exist "%CD%\ssl" mkdir "%CD%\ssl"
if not exist "%CD%\ssl\www" mkdir "%CD%\ssl\www"
if not exist "%CD%\ssl\www\.well-known" mkdir "%CD%\ssl\www\.well-known"
if not exist "%CD%\ssl\www\.well-known\acme-challenge" mkdir "%CD%\ssl\www\.well-known\acme-challenge"

echo SSL directory structure created:
echo - %CD%\ssl
echo - %CD%\ssl\www
echo - %CD%\ssl\www\.well-known\acme-challenge

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
echo             try_files $uri $uri/ =404;
echo         }
echo.
echo         location / {
echo             return 200 'AWANA Certificate validation server is running. Domain: awanaevent.com';
echo             add_header Content-Type text/plain;
echo         }
echo     }
echo }
) > nginx-cert-temp.conf

echo.
echo [Step 4] Creating fixed Certbot configuration...
(
echo services:
echo   certbot:
echo     image: certbot/certbot
echo     container_name: awana-certbot
echo     volumes:
echo       - %CD%/ssl:/etc/letsencrypt
echo       - %CD%/ssl/www:/var/www/certbot
echo     command: certonly --webroot -w /var/www/certbot --email %EMAIL% --agree-tos --no-eff-email -d awanaevent.com --dry-run
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
echo.
echo networks:
echo   default:
echo     driver: bridge
) > docker-compose.certbot-fixed-v2.yml

echo.
echo [Step 5] Testing nginx configuration...
docker run --rm -v "%CD%/nginx-cert-temp.conf:/etc/nginx/nginx.conf" nginx:alpine nginx -t
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Nginx configuration is invalid!
    pause
    exit /b 1
)
echo Nginx configuration is valid ✓

echo.
echo [Step 6] Starting temporary nginx for certificate validation...
docker-compose -f docker-compose.certbot-fixed-v2.yml up nginx-cert -d

echo Waiting for nginx to start...
timeout /t 10 /nobreak >nul

echo.
echo [Step 7] Testing nginx accessibility...
docker exec awana-nginx-cert nginx -t
if %ERRORLEVEL% EQU 0 (
    echo Nginx is running and configuration is valid ✓
) else (
    echo ERROR: Nginx configuration test failed!
    docker-compose -f docker-compose.certbot-fixed-v2.yml logs nginx-cert
    pause
    exit /b 1
)

echo.
echo [Step 8] Testing HTTP endpoint...
curl -s http://localhost/ | echo
echo.

echo [Step 9] Running certificate validation (DRY RUN)...
docker-compose -f docker-compose.certbot-fixed-v2.yml run --rm certbot

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================
    echo DRY RUN SUCCESSFUL! ✓
    echo ====================================
    echo.
    echo The certificate validation test passed.
    echo Now you can run the actual certificate generation.
    echo.
    set /p PROCEED="Proceed with actual certificate generation? (y/N): "
    if /i "%PROCEED%"=="y" (
        echo.
        echo [Step 10] Generating actual SSL certificate...
        
        echo Creating production certbot configuration...
        (
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
        echo.
        echo networks:
        echo   default:
        echo     driver: bridge
        ) > docker-compose.certbot-production.yml
        
        echo Generating actual SSL certificate...
        docker-compose -f docker-compose.certbot-production.yml run --rm certbot
        
        if %ERRORLEVEL% EQU 0 (
            echo.
            echo ====================================
            echo SSL CERTIFICATE GENERATED SUCCESSFULLY! ✓
            echo ====================================
            echo.
            echo Certificate files location: %CD%\ssl\live\awanaevent.com\
            dir "%CD%\ssl\live\awanaevent.com\" 2>nul
            
            echo.
            echo Stopping certificate generation setup...
            docker-compose -f docker-compose.certbot-production.yml down
            
            echo.
            echo ====================================
            echo NEXT STEPS:
            echo ====================================
            echo 1. Your SSL certificate is ready!
            echo 2. Run: .\start-https-awanaevent-final.bat
            echo 3. Access your site at: https://awanaevent.com
            echo.
            echo Certificate auto-renewal: Run this script again every 60 days
        ) else (
            echo.
            echo ====================================
            echo CERTIFICATE GENERATION FAILED! ✗
            echo ====================================
            echo.
            echo Please check the error messages above.
            echo Common issues:
            echo 1. DNS not pointing to 182.231.199.64
            echo 2. Port 80 blocked by firewall
            echo 3. Domain not accessible from internet
        )
    ) else (
        echo.
        echo Certificate generation cancelled.
        echo You can run it later by re-running this script.
    )
) else (
    echo.
    echo ====================================
    echo DRY RUN FAILED! ✗
    echo ====================================
    echo.
    echo Please check:
    echo 1. awanaevent.com DNS points to 182.231.199.64
    echo 2. Port 80 is accessible from the internet
    echo 3. No firewall blocking the domain
    echo 4. Domain is properly configured
    echo.
    echo You can test manually with:
    echo curl http://awanaevent.com/.well-known/acme-challenge/test
)

echo.
echo [Final] Cleaning up temporary containers...
docker-compose -f docker-compose.certbot-fixed-v2.yml down 2>nul

echo.
echo ====================================
echo SSL Setup Process Completed!
echo ====================================
echo.
echo If successful, you can now run:
echo .\start-https-awanaevent-final.bat
echo.
pause 