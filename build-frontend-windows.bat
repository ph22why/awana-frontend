@echo off
echo 🏗️ AWANA 프론트엔드를 빌드합니다...

REM Node.js 버전 확인
node --version
npm --version

REM 의존성 설치
echo 📦 의존성을 설치합니다...
npm install

REM 프로덕션 빌드
echo 🚀 프로덕션 빌드를 시작합니다...
set NODE_ENV=production
npm run build

echo ✅ 빌드가 완료되었습니다!
echo 📁 빌드된 파일: build/ 폴더
echo 🌐 서빙 방법: npx serve -s build -l 3000
pause 