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

### MongoDB (기존 AWANA 서비스용)
- **호스트**: localhost:27017
- **사용자명**: admin
- **비밀번호**: awana123
- **데이터베이스**: awana

### MySQL (TNT 캠프용)
- **호스트**: localhost:3306
- **사용자명**: tntcamp
- **비밀번호**: tntcamp123
- **데이터베이스**: tntcamp

## 📁 프로젝트 구조

```
AWANA/
├── services/                     # 기존 AWANA 마이크로서비스
│   ├── event-service/
│   ├── church-service/
│   └── receipt-service/
├── awana-english-camp-app/       # TNT 캠프 메인 앱
├── awana-english-camp-admin/     # TNT 캠프 관리자 앱
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
# MySQL 접속
docker exec -it awana-mysql-1 mysql -u tntcamp -ptntcamp123 tntcamp

# MongoDB 접속
docker exec -it awana-mongodb-1 mongosh -u admin -p awana123 --authenticationDatabase admin
```

## 🔧 개발 팁

### 1. 핫 리로드 활성화
React 앱들은 소스 코드 변경 시 자동으로 리로드됩니다:
- `awana-english-camp-app` → http://localhost:3100
- `awana-english-camp-admin` → http://localhost:3101

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