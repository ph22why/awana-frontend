@echo off
chcp 65001
echo ====================================
echo SSL 인증서 갱신
echo ====================================

echo [1] Certbot으로 인증서 갱신...
certbot renew --webroot --webroot-path=C:\AWANA\ssl\www

echo [2] 인증서 파일 권한 수정...
attrib -R C:\AWANA\ssl\live\awanaevent.com-0001\*.pem
attrib -R C:\AWANA\ssl\archive\awanaevent.com-0001\*.pem

echo [3] Frontend 서비스 재시작 (새 인증서 적용)...
docker-compose -f docker-compose.https-awanaevent-final.yml restart frontend

echo [4] SSL 인증서 정보 확인...
certbot certificates

echo.
echo ====================================
echo SSL 인증서 갱신 완료!
echo ====================================
pause 