@echo off
chcp 65001
echo ====================================
echo Docker Status Quick Check
echo ====================================
echo.

echo All running containers:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo AWANA related containers:
docker ps --filter "name=awana" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo MongoDB related containers:
docker ps --filter "name=mongo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo Docker Compose services status:
docker-compose -f docker-compose.prod.yml ps

pause 