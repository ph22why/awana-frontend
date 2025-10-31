# 🍎 macOS 로컬 개발환경 가이드

AWANA 프로젝트의 macOS 로컬 개발환경 설정 가이드입니다.

## 📋 사전 요구사항

- **Docker Desktop for Mac** - [다운로드](https://www.docker.com/products/docker-desktop)
- **Node.js 18+** - [다운로드](https://nodejs.org/)
- **Git** - macOS에 기본 포함

## 🚀 빠른 시작

### 1. 프로젝트 클론 및 이동
```bash
git clone <repository-url>
cd AWANA
```

### 2. 로컬 개발환경 시작
```bash
./start-local-dev.sh
```

이 스크립트는 다음을 자동으로 수행합니다:
- 필요한 데이터 디렉토리 생성
- Docker 서비스들 시작
- MySQL 데이터베이스 초기화

## 🔐 환경 변수 설정

1. `.env.example` 파일을 복사해서 루트에 `.env` 파일을 생성합니다.
2. MongoDB, MySQL, 관리자 PIN 등 민감한 값을 안전한 값으로 교체합니다.
3. `.env` 파일은 `.gitignore`에 포함되어 있어 공개 저장소에 업로드되지 않습니다.
4. Windows 배치 스크립트용 별도 값은 `secrets/credentials.example.bat`를 복사해 `secrets/credentials.bat`로 만들고 수정하세요 (git에 커밋하지 않습니다).
> `.env` 파일이 없으면 `start-local-dev.sh` 실행이 중단됩니다.

## 🌐 서비스 접속 URL

개발환경이 시작되면 다음 URL로 접속할 수 있습니다:

| 서비스 | URL | 설명 |
|--------|-----|------|
| **AWANA 메인 앱** | http://localhost:3000 | 기존 AWANA 메인 애플리케이션 |
| **TNT 캠프 앱** | http://localhost:3100 | TNT 캠프 메인 애플리케이션 |
| **TNT 캠프 관리자** | http://localhost:3101 | TNT 캠프 관리자 페이지 |
| **Backend API** | http://localhost:8080 | TNT 캠프 백엔드 API |
| **Event Service** | http://localhost:3001 | 이벤트 관리 서비스 |
| **Church Service** | http://localhost:3002 | 교회 관리 서비스 |
| **Receipt Service** | http://localhost:3003 | 영수증 관리 서비스 |

## 🗄️ 데이터베이스 정보

모든 자격 증명은 `.env` 파일의 값을 사용합니다. 기본적으로 다음 키를 설정합니다:

### MongoDB (기존 AWANA 서비스용)
- **호스트**: `localhost:27017`
- **사용자명 변수**: `MONGO_INITDB_ROOT_USERNAME`
- **비밀번호 변수**: `MONGO_INITDB_ROOT_PASSWORD`
- **주요 데이터베이스 변수**: `MONGO_EVENT_DB`, `MONGO_CHURCH_DB`, `MONGO_RECEIPT_DB`, `MONGO_BT_DB`

### MySQL (TNT 캠프용)
- **호스트**: `localhost:3306`
- **사용자명 변수**: `MYSQL_USER`
- **비밀번호 변수**: `MYSQL_PASSWORD`
- **데이터베이스 변수**: `MYSQL_DATABASE`

필요에 따라 값 이름을 변경할 수 있지만 `.env`와 Docker Compose 설정에서 동일한 키를 사용해야 합니다.

## 📁 프로젝트 구조

```
AWANA/
├── services/                     # 기존 AWANA 마이크로서비스
│   ├── event-service/
│   ├── church-service/
│   └── receipt-service/
├── frontend/
│   ├── bt-app/                   # BT 신청 페이지 (Lovable 기본)
│   ├── bt-admin/                 # BT 관리자 페이지 (Lovable 기본)
│   ├── english-camp-app/         # TNT 캠프 메인 앱
│   └── english-camp-admin/       # TNT 캠프 관리자 앱
├── backend-server/               # TNT 캠프 백엔드
├── data/                         # 로컬 데이터 저장소
│   ├── mongodb/
│   ├── mysql/
│   └── uploads/
├── logs/                         # 로그 파일
├── docker-compose.local.yml      # 로컬 개발용 Docker Compose
└── start-local-dev.sh           # 개발환경 시작 스크립트
```

## 🛠️ 개발 명령어

### 서비스 관리
```bash
# 모든 서비스 시작
docker-compose -f docker-compose.local.yml up -d

# 모든 서비스 중지
docker-compose -f docker-compose.local.yml down

# 특정 서비스 재시작
docker-compose -f docker-compose.local.yml restart tntcamp-backend

# 서비스 상태 확인
docker-compose -f docker-compose.local.yml ps
```

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose -f docker-compose.local.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.local.yml logs -f tntcamp-backend
docker-compose -f docker-compose.local.yml logs -f mysql
```

### 데이터베이스 접속
```bash
# MySQL 접속 (macOS/Linux)
source .env && docker exec -it awana-mysql-1 mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"

# MongoDB 접속 (macOS/Linux)
source .env && docker exec -it awana-mongodb-1 mongosh -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase "$MONGO_AUTH_DB"
```

> Windows PowerShell의 경우: `Get-Content .env | foreach { if ($_ -match '^(.*)=(.*)$') { Set-Item -Path Env:$($matches[1]) -Value $matches[2] } }` 명령으로 환경 변수를 로드한 뒤 위 명령의 `$VARIABLE` 부분을 그대로 사용할 수 있습니다.

## 🔧 개발 팁

### 1. 핫 리로드 활성화
React 앱들은 소스 코드 변경 시 자동으로 리로드됩니다:
- `frontend/bt-app` → http://localhost:3000 (필요 시 `--port` 옵션 조정)
- `frontend/bt-admin` → http://localhost:3001
- `frontend/english-camp-app` → http://localhost:3100
- `frontend/english-camp-admin` → http://localhost:3101

### 2. 백엔드 개발
백엔드 코드 변경 시 컨테이너를 재시작해야 합니다:
```bash
docker-compose -f docker-compose.local.yml restart tntcamp-backend
```

### 3. 데이터베이스 초기화
MySQL 데이터베이스를 초기화하려면:
```bash
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up -d
```

## 🐛 문제 해결

### Port already in use 에러
```bash
# 사용 중인 포트 확인
lsof -i :3306  # MySQL
lsof -i :27017 # MongoDB

# 프로세스 종료
kill -9 <PID>
```

### Docker 컨테이너 완전 정리
```bash
docker-compose -f docker-compose.local.yml down -v --remove-orphans
docker system prune -f
```

### 권한 문제 해결
```bash
chmod +x start-local-dev.sh
sudo chown -R $(whoami) data/ logs/
```

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. Docker Desktop이 실행 중인지 확인
2. 필요한 포트들이 사용 가능한지 확인
3. 로그를 확인하여 에러 메시지 파악

---

Happy Coding! 🎉 
