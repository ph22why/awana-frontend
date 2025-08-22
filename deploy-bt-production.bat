@echo off
chcp 65001
echo ====================================
echo AWANA BT 서비스 프로덕션 배포
echo ====================================

echo [1] BT 서비스 중지...
docker-compose -f docker-compose.https-awanaevent-final.yml stop bt-service awana-bt-app

echo [2] BT 서비스 빌드...
docker-compose -f docker-compose.https-awanaevent-final.yml build --no-cache bt-service awana-bt-app

echo [3] BT 서비스 시작...
docker-compose -f docker-compose.https-awanaevent-final.yml up -d bt-service awana-bt-app

echo [4] 전체 시스템 재시작 (nginx 설정 적용)...
docker-compose -f docker-compose.https-awanaevent-final.yml restart frontend

echo [5] 서비스 상태 확인...
timeout /t 5 /nobreak
docker-compose -f docker-compose.https-awanaevent-final.yml ps

echo.
echo ====================================
echo BT 서비스 배포 완료!
echo - BT 사용자 페이지: https://awanaevent.com/bt
echo - BT 관리자 페이지: https://awanaevent.com/admin/bt-manage
echo - BT API: https://awanaevent.com/api/bt
echo ====================================
pause
