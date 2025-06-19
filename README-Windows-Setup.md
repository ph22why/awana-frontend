# AWANA Windows Setup Guide

## Quick Start (빠른 시작)

### 1. MongoDB 데이터 디렉토리 설정
**관리자 권한으로 실행**하세요:
```cmd
setup-mongodb-windows-en.bat
```

### 2. 서비스 실행

#### 개발 환경 (Development)
```cmd
start-dev-windows-en.bat
```
그 후 별도 터미널에서:
```cmd
npm start
```

#### 프로덕션 환경 (Production)
```cmd
start-prod-windows-en.bat
```

## 파일 설명 (File Description)

### English Version (영어 버전)
- `setup-mongodb-windows-en.bat` - MongoDB 초기 설정
- `start-dev-windows-en.bat` - 개발 환경 실행
- `start-prod-windows-en.bat` - 프로덕션 환경 실행

### Korean Version (한글 버전 - 인코딩 문제 가능)
- `setup-mongodb-windows.bat` - MongoDB 초기 설정
- `start-dev-windows.bat` - 개발 환경 실행
- `start-prod-windows.bat` - 프로덕션 환경 실행

## 문제 해결 (Troubleshooting)

### 1. 한글 깨짐 현상
- 영어 버전 파일(`*-en.bat`)을 사용하세요
- 또는 명령 프롬프트에서 `chcp 65001` 실행 후 배치 파일 실행

### 2. 관리자 권한 오류
- 배치 파일을 마우스 우클릭 → "관리자 권한으로 실행"

### 3. Docker 오류
- Docker Desktop이 실행 중인지 확인
- WSL 2가 설치되어 있는지 확인

## 디렉토리 구조 (Directory Structure)

```
D:\eventdb\
├── data\          # MongoDB 데이터
├── logs\          # MongoDB 로그
└── backup\        # 백업 파일
```

## 서비스 포트 (Service Ports)

### 개발 환경
- Frontend: http://localhost:3000 (npm start)
- Event Service: http://localhost:3001
- Church Service: http://localhost:3002
- Receipt Service: http://localhost:3003

### 프로덕션 환경
- Frontend: http://182.231.199.64:3000
- Event Service: http://182.231.199.64:3001
- Church Service: http://182.231.199.64:3002
- Receipt Service: http://182.231.199.64:3003

## 유용한 명령어 (Useful Commands)

```cmd
# 서비스 상태 확인
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.prod.yml ps

# 로그 확인
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.prod.yml logs -f

# 서비스 중지
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.prod.yml down

# 강제 재빌드
docker-compose -f docker-compose.dev.yml up --build --force-recreate -d
docker-compose -f docker-compose.prod.yml up --build --force-recreate -d
``` 