@echo off
chcp 65001
echo ====================================
echo Cleaning up SSL containers
echo ====================================
echo.

cd /d "%~dp0"

echo [1] Stopping all SSL-related containers...
docker stop awana-nginx-cert awana-certbot 2>nul
docker rm awana-nginx-cert awana-certbot 2>nul

echo [2] Stopping existing services...
docker-compose -f docker-compose.prod.yml down 2>nul
docker-compose -f docker-compose.https-awanaevent-final.yml down 2>nul
docker-compose -f docker-compose.certbot-fixed.yml down 2>nul
docker-compose -f docker-compose.certbot-fixed-v2.yml down 2>nul

echo [3] Removing unused containers and networks...
docker system prune -f

echo [4] Current container status:
docker ps -a

echo.
echo ====================================
echo Cleanup completed!
echo ====================================
echo.
echo Now you can:
echo 1. Run: .\setup-https-awanaevent-fixed-v2.bat (for SSL setup)
echo 2. Run: .\restart-all-prod.bat (for regular HTTP service)
echo.
pause 