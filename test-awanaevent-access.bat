@echo off
chcp 65001
echo ====================================
echo AWANA Event Domain Access Test
echo ====================================
echo.

echo Testing domain resolution...
echo.
echo 1. Checking awanaevent.com DNS:
nslookup awanaevent.com
echo.

echo 2. Checking www.awanaevent.com DNS:
nslookup www.awanaevent.com
echo.

echo 3. Testing direct IP access (182.231.199.64):
ping -n 2 182.231.199.64
echo.

echo 4. Checking local hosts file for domain overrides:
type C:\Windows\System32\drivers\etc\hosts | findstr awanaevent
echo.

echo 5. Testing HTTP access methods:
echo.
echo Method 1 - Direct domain (should work if DNS is configured):
echo   http://awanaevent.com
echo   https://awanaevent.com
echo.
echo Method 2 - With www prefix:
echo   http://www.awanaevent.com
echo   https://www.awanaevent.com
echo.
echo Method 3 - Direct IP (for testing):
echo   http://182.231.199.64
echo.
echo Method 4 - Local development:
echo   http://localhost
echo   http://localhost:3000
echo.

echo 6. Current Docker services status:
docker-compose -f docker-compose.https-awanaevent-final.yml ps
echo.

echo 7. Testing backend services directly:
echo Event Service (3001):
curl -s http://localhost:3001 | echo Response received
echo Church Service (3002):  
curl -s http://localhost:3002 | echo Response received
echo Receipt Service (3003):
curl -s http://localhost:3003 | echo Response received
echo.

echo ====================================
echo Troubleshooting Tips:
echo ====================================
echo 1. If awanaevent.com doesn't resolve:
echo    - Check DNS settings with your domain provider
echo    - Add to hosts file: 182.231.199.64 awanaevent.com www.awanaevent.com
echo.
echo 2. If services show as running but not accessible:
echo    - Check firewall settings
echo    - Verify port 80/443 are not blocked
echo.
echo 3. For immediate testing, use:
echo    - http://localhost (if frontend is on port 80)
echo    - http://182.231.199.64 (direct IP access)
echo.
pause 