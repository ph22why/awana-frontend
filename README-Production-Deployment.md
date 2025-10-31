# TNT Camp 프로덕션 배포 가이드

## 🚀 **배포 전 준비사항**

### 1. **Git 저장소 정리**
배포 전에 불필요한 파일들이 Git에 포함되지 않도록 확인하세요:

```powershell
# Git 상태 확인
git status

# .gitignore가 제대로 적용되었는지 확인
git check-ignore -v node_modules/
git check-ignore -v */build/
git check-ignore -v *.log

# 캐시된 파일들 제거 (필요시)
git rm -r --cached node_modules/
git rm -r --cached */build/
git rm -r --cached *.log
```

**주요 제외 파일들:**
- `node_modules/` (모든 디렉토리)
- `*/build/` (빌드된 프론트엔드 파일들)
- `.env` 파일들 (환경 변수)
- `logs/`, `uploads/`, `data/` (런타임 데이터)
- `*.log` (로그 파일들)

### 2. **Windows 서버 디렉토리 생성**
다음 디렉토리들을 서버에 미리 생성해주세요:

```powershell
# TNT Camp 관련 디렉토리 생성
New-Item -ItemType Directory -Force -Path "D:\tntcampdb\mysql"
New-Item -ItemType Directory -Force -Path "D:\tntcampdb\init" 
New-Item -ItemType Directory -Force -Path "D:\tntcampdb\backup"
New-Item -ItemType Directory -Force -Path "D:\tntcampdb\uploads"
New-Item -ItemType Directory -Force -Path "D:\tntcampdb\logs"
```

### 3. **데이터베이스 초기화 스크립트 복사**
`init/init-production.sql` 파일을 서버의 `D:\tntcampdb\init\` 폴더에 복사하세요.

### 4. **환경 변수 및 비밀 설정**
- 루트의 `.env.example`을 `.env`로 복사하고 MongoDB/MySQL 자격 증명, 관리자 PIN 등 민감한 값을 입력합니다.
- `secrets\credentials.example.bat`을 `secrets\credentials.bat`으로 복사하여 동일한 값으로 채웁니다.
- 두 파일은 `.gitignore`에 포함되어 있어 공개 저장소에 올라가지 않습니다.

## 🔧 **배포 단계**

### 1. **기존 서비스 종료**
```powershell
cd C:\path\to\awana\project
docker-compose -f docker-compose.https-awanaevent-final.yml down
```

### 2. **최신 코드 가져오기**
```powershell
# Git으로 최신 코드 가져오기
git pull origin master

# 또는 파일 직접 복사 (Git 사용하지 않는 경우)
# 다음 파일/폴더들을 서버에 복사:
# - frontend/english-camp-admin/
# - frontend/english-camp-app/  
# - backend-server/
# - docker-compose.https-awanaevent-final.yml
# - nginx-https-awanaevent-with-api-proxy.conf
# - init/init-production.sql
```

### 3. **Docker 이미지 빌드 및 실행**
```powershell
# 새로운 이미지 빌드 (기존 캐시 무시)
docker-compose -f docker-compose.https-awanaevent-final.yml build --no-cache

# 서비스 시작
docker-compose -f docker-compose.https-awanaevent-final.yml up -d
```

### 4. **MySQL 초기화 확인**
```powershell
# MySQL 컨테이너 로그 확인
docker-compose -f docker-compose.https-awanaevent-final.yml logs mysql

# MySQL 데이터베이스 연결 테스트 (PowerShell 환경 변수 사용)
# 1) 환경 변수 로드: Get-Content .env | ForEach-Object { if ($_ -match '^(.*?)=(.*)$') { [Environment]::SetEnvironmentVariable($matches[1], $matches[2]) } }
# 2) 연결 테스트
docker-compose -f docker-compose.https-awanaevent-final.yml exec mysql mysql -u $Env:MYSQL_USER -p$Env:MYSQL_PASSWORD $Env:MYSQL_DATABASE -e "SHOW TABLES;"
```

### 5. **서비스 상태 확인**
```powershell
# 모든 컨테이너 상태 확인
docker-compose -f docker-compose.https-awanaevent-final.yml ps

# 백엔드 로그 확인
docker-compose -f docker-compose.https-awanaevent-final.yml logs tntcamp-backend

# 프론트엔드 앱 로그 확인
docker-compose -f docker-compose.https-awanaevent-final.yml logs tntcamp-app
docker-compose -f docker-compose.https-awanaevent-final.yml logs tntcamp-admin
```

## 🌐 **서비스 URL**

### 프로덕션 URL들:
- **TNT Camp 메인**: https://awanaevent.com/tntcamp
- **TNT Camp 관리자**: https://awanaevent.com/tntadmin  
- **백엔드 API**: https://awanaevent.com/api/tnt-endpoints

### API 엔드포인트 예시:
- **등록**: `POST https://awanaevent.com/register/student`
- **사용자 조회**: `POST https://awanaevent.com/checkUser`
- **교회 조회**: `POST https://awanaevent.com/checkchurch`
- **관리자**: `GET https://awanaevent.com/admin/students`

## 🔍 **문제 해결**

### 1. **MySQL 연결 오류**
```powershell
# MySQL 컨테이너 재시작
docker-compose -f docker-compose.https-awanaevent-final.yml restart mysql

# 네트워크 확인
docker network ls
docker network inspect awana_awana-network
```

### 2. **백엔드 API 오류**
```powershell
# 백엔드 로그 실시간 확인
docker-compose -f docker-compose.https-awanaevent-final.yml logs -f tntcamp-backend

# 백엔드 컨테이너 재시작
docker-compose -f docker-compose.https-awanaevent-final.yml restart tntcamp-backend
```

### 3. **프론트엔드 로딩 오류**
```powershell
# nginx 설정 확인
docker-compose -f docker-compose.https-awanaevent-final.yml logs frontend

# 앱 컨테이너 재시작
docker-compose -f docker-compose.https-awanaevent-final.yml restart tntcamp-app
docker-compose -f docker-compose.https-awanaevent-final.yml restart tntcamp-admin
```

## 🔄 **데이터 백업 및 복원**

### 백업
```powershell
# MySQL 백업 (환경 변수 사용)
docker-compose -f docker-compose.https-awanaevent-final.yml exec mysql mysqldump -u root -p$Env:MYSQL_ROOT_PASSWORD $Env:MYSQL_DATABASE > D:\tntcampdb\backup\tntcamp_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

### 복원
```powershell
# MySQL 복원
docker-compose -f docker-compose.https-awanaevent-final.yml exec -T mysql mysql -u root -p$Env:MYSQL_ROOT_PASSWORD $Env:MYSQL_DATABASE < D:\tntcampdb\backup\backup_file.sql
```

## ⚠️ **주의사항**

1. **보안**: 프로덕션 환경에서는 반드시 강력한 패스워드를 사용하세요.
2. **백업**: 정기적으로 데이터베이스를 백업하세요.
3. **모니터링**: 서비스 상태를 정기적으로 확인하세요.
4. **로그**: 문제 발생시 로그를 확인하여 원인을 파악하세요.

## 📞 **지원**

배포 과정에서 문제가 발생하면 로그와 함께 문의해주세요:
- 백엔드 로그: `docker-compose logs tntcamp-backend`
- MySQL 로그: `docker-compose logs mysql`
- 프론트엔드 로그: `docker-compose logs tntcamp-app` 
