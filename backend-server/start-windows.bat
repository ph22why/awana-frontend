@echo off
echo Starting TNT Camp Backend Server on Windows...

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not available
    pause
    exit /b 1
)

:: Create data directories
echo Creating data directories...
if not exist "D:\tntcampdb" mkdir "D:\tntcampdb"
if not exist "D:\tntcampdb\uploads" mkdir "D:\tntcampdb\uploads"
if not exist "D:\tntcampdb\backups" mkdir "D:\tntcampdb\backups"
if not exist "D:\tntcampdb\logs" mkdir "D:\tntcampdb\logs"

:: Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy "production.env.example" ".env"
    echo Please edit .env file with your database credentials
    pause
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo Error installing dependencies
        pause
        exit /b 1
    )
)

:: Start the server
echo Starting TNT Camp Backend Server...
echo Server will be available at http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
npm start 