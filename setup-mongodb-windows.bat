@echo off
echo 🗄️ MongoDB 데이터 디렉토리를 설정합니다...

REM 관리자 권한 확인
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ 관리자 권한으로 실행 중입니다.
) else (
    echo ❌ 관리자 권한이 필요합니다. 이 스크립트를 관리자로 실행해주세요.
    pause
    exit /b 1
)

REM MongoDB 데이터 디렉토리 생성
echo 📁 MongoDB 데이터 디렉토리를 생성합니다...
if not exist "D:\awanadb" (
    mkdir "D:\awanadb"
    echo ✅ D:\awanadb 디렉토리가 생성되었습니다.
) else (
    echo ℹ️ D:\awanadb 디렉토리가 이미 존재합니다.
)

if not exist "D:\awanadb\data" (
    mkdir "D:\awanadb\data"
    echo ✅ D:\awanadb\data 디렉토리가 생성되었습니다.
) else (
    echo ℹ️ D:\awanadb\data 디렉토리가 이미 존재합니다.
)

if not exist "D:\awanadb\logs" (
    mkdir "D:\awanadb\logs"
    echo ✅ D:\awanadb\logs 디렉토리가 생성되었습니다.
) else (
    echo ℹ️ D:\awanadb\logs 디렉토리가 이미 존재합니다.
)

REM 백업 디렉토리 생성
if not exist "D:\awanadb\backup" (
    mkdir "D:\awanadb\backup"
    echo ✅ D:\awanadb\backup 디렉토리가 생성되었습니다.
) else (
    echo ℹ️ D:\awanadb\backup 디렉토리가 이미 존재합니다.
)

REM 권한 설정 (Docker가 접근할 수 있도록)
echo 🔐 디렉토리 권한을 설정합니다...
icacls "D:\awanadb" /grant "Everyone:(OI)(CI)F" /T
icacls "D:\awanadb\data" /grant "Everyone:(OI)(CI)F" /T
icacls "D:\awanadb\logs" /grant "Everyone:(OI)(CI)F" /T
icacls "D:\awanadb\backup" /grant "Everyone:(OI)(CI)F" /T

echo ✅ MongoDB 데이터 디렉토리 설정이 완료되었습니다!
echo.
echo 📁 생성된 디렉토리:
echo   - D:\awanadb\data (MongoDB 데이터)
echo   - D:\awanadb\logs (MongoDB 로그)
echo   - D:\awanadb\backup (백업 파일)
echo.
echo 🚀 이제 start-services-windows.bat를 실행하여 서비스를 시작할 수 있습니다.
pause 