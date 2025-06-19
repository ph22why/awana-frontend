@echo off
chcp 65001

REM Change to the script's directory
cd /d "%~dp0"

echo ====================================
echo Setting up Let's Encrypt SSL Certificate
echo ====================================
echo.

echo Step 1: Stopping all existing services to free ports...
docker-compose -f docker-compose.prod.yml down 2>nul
docker-compose -f docker-compose.https-awanaevent-final.yml down 2>nul
docker-compose -f docker-compose.windows.yml down 2>nul
docker stop $(docker ps -q) 2>nul

echo.
echo Step 2: Creating SSL directories...
if not exist "ssl" mkdir ssl
if not exist "ssl\live" mkdir ssl\live
if not exist "ssl\live\awanaevent.com" mkdir ssl\live\awanaevent.com
if not exist "ssl\www" mkdir ssl\www

echo.
echo Step 3: Creating temporary nginx config for Let's Encrypt...
echo events { > nginx-letsencrypt-temp.conf
echo     worker_connections 1024; >> nginx-letsencrypt-temp.conf
echo } >> nginx-letsencrypt-temp.conf
echo. >> nginx-letsencrypt-temp.conf
echo http { >> nginx-letsencrypt-temp.conf
echo     server { >> nginx-letsencrypt-temp.conf
echo         listen 80; >> nginx-letsencrypt-temp.conf
echo         server_name awanaevent.com www.awanaevent.com; >> nginx-letsencrypt-temp.conf
echo. >> nginx-letsencrypt-temp.conf
echo         location /.well-known/acme-challenge/ { >> nginx-letsencrypt-temp.conf
echo             root /var/www/certbot; >> nginx-letsencrypt-temp.conf
echo         } >> nginx-letsencrypt-temp.conf
echo. >> nginx-letsencrypt-temp.conf
echo         location / { >> nginx-letsencrypt-temp.conf
echo             return 200 'Let\'s Encrypt setup in progress...'; >> nginx-letsencrypt-temp.conf
echo             add_header Content-Type text/plain; >> nginx-letsencrypt-temp.conf
echo         } >> nginx-letsencrypt-temp.conf
echo     } >> nginx-letsencrypt-temp.conf
echo } >> nginx-letsencrypt-temp.conf

echo.
echo Step 4: Starting temporary nginx for Let's Encrypt...
docker run -d --name temp-nginx ^
  -p 80:80 ^
  -v %CD%\nginx-letsencrypt-temp.conf:/etc/nginx/nginx.conf ^
  -v %CD%\ssl\www:/var/www/certbot ^
  nginx:alpine

echo.
echo Step 5: Running Certbot for SSL certificate...
echo.
echo IMPORTANT: Make sure your domain awanaevent.com points to your server IP (182.231.199.64)
echo Check DNS: nslookup awanaevent.com
echo.
pause

docker run -it --rm ^
  -v %CD%\ssl:/etc/letsencrypt ^
  -v %CD%\ssl\www:/var/www/certbot ^
  certbot/certbot certonly ^
  --webroot ^
  --webroot-path=/var/www/certbot ^
  --email admin@awanaevent.com ^
  --agree-tos ^
  --no-eff-email ^
  -d awanaevent.com ^
  -d www.awanaevent.com

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Let's Encrypt SSL Certificate obtained successfully!
    echo.
    echo Certificate files:
    echo - Private Key: ssl\live\awanaevent.com\privkey.pem
    echo - Certificate: ssl\live\awanaevent.com\fullchain.pem
    echo.
    echo Step 6: Stopping temporary nginx...
    docker stop temp-nginx
    docker rm temp-nginx
    
    echo.
    echo Step 7: Cleaning up temporary files...
    del nginx-letsencrypt-temp.conf
    
    echo.
    echo ✅ SSL Setup Complete!
    echo Now run: restart-awanaevent-simple.bat
    
) else (
    echo.
    echo ❌ Error: Failed to obtain Let's Encrypt certificate
    echo.
    echo Common issues:
    echo 1. Domain DNS not pointing to your server (182.231.199.64)
    echo 2. Port 80 not accessible from internet
    echo 3. Firewall blocking port 80
    echo.
    echo Cleaning up...
    docker stop temp-nginx 2>nul
    docker rm temp-nginx 2>nul
    del nginx-letsencrypt-temp.conf 2>nul
    
    echo.
    echo Alternative: Use the self-signed certificate option
    echo Run: setup-ssl-simple.bat
)

echo.
pause 