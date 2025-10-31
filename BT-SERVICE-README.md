# AWANA BT Service

AWANA BT (Bible Teaching & Training) 서비스는 교회담당자와 개인교사를 위한 성경교육 및 훈련 프로그램 신청 시스템입니다.

## 🏗️ 서비스 구조

### 프론트엔드 앱
- **frontend/bt-app**: 사용자용 BT 신청 페이지 (Lovable 호스팅 대상)
- **frontend/bt-admin**: 관리자용 BT 관리 페이지 (Lovable 호스팅 대상)

### 백엔드 서비스
- **backend/bt-service**: BT 관련 API 서버 (포트 3004)
- **MongoDB**: BT 전용 데이터베이스

## 🚀 시작하기

### 1. BT 서비스만 시작
```bash
./start-bt-services.sh
```

### 1-1. 윈도우 서버 배포/업데이트
- 전체 재배포(중단 후 재시작): `bt-deploy.bat`
- 무중단 업데이트(이미지 재빌드 후 교체): `bt-update.bat`

### 2. 전체 서비스와 함께 시작
```bash
docker-compose up -d
```

## 📡 API 엔드포인트

### 교회담당자 관련
- `POST /api/bt/church-managers` - 교회담당자 신청
- `GET /api/bt/church-managers` - 교회담당자 목록 조회
- `GET /api/bt/church-managers/:id` - 특정 교회담당자 조회
- `PATCH /api/bt/church-managers/:id/status` - 교회담당자 상태 업데이트

### 개인교사 관련
- `POST /api/bt/individual-teachers` - 개인교사 신청
- `GET /api/bt/individual-teachers` - 개인교사 목록 조회
- `GET /api/bt/individual-teachers/:id` - 특정 개인교사 조회
- `PATCH /api/bt/individual-teachers/:id/status` - 개인교사 상태 업데이트

### 통계
- `GET /api/bt/statistics` - BT 신청 통계

## 🌐 접속 URL

### 개발 환경
- **사용자 페이지 (로컬 CRA)**: http://localhost:3000
- **API 서버**: http://localhost:3004
- **Health Check**: http://localhost:3004/health

### 프로덕션 환경
- **사용자 페이지 (Lovable)**: 업데이트 예정 - Lovable 최종 URL을 사용하세요
- **관리자 페이지 (Lovable)**: 업데이트 예정 - Lovable 최종 URL을 사용하세요
- **API**: https://awanaevent.com/api/bt

## 🔄 BT 이벤트 연동

Admin 페이지에서 다음 이벤트들을 생성할 때 자동으로 BT 링크가 설정됩니다:
- 상반기 연합 BT
- 하반기 연합 BT  
- 수시 BT

기본 링크: `https://awanaevent.com/bt`

## 📊 데이터베이스 스키마

### ChurchManager 컬렉션
```javascript
{
  churchName: String,
  churchAddress: String,
  churchPhone: String,
  managerName: String,
  managerPhone: String,
  managerEmail: String,
  participants: Number,
  registrationDate: Date,
  status: 'pending' | 'approved' | 'rejected'
}
```

### IndividualTeacher 컬렉션
```javascript
{
  name: String,
  phone: String,
  email: String,
  address: String,
  churchName: String,
  position: String,
  experience: String,
  certification: String,
  motivation: String,
  registrationDate: Date,
  status: 'pending' | 'approved' | 'rejected'
}
```

## 🛠️ 개발 가이드

### 로컬 개발 환경 설정
1. MongoDB 실행
2. BT 서비스 실행: `cd backend/bt-service && npm run dev`
3. BT 앱 실행: `cd frontend/bt-app && npm start`
4. 관리자 앱 실행(필요시): `cd frontend/bt-admin && npm start`

### 환경 변수
```bash
# BT Service
MONGODB_URI=mongodb://localhost:27017/bt-service
PORT=3004
NODE_ENV=development

# BT App
REACT_APP_API_URL=http://localhost:3004
```

## 🔍 로그 확인
```bash
# BT 서비스 로그
docker-compose logs -f bt-service

# 프론트엔드 로그
# - Lovable 배포: Lovable 대시보드에서 확인
# - 로컬 개발: CRA 기본 터미널 출력 확인
```

## 🛑 서비스 중지
```bash
docker-compose down
```

## ☁️ Lovable 배포 요약
1. `cd frontend/bt-app && npm install && npm run build`
2. `frontend/bt-app/build` 디렉터리를 압축하거나 Lovable 업로드 마법사에 그대로 전달
3. Lovable 환경 변수에 `REACT_APP_API_URL=https://awanaevent.com/api/bt` 지정
4. 동일한 방식으로 관리자 앱은 `frontend/bt-admin`에서 빌드 후 별도 Lovable 프로젝트로 배포
5. 배포가 완료되면 `nginx-https-awanaevent-with-api-proxy.conf`와 `nginx.conf`의 리다이렉트 URL을 최신 Lovable 주소로 교체
