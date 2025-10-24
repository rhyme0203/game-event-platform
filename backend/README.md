# 🎮 게임 이벤트 플랫폼 백엔드

럭키빤쓰 게임 이벤트 플랫폼의 Node.js + SQLite 백엔드 API 서버입니다.

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 데이터베이스 설정
```bash
# 새로 설정 (권장)
npm run setup-db

# 또는 기존 방식
npm run init-db
```

### 3. 서버 실행
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 📊 데이터베이스 관리

### 데이터베이스 초기화
```bash
# 데이터베이스 완전 초기화
npm run reset-db
```

### 데이터베이스 파일 위치
- **개발용**: `backend/database/game_platform.db`
- **스키마**: `backend/database/schema.sql`
- **초기 데이터**: `backend/database/initial-data.sql`

## 🔧 Git 배포 가이드

### Git에서 클론 후 설정
```bash
# 1. 저장소 클론
git clone <repository-url>
cd game-event-platform

# 2. 백엔드 의존성 설치
cd backend
npm install

# 3. 데이터베이스 설정
npm run setup-db

# 4. 서버 실행
npm start
```

### Git에 포함되는 파일
- ✅ `schema.sql` - 데이터베이스 스키마
- ✅ `initial-data.sql` - 초기 데이터
- ✅ `setup-database.js` - 자동 설정 스크립트
- ❌ `game_platform.db` - 실제 데이터베이스 파일 (로컬에서 생성)

## 📡 API 엔드포인트

### 게임 관리
- `GET /api/games` - 모든 게임 설정
- `GET /api/games/:gameId` - 특정 게임 설정
- `PUT /api/games/:gameId` - 게임 설정 업데이트

### 사용자 관리
- `POST /api/users` - 사용자 등록/업데이트

### 게임 플레이
- `POST /api/game-plays` - 게임 플레이 기록
- `GET /api/game-plays` - 게임 플레이 기록 조회

### 통계
- `GET /api/statistics` - 통계 조회

### 시스템 설정
- `GET /api/settings` - 시스템 설정 조회
- `PUT /api/settings` - 시스템 설정 업데이트

### 헬스 체크
- `GET /api/health` - 서버 상태 확인

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- **games**: 게임 설정 (룰렛, 슬롯, 캡슐, 스크래치)
- **prizes**: 경품 정보 (확률, 색상, 이모지)
- **users**: 사용자 정보 및 통계
- **game_plays**: 게임 플레이 기록
- **statistics**: 일일/게임별 통계
- **system_settings**: 시스템 설정

## 🔄 배포 시 주의사항

1. **데이터베이스 파일은 Git에 포함되지 않음**
   - 각 환경에서 `npm run setup-db` 실행 필요
   - 기존 데이터는 백업 후 새로 생성됨

2. **환경별 설정**
   - 개발: 로컬 SQLite 파일
   - 프로덕션: 별도 데이터베이스 서버 권장

3. **데이터 마이그레이션**
   - 기존 로컬스토리지 데이터는 수동 마이그레이션 필요
   - API를 통한 데이터 내보내기/가져오기 기능 제공

## 🛠️ 개발 도구

### 데이터베이스 브라우저
```bash
# SQLite 브라우저로 데이터베이스 확인
sqlite3 database/game_platform.db
```

### 로그 확인
```bash
# 서버 로그 확인
npm run dev
```

## 📝 라이선스

MIT License
