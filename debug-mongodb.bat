@echo off
chcp 65001
echo ====================================
echo MongoDB 연결 디버그
echo ====================================
echo.

cd /d "%~dp0"

echo [단계 1] Docker 컨테이너 확인
docker ps --format "table {{.Names}}\t{{.Status}}"
echo.

echo [단계 2] MongoDB 컨테이너 로그 (최근 10줄)
docker logs awana-mongodb-1 --tail 10
echo.

echo [단계 3] MongoDB 버전 확인
docker exec awana-mongodb-1 mongosh --version
echo.

echo [단계 4] 인증 없이 연결 테스트
docker exec awana-mongodb-1 mongosh --eval "print('연결 테스트')"
echo.

echo [단계 5] 인증과 함께 연결 테스트
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "print('인증 연결 테스트')"
echo.

echo [단계 6] 데이터베이스 목록 (간단)
docker exec awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin --eval "show dbs"
echo.

echo [단계 7] Docker 환경 변수 확인
docker exec awana-mongodb-1 env | findstr MONGO
echo.

pause 