# AWANA Project v1.0

교회 관리 시스템 프로젝트입니다.

## 주요 기능

- Material-UI를 활용한 모던한 사용자 인터페이스
- React Router를 이용한 페이지 라우팅
- TypeScript를 활용한 타입 안정성
- Docker를 통한 컨테이너화된 환경

## 기술 스택

- Frontend: React 18.2.0
- UI Library: Material-UI (MUI) 5.17.1
- Language: TypeScript 4.9.5
- Routing: React Router 6.30.0
- HTTP Client: Axios 1.8.4
- Database: MySQL (Docker)

## 설치 방법

1. 저장소 클론
```bash
git clone [repository-url]
cd awana-frontend
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
- `.env` 파일을 프로젝트 루트에 생성하고 필요한 환경 변수를 설정합니다.

4. 데이터베이스 설정
```bash
docker-compose up -d
```

5. 개발 서버 실행
```bash
npm start
```

## 빌드 방법

프로덕션 빌드를 생성하려면:
```bash
npm run build
```

## 테스트 실행

```bash
npm test
```

## 프로젝트 구조

```
src/
  ├── components/     # 재사용 가능한 컴포넌트
  ├── hooks/         # 커스텀 훅
  ├── pages/         # 페이지 컴포넌트
  ├── types/         # TypeScript 타입 정의
  ├── utils/         # 유틸리티 함수
  ├── App.tsx        # 앱 루트 컴포넌트
  └── index.tsx      # 앱 진입점
```

## 라이선스

Private 