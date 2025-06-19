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
if not exist "D:\eventdb" (
    mkdir "D:\eventdb"
    echo ✅ D:\eventdb 디렉토리가 생성되었습니다.
) else (
    echo ℹ️ D:\eventdb 디렉토리가 이미 존재합니다.
)

if not exist "D:\eventdb\data" (
    mkdir "D:\eventdb\data"
    echo ✅ D:\eventdb\data 디렉토리가 생성되었습니다.
) else (
    echo ℹ️ D:\eventdb\data 디렉토리가 이미 존재합니다.
)

if not exist "D:\eventdb\logs" (
    mkdir "D:\eventdb\logs"
    echo ✅ D:\eventdb\logs 디렉토리가 생성되었습니다.
) else (
    echo ℹ️ D:\eventdb\logs 디렉토리가 이미 존재합니다.
)

REM 백업 디렉토리 생성
if not exist "D:\eventdb\backup" (
    mkdir "D:\eventdb\backup"
    echo ✅ D:\eventdb\backup 디렉토리가 생성되었습니다.
) else (
    echo ℹ️ D:\eventdb\backup 디렉토리가 이미 존재합니다.
)

REM 권한 설정 (Docker가 접근할 수 있도록)
echo 🔐 디렉토리 권한을 설정합니다...
icacls "D:\eventdb" /grant "Everyone:(OI)(CI)F" /T
icacls "D:\eventdb\data" /grant "Everyone:(OI)(CI)F" /T
icacls "D:\eventdb\logs" /grant "Everyone:(OI)(CI)F" /T
icacls "D:\eventdb\backup" /grant "Everyone:(OI)(CI)F" /T

echo ✅ MongoDB 데이터 디렉토리 설정이 완료되었습니다!
echo.
echo 📁 생성된 디렉토리:
echo   - D:\eventdb\data (MongoDB 데이터)
echo   - D:\eventdb\logs (MongoDB 로그)
echo   - D:\eventdb\backup (백업 파일)
echo.
echo 🚀 실행 방법:
echo   - 개발 환경: start-dev-windows.bat
echo   - 프로덕션 환경: start-prod-windows.bat
pause 