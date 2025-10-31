@echo off
chcp 65001
echo ====================================
echo SSL 인증서 갱신 (Docker 방식)
echo ====================================

echo [1] 기존 인증서 상태 확인...
docker run --rm -v C:\AWANA\ssl:/etc/letsencrypt certbot/certbot certificates

echo.
echo [2] 기존 인증서 삭제...
docker run --rm -v C:\AWANA\ssl:/etc/letsencrypt certbot/certbot delete --cert-name awanaevent.com --non-interactive

echo.
echo [3] 새 인증서 발급 (웹루트 방식)...
docker run --rm -v C:\AWANA\ssl:/etc/letsencrypt -v C:\AWANA\ssl\www:/var/www/html certbot/certbot certonly --webroot --webroot-path=/var/www/html -d awanaevent.com -d www.awanaevent.com --non-interactive --agree-tos --email admin@awanaevent.com --force-renewal

echo.
echo [4] 인증서 파일 확인...
if exist "C:\AWANA\ssl\live\awanaevent.com\*.pem" (
    echo ✓ 인증서가 생성되었습니다!
    echo.
    echo [5] Frontend 서비스 재시작...
    cd /d "%~dp0"
    docker-compose -f docker-compose.https-awanaevent-final.yml restart frontend
    echo.
    echo ====================================
    echo SSL 인증서 재발급 완료!
    echo ====================================
) else (
    echo.
    echo [오류] 인증서 파일을 찾을 수 없습니다.
    echo.
    echo [해결 방법]
    echo 1. cert-nginx 컨테이너가 실행 중인지 확인
    echo 2. 포트 80이 열려있는지 확인
    echo 3. 방화벽 설정 확인
)

pause

