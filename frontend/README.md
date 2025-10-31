# Frontend (Lovable Hosting)

AWANA 프론트엔드 앱들은 `frontend/` 디렉터리 아래에서 각각 독립적으로 관리됩니다.  
BT 앱은 Lovable 호스팅을 기본으로, TNT Camp 앱들은 Docker 배포 또는 정적 호스팅에 맞춰 사용하세요.

## 프로젝트 구조
- `frontend/bt-app`: 일반 사용자용 BT 신청 페이지
- `frontend/bt-admin`: 관리자용 BT 관리 페이지
- `frontend/english-camp-app`: TNT Camp 참가자용 메인 페이지
- `frontend/english-camp-admin`: TNT Camp 관리자 페이지

두 프로젝트 모두 Create React App 기반이며, 동일한 방식으로 개발/빌드합니다.

## 로컬 개발
```bash
# 사용자용 페이지
cd frontend/bt-app
npm install
npm start

# 관리자 페이지
cd ../bt-admin
npm install
npm start

# TNT Camp 메인 앱
cd ../english-camp-app
npm install
npm start -- --port 3100

# TNT Camp 관리자 앱
cd ../english-camp-admin
npm install
npm start -- --port 3101
```
기본 브라우저 포트는 `http://localhost:3000`이며, 동시에 여러 앱을 띄울 경우 `--port` 옵션으로 충돌을 피하세요.

## Lovable 배포 절차 (BT 앱)
1. `frontend/bt-app` 혹은 `frontend/bt-admin`에서 `npm install && npm run build` 실행
2. 생성된 `build/` 폴더를 Lovable 새 프로젝트에 업로드하거나 Lovable CLI에 전달
3. Lovable 프로젝트의 환경 변수에 `REACT_APP_API_URL`을 설정  
   - 프로덕션 API: `https://awanaevent.com/api/bt`
   - 개발용 API: `http://localhost:3004`
4. 배포 완료 후 Lovable에서 제공하는 최종 URL을 확인
5. 서버 프록시(`nginx.conf`, `nginx-https-awanaevent-with-api-proxy.conf`)의 `https://your-lovable-...` 플레이스홀더를 실제 URL로 교체

> TNT Camp 앱은 기존 Docker 기반 배포 파이프라인(`docker-compose.tnt-dev.yml`, `docker-compose.https-awanaevent-final.yml`)을 그대로 사용할 수 있습니다.

## 유지보수 체크리스트
- Lovable 배포 전 `.env.production` 등 환경 변수 파일에 민감 정보가 포함되지 않았는지 확인
- API 스키마 변경 시 `REACT_APP_API_URL` 외 다른 환경 변수 필요 여부 검토
- 프론트엔드 빌드 산출물은 저장소에 커밋하지 않습니다 (`build/`는 `.gitignore`에 포함)
