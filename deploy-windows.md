# AWANA 윈도우 서버 배포 가이드

## 사전 준비사항

### 1. 필수 소프트웨어 설치
- **Docker Desktop for Windows**: https://www.docker.com/products/docker-desktop/
- **Node.js** (v16 이상): https://nodejs.org/
- **Git**: https://git-scm.com/download/win

### 2. WSL 2 설정 (Windows 10/11)
```powershell
# WSL 2 설치
wsl --install

# Docker Desktop에서 WSL 2 사용 설정
```

### 3. 비밀 값 구성
- 루트 `.env.example`을 복사해 `.env` 파일을 만들고 자격 증명을 입력하세요.
- `secrets\credentials.example.bat`을 `secrets\credentials.bat`으로 복사 후 동일한 값으로 설정하세요.
- 두 파일 모두 Git에 커밋하지 말고 안전하게 보관하세요.

## 배포 단계

### 1. 프로젝트 다운로드
```cmd
git clone <repository-url>
cd AWANA
```

### 2. MongoDB 데이터 디렉토리 설정
```cmd
# 관리자 권한으로 실행
setup-mongodb-windows.bat
```

### 3. 백엔드 서비스 실행
```cmd
# 방법 1: 배치 파일 사용 (권장)
start-services-windows.bat

# 방법 2: 직접 명령어 실행
docker-compose -f docker-compose.windows.yml up --build -d
```

### 4. 프론트엔드 빌드 및 실행
```cmd
# 방법 1: 배치 파일 사용
build-frontend-windows.bat

# 방법 2: 직접 명령어 실행
npm install
set NODE_ENV=production
npm run build
npx serve -s build -l 3000
```

## 서비스 관리

### 서비스 상태 확인
```cmd
docker-compose -f docker-compose.windows.yml ps
```

### 로그 확인
```cmd
# 모든 서비스 로그
docker-compose -f docker-compose.windows.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.windows.yml logs -f event-service

# MongoDB 로그 (호스트 파일)
type D:\awanadb\logs\mongod.log
```

### 서비스 중지
```cmd
docker-compose -f docker-compose.windows.yml down
```

### 서비스 재시작
```cmd
docker-compose -f docker-compose.windows.yml restart
```

## 포트 설정

### 방화벽 설정
Windows 방화벽에서 다음 포트 허용:
- **3000**: 프론트엔드
- **3001**: Event Service
- **3002**: Church Service  
- **3003**: Receipt Service
- **27017**: MongoDB

### 포트 확인
```cmd
netstat -an | findstr :3000
netstat -an | findstr :3001
netstat -an | findstr :3002
netstat -an | findstr :3003
```

## 환경 변수 설정

### 프로덕션 환경 변수
```cmd
set NODE_ENV=production
set SERVER_IP=112.145.65.29
```

### 프론트엔드 API 설정
프로덕션 환경에서는 자동으로 IP 주소를 사용합니다:
- Event API: `http://112.145.65.29:3001`
- Church API: `http://112.145.65.29:3002`
- Receipt API: `http://112.145.65.29:3003`

## MongoDB 데이터 관리

### 데이터 저장 위치
- **데이터**: `D:\awanadb\data\`
- **로그**: `D:\awanadb\logs\`
- **백업**: `D:\awanadb\backup\`

### 데이터베이스 접속 정보
- 자격 증명은 `secrets\credentials.bat` 파일에서 설정합니다 (템플릿: `secrets\credentials.example.bat`).
- 필수 키: `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`, `MONGO_AUTH_DB`.

### 데이터 백업
```cmd
# 자동 백업 (배치 파일 사용)
backup-mongodb-windows.bat

# 수동 백업
call secrets\credentials.bat
docker exec awana-mongodb-1 mongodump --username %MONGO_INITDB_ROOT_USERNAME% --password %MONGO_INITDB_ROOT_PASSWORD% --authenticationDatabase %MONGO_AUTH_DB% --db %MONGO_EVENT_DB% --out /data/backup/manual-event-service-backup
```

### 데이터 복구
```cmd
# 자동 복구 (배치 파일 사용)
restore-mongodb-windows.bat

# 수동 복구
call secrets\credentials.bat
docker exec awana-mongodb-1 mongorestore --username %MONGO_INITDB_ROOT_USERNAME% --password %MONGO_INITDB_ROOT_PASSWORD% --authenticationDatabase %MONGO_AUTH_DB% --db %MONGO_EVENT_DB% --drop /data/backup/event-service_manual/event-service/
```

## 문제 해결

### Docker 관련 문제
```cmd
# Docker 서비스 재시작
net stop com.docker.service
net start com.docker.service

# Docker Desktop 재시작
```

### 포트 충돌 해결
```cmd
# 포트 사용 중인 프로세스 확인
netstat -ano | findstr :3000

# 프로세스 종료
taskkill /PID <process-id> /F
```

### MongoDB 연결 문제
```cmd
# MongoDB 컨테이너 상태 확인
docker logs awana-mongodb-1

# MongoDB 재시작
docker-compose -f docker-compose.windows.yml restart mongodb

# 데이터 디렉토리 권한 확인
icacls "D:\awanadb" /T
```

### 데이터 디렉토리 문제
```cmd
# 디렉토리 권한 재설정
icacls "D:\awanadb" /grant "Everyone:(OI)(CI)F" /T

# 디렉토리 생성
mkdir "D:\awanadb\data"
mkdir "D:\awanadb\logs"
mkdir "D:\awanadb\backup"
```

## 자동 시작 설정

### Windows 서비스로 등록 (선택사항)
1. **NSSM** 설치: https://nssm.cc/
2. 서비스 등록:
```cmd
nssm install AWANA-Backend "docker-compose -f docker-compose.windows.yml up -d"
nssm start AWANA-Backend
```

## 모니터링

### 리소스 사용량 확인
```cmd
# Docker 리소스 사용량
docker stats

# 시스템 리소스
taskmgr

# 디스크 사용량
dir "D:\awanadb" /s
```

### 로그 파일 위치
- **Docker 로그**: Docker Desktop 로그
- **MongoDB 로그**: `D:\awanadb\logs\mongod.log`
- **애플리케이션 로그**: 각 컨테이너 내부

## 백업 및 복구

### 자동 백업 스케줄링
Windows 작업 스케줄러를 사용하여 정기 백업 설정:
```cmd
# 작업 스케줄러에 등록
schtasks /create /tn "AWANA-MongoDB-Backup" /tr "C:\path\to\AWANA\backup-mongodb-windows.bat" /sc daily /st 02:00
```

### 백업 파일 관리
- 백업 파일은 `D:\awanadb\backup\`에 저장됩니다
- 날짜별로 폴더가 생성됩니다 (예: `event-service_2024-01-01_12-00-00`)
- 정기적으로 외부 저장소에 백업 파일을 복사하세요

## 보안 설정

### MongoDB 보안
- `secrets\credentials.bat`에 설정한 사용자/비밀번호를 사용합니다 (공개 저장소에 커밋하지 마세요).
- 프로덕션 환경에서는 반드시 강력한 비밀번호를 사용하세요.
- 방화벽에서 MongoDB 포트(27017) 접근을 제한하세요

### 데이터 보호
- `D:\awanadb\` 디렉토리에 대한 접근 권한을 제한하세요
- 정기적인 백업을 수행하세요
- 백업 파일을 암호화하여 저장하세요 
