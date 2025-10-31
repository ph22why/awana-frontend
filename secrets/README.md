# Secrets Management

이 디렉터리는 배포/백업 스크립트에서 사용할 민감한 값을 보관하기 위한 공간입니다.  
공개 저장소에는 템플릿만 포함되고, 실제 자격 증명 파일은 커밋하지 않습니다.

## 사용할 파일

- `credentials.example.bat` &mdash; Windows 환경용 템플릿입니다.  
  `copy secrets\credentials.example.bat secrets\credentials.bat` 명령으로 복사한 뒤 안전한 값으로 수정하세요.
- `.env.example` (리포지토리 루트) &mdash; Docker Compose 및 프런트엔드 빌드에 필요한 값 템플릿입니다.  
  `.env` 파일로 복사하여 사용하고 커밋하지 마세요.

## 권장 워크플로

1. `credentials.example.bat`을 복사해 `credentials.bat` 생성.
2. MongoDB/MySQL 비밀번호와 관리자 PIN 등 필수 값을 강력한 값으로 교체.
3. 루트의 `.env.example`을 복사해 `.env` 생성 후 동일한 값으로 설정.
4. Windows 배치 스크립트(`backup-*.bat` 등)는 자동으로 `credentials.bat`을 로드합니다.
5. `.env` 파일은 Docker Compose, `start-local-dev.sh`, CRA 빌드 등에서 사용됩니다.

> `credentials.bat`과 `.env`는 `.gitignore`에 의해 무시되므로 공개 저장소로 올라가지 않습니다.
