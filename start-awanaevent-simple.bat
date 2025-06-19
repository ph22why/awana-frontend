@echo off
chcp 65001

REM Change to the script's directory
cd /d "%~dp0"

echo ====================================
echo Starting AWANA Event (Simple Setup)
echo ====================================
echo.
echo Current directory: %CD%
echo.

echo Configuration:
echo - Frontend: http://localhost:3000 (React Dev Server)
echo - Domain: http://awanaevent.com (via Nginx redirect to localhost:3000)
echo - Backend Services: 3001, 3002, 3003 (via Docker)
echo.

echo Checking if docker-compose file exists...
if not exist "docker-compose.https-awanaevent-final.yml" (
    echo ❌ Error: docker-compose.https-awanaevent-final.yml not found in current directory!
    echo Current directory: %CD%
    dir docker-compose*.yml
    pause
    exit /b 1
)

echo ✅ Docker compose file found!
echo.
echo Step 1: Starting backend services with Nginx redirect...
docker-compose -f docker-compose.https-awanaevent-final.yml up -d --build nginx-redirect event-service church-service receipt-service mongodb

if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend services and Nginx redirect started!
    echo.
    echo Step 2: Starting React frontend on port 3000...
    echo.
    echo IMPORTANT: In a new terminal, run:
    echo   npm start
    echo.
    echo This will start the React dev server on http://localhost:3000
    echo.
    echo Access URLs after starting npm:
    echo ✅ http://awanaevent.com (will redirect to localhost:3000)
    echo ✅ http://localhost:3000 (direct React dev server)
    echo ✅ Backend APIs: http://localhost:3001, 3002, 3003
    echo.
    
    echo Checking backend services status...
    timeout /t 3 /nobreak >nul
    docker-compose -f docker-compose.https-awanaevent-final.yml ps
    
    echo.
    echo Testing backend services:
    echo Event Service: http://localhost:3001
    curl -s http://localhost:3001 >nul && echo ✅ Event Service OK || echo ❌ Event Service Failed
    echo Church Service: http://localhost:3002  
    curl -s http://localhost:3002 >nul && echo ✅ Church Service OK || echo ❌ Church Service Failed
    echo Receipt Service: http://localhost:3003
    curl -s http://localhost:3003 >nul && echo ✅ Receipt Service OK || echo ❌ Receipt Service Failed
    
) else (
    echo ❌ Error: Failed to start backend services
    echo Check logs with: docker-compose -f docker-compose.https-awanaevent-final.yml logs
)

echo.
echo ====================================
echo Next Steps:
echo ====================================
echo 1. Open new terminal/command prompt
echo 2. Navigate to this directory
echo 3. Run: npm start
echo 4. Wait for React to start on http://localhost:3000
echo 5. Access http://awanaevent.com in your browser
echo ====================================
echo.
pause 