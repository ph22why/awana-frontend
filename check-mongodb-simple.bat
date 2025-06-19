@echo off
chcp 65001
echo ====================================
echo MongoDB Simple Check
echo ====================================
echo.

cd /d "%~dp0"

echo [Step 1] Checking Docker status...
docker --version
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not running or not installed
    pause
    exit /b 1
)

echo.
echo [Step 2] Listing all running containers...
docker ps
echo.

echo [Step 3] Looking for MongoDB containers specifically...
docker ps --filter "name=mongo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [Step 4] Checking all AWANA related containers...
docker ps --filter "name=awana" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.

echo [Step 5] Trying to connect to MongoDB with different container names...

echo Trying: awana-mongodb-1
docker exec awana-mongodb-1 echo "Container awana-mongodb-1 is accessible" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: awana-mongodb-1 is running
    set MONGO_CONTAINER=awana-mongodb-1
    goto :connect
)

echo Trying: awana_mongodb_1
docker exec awana_mongodb_1 echo "Container awana_mongodb_1 is accessible" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: awana_mongodb_1 is running
    set MONGO_CONTAINER=awana_mongodb_1
    goto :connect
)

echo Trying: mongodb
docker exec mongodb echo "Container mongodb is accessible" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: mongodb is running
    set MONGO_CONTAINER=mongodb
    goto :connect
)

echo ERROR: No MongoDB container found or accessible
echo Available containers:
docker ps --format "table {{.Names}}\t{{.Status}}"
pause
exit /b 1

:connect
echo.
echo [Step 6] Connecting to MongoDB container: %MONGO_CONTAINER%
echo Testing MongoDB connection...
docker exec %MONGO_CONTAINER% mongosh --version
if %ERRORLEVEL% NEQ 0 (
    echo Error: mongosh not available, trying mongo command...
    docker exec %MONGO_CONTAINER% mongo --version
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Neither mongosh nor mongo command is available
        pause
        exit /b 1
    )
    set MONGO_CMD=mongo
) else (
    set MONGO_CMD=mongosh
)

echo.
echo [Step 7] Checking databases with %MONGO_CMD%...
docker exec %MONGO_CONTAINER% %MONGO_CMD% -u admin -p awana123 --authenticationDatabase admin --eval "db.adminCommand('listDatabases')"

echo.
echo MongoDB check completed!
echo Container used: %MONGO_CONTAINER%
echo Command used: %MONGO_CMD%
pause 