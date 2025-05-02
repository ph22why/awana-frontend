# AWANA Church Management System v1.2

> **핵심 기능 요약**
>
> - **교회 관리**: 교회 목록 조회, 실시간 검색, 교회 정보 등록/수정/삭제
> - **이벤트 관리**: 이벤트 목록 및 상태 조회, 샘플 기반 이벤트 생성, 이벤트 정보 수정/삭제
> - **영수증 관리**: 이벤트별 영수증 등록 및 관리
> - **실시간 검색 및 필터링**: 교회명, 위치, ID 등 다양한 조건으로 실시간 검색
> - **관리자 대시보드**: 전체 현황 요약, 주요 통계 제공
> - **RESTful API 제공**: 교회, 이벤트, 영수증 관련 API
> - **MongoDB 기반 데이터 관리**: 샘플 데이터 및 인덱스 설정 가이드 제공
> - **Docker 기반 배포**: Docker Compose로 손쉬운 배포 및 실행

교회 정보와 이벤트를 관리하기 위한 웹 기반 관리 시스템입니다.

## 주요 기능

### 1. 교회 관리 (ChurchManagePage)
- 교회 목록 조회
  - 페이지네이션 지원 (페이지당 항목 수 조절 가능: 10, 15, 20, 30, 50개)
  - 실시간 검색 기능
    - 교회명
    - 위치
    - 교회 ID (mainId-subId)
    - 대소문자 구분 없는 부분 검색 지원

- 교회 정보 관리
  - 새 교회 등록
  - 기존 교회 정보 수정
  - 교회 정보 삭제

### 2. 이벤트 관리 (EventManagePage)
- 이벤트 목록 조회
  - 이벤트 상태 표시 (예정/진행중/완료)
  - 이벤트 기본 정보 표시
    - 이벤트명
    - 시작일/종료일
    - 등록 기간
    - 장소
    - 공개 여부

- 이벤트 관리
  - 새 이벤트 생성
    - 샘플 이벤트 목록에서 선택
    - 날짜, 장소, 공개 여부 등 설정
  - 이벤트 수정
  - 이벤트 삭제

## 시스템 요구사항

- Node.js 16.x 이상
- MongoDB 4.x 이상
- Docker 및 Docker Compose

## 설치 및 실행 방법

1. 저장소 클론
```bash
git clone [repository-url]
cd AWANA
```

2. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env

# 필요한 환경 변수 설정
REACT_APP_API_URL=http://localhost:3000
```

3. Docker Compose로 서비스 실행
```bash
docker-compose up -d
```

## 교회 데이터베이스 설정

### 1. 초기 데이터 추가

MongoDB에 교회 데이터를 추가하는 방법은 다음과 같습니다:

1. MongoDB 컨테이너에 접속
```bash
docker exec -it awana-mongodb-1 mongosh
```

2. 데이터베이스 선택
```javascript
use church-service
```

3. 교회 컬렉션 생성 및 인덱스 설정
```javascript
db.createCollection("churches")
db.churches.createIndex({ mainId: 1, subId: 1 }, { unique: true })
```

4. 샘플 데이터 추가
```javascript
db.churches.insertMany([
  {
    mainId: "0001",
    subId: "a",
    name: "샘플교회1",
    location: "서울시 강남구"
  },
  // 추가 데이터...
])
```

### 2. 데이터 포맷

교회 데이터는 다음 형식을 따릅니다:
```javascript
{
  mainId: string,    // 4자리 숫자
  subId: string,     // 1자리 알파벳
  name: string,      // 교회명
  location: string   // 교회 위치
}
```

## API 엔드포인트

### Church Service API (기본 포트: 3003)

1. 교회 목록 조회
- GET `/api/churches?page={page}&search={search}&pageSize={pageSize}`
  - page: 페이지 번호 (기본값: 1)
  - search: 검색어
  - pageSize: 페이지당 항목 수 (기본값: 15)

2. 교회 추가
- POST `/api/churches`
  - Body: { mainId, subId, name, location }

3. 교회 수정
- PUT `/api/churches/{mainId}/{subId}`
  - Body: { name, location }

4. 교회 삭제
- DELETE `/api/churches/{mainId}/{subId}`

### Event Service API (기본 포트: 3001)

1. 이벤트 목록 조회
- GET `/api/events`

2. 샘플 이벤트 목록 조회
- GET `/api/events/samples`

3. 이벤트 생성
- POST `/api/events`
  - Body: EventFormData

4. 이벤트 수정
- PUT `/api/events/{id}`
  - Body: Partial<EventFormData>

5. 이벤트 삭제
- DELETE `/api/events/{id}`

### Event Service API (기본 포트: 3003)
- POST `/api/receipt`
- Body: ReceiptFormData

## 데이터 포맷

### 교회 데이터
```javascript
{
  mainId: string,    // 4자리 숫자
  subId: string,     // 1자리 알파벳
  name: string,      // 교회명
  location: string   // 교회 위치
}
```

### 이벤트 데이터
```javascript
{
  event_Name: string,           // 이벤트명
  event_Description?: string,   // 이벤트 설명
  event_Location: string,       // 상세 위치
  event_Year: number,          // 년도
  event_Month: number,         // 월
  event_Start_Date: string,    // 시작일 (YYYY-MM-DD)
  event_End_Date: string,      // 종료일 (YYYY-MM-DD)
  event_Registration_Start_Date: string,  // 등록 시작일
  event_Registration_End_Date: string,    // 등록 종료일
  event_Open_Available: '공개' | '비공개',  // 공개 여부
  event_Place: string          // 장소
}
```

## 버전 기록

### deploy v1.0

#### Client
- 교회 목록 조회 기능 구현
- 교회 검색 기능 구현 (이름, ID 기준)
- 영수증 조회 및 출력 기능 구현
- 반응형 UI 구현
- 페이지네이션 구현

#### Admin
- 교회 정보 관리 기능 구현 (등록/수정/삭제)
- 이벤트 관리 기능 구현 (등록/수정/삭제)
- 영수증 관리 기능 구현 (등록/수정/삭제)

### v1.3
- 영수증 관리 기능 추가
  - 영수증 목록 조회 및 수정
  - 영수증 데이터 추가
- API 응답 처리 개선
  - 다양한 응답 형식 지원
  - 에러 처리 강화

### v1.2
- 이벤트 관리 기능 추가
  - 이벤트 목록 조회 및 상태 표시
  - 샘플 이벤트 기반 새 이벤트 생성
  - 이벤트 수정/삭제 기능
- API 응답 처리 개선
  - 다양한 응답 형식 지원
  - 에러 처리 강화

### v1.1
- 교회 관리 페이지 구현
- 페이지네이션 기능 추가
- 실시간 검색 기능 구현
- 교회 정보 CRUD 기능 구현
- Docker 기반 배포 환경 구성

## 문제 해결

1. MongoDB 중복 키 에러
- 에러 메시지: `E11000 duplicate key error collection`
- 해결 방법: 
  ```javascript
  // 기존 데이터 확인
  db.churches.find({ mainId: "중복된_ID", subId: "중복된_서브ID" })
  
  // 필요한 경우 기존 데이터 삭제
  db.churches.deleteOne({ mainId: "중복된_ID", subId: "중복된_서브ID" })
  ```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 