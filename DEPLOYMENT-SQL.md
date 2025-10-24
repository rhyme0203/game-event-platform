# 🚀 SQL 데이터베이스 배포 가이드

럭키빤쓰 게임 이벤트 플랫폼의 SQL 데이터베이스 시스템 배포 가이드입니다.

## 📋 배포 전 체크리스트

- [ ] Node.js 16+ 설치됨
- [ ] Git 저장소 클론됨
- [ ] 포트 3000, 8000 사용 가능
- [ ] SQLite3 지원

## 🎯 빠른 배포 (5분)

### 1단계: 저장소 클론
```bash
git clone https://github.com/rhyme0203/game-event-platform.git
cd game-event-platform
```

### 2단계: 백엔드 설정
```bash
cd backend
npm install
npm run setup-db
```

### 3단계: 서버 실행
```bash
# 터미널 1: API 서버
npm start

# 터미널 2: 프론트엔드 서버
cd ..
python3 -m http.server 8000
```

### 4단계: 접속 확인
- **프론트엔드**: http://localhost:8000
- **API 서버**: http://localhost:3000
- **룰렛 게임**: http://localhost:8000/games/roulette.html

## 🔧 상세 배포 가이드

### 백엔드 API 서버 설정

```bash
# 1. 의존성 설치
cd backend
npm install

# 2. 데이터베이스 초기화
npm run setup-db

# 3. 서버 실행
npm start
```

**API 엔드포인트**:
- `GET /api/health` - 서버 상태
- `GET /api/games` - 게임 설정
- `POST /api/game-plays` - 게임 플레이 기록
- `GET /api/statistics` - 통계

### 프론트엔드 서버 설정

```bash
# 프로젝트 루트에서
python3 -m http.server 8000
```

**접속 URL**:
- 메인 페이지: http://localhost:8000
- 룰렛 게임: http://localhost:8000/games/roulette.html
- 슬롯머신: http://localhost:8000/games/slot.html
- 캡슐뽑기: http://localhost:8000/games/capsule.html
- 스크래치: http://localhost:8000/games/scratch.html

## 🗄️ 데이터베이스 관리

### 데이터베이스 초기화
```bash
# 완전 초기화 (기존 데이터 삭제)
npm run reset-db

# 새로 설정
npm run setup-db
```

### 데이터베이스 백업
```bash
# 수동 백업
cp database/game_platform.db database/backup_$(date +%Y%m%d_%H%M%S).db

# 자동 백업 (스크립트 실행 시 자동 생성)
# backup 파일은 .gitignore에 포함됨
```

### 데이터베이스 확인
```bash
# SQLite 브라우저로 확인
sqlite3 database/game_platform.db
.tables
SELECT * FROM games;
.quit
```

## 🌐 프로덕션 배포

### AWS EC2 배포

```bash
# 1. EC2 인스턴스 접속
ssh -i your-key.pem ubuntu@your-ec2-ip

# 2. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 3. Node.js 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. 프로젝트 클론
git clone https://github.com/rhyme0203/game-event-platform.git
cd game-event-platform

# 5. 백엔드 설정
cd backend
npm install
npm run setup-db

# 6. PM2로 프로세스 관리
sudo npm install -g pm2
pm2 start server.js --name "game-api"
pm2 startup
pm2 save

# 7. Nginx 설정
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Nginx 설정

`/etc/nginx/sites-available/game-platform`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # API 서버 프록시
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 프론트엔드 서빙
    location / {
        root /path/to/game-event-platform;
        index index.html;
        try_files $uri $uri/ =404;
    }
}
```

## 🔍 문제 해결

### 포트 충돌
```bash
# 포트 사용 확인
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :8000

# 프로세스 종료
sudo kill -9 <PID>
```

### 데이터베이스 오류
```bash
# 데이터베이스 파일 권한 확인
ls -la database/
chmod 644 database/game_platform.db

# 데이터베이스 재생성
rm -f database/game_platform.db
npm run setup-db
```

### API 연결 오류
```bash
# API 서버 상태 확인
curl http://localhost:3000/api/health

# 로그 확인
pm2 logs game-api
```

## 📊 모니터링

### 서버 상태 확인
```bash
# API 서버 상태
curl http://localhost:3000/api/health

# 데이터베이스 연결 확인
curl http://localhost:3000/api/games

# 통계 확인
curl http://localhost:3000/api/statistics
```

### 로그 모니터링
```bash
# PM2 로그
pm2 logs game-api

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🎮 게임 테스트

### 룰렛 게임 테스트
1. http://localhost:8000/games/roulette.html 접속
2. 개발자 도구 콘솔에서 SQL API 로그 확인
3. 룰렛 돌리기 후 데이터베이스 기록 확인

### 데이터베이스 확인
```sql
-- 게임 플레이 기록 확인
SELECT * FROM game_plays ORDER BY created_at DESC LIMIT 10;

-- 통계 확인
SELECT * FROM statistics ORDER BY date DESC;

-- 사용자 확인
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
```

## 🚀 자동 배포 스크립트

`deploy.sh`:
```bash
#!/bin/bash
echo "🚀 게임 이벤트 플랫폼 배포 시작..."

# 최신 코드 받기
git pull origin main

# 백엔드 설정
cd backend
npm install
npm run setup-db

# 서버 재시작
pm2 restart game-api

echo "✅ 배포 완료!"
```

실행:
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📝 환경 변수

`.env` 파일 생성:
```bash
# 데이터베이스 설정
DB_PATH=./database/game_platform.db

# 서버 설정
PORT=3000
NODE_ENV=production

# 보안 설정
JWT_SECRET=your-secret-key
```

---

## 🎉 배포 완료!

이제 **완전한 SQL 기반 게임 이벤트 플랫폼**이 배포되었습니다!

- ✅ **SQLite 데이터베이스**: 영구 데이터 저장
- ✅ **RESTful API**: 모든 게임 기능 지원
- ✅ **실시간 통계**: 자동 통계 계산
- ✅ **관리자 기능**: 게임 설정 관리
- ✅ **Git 배포**: 코드 버전 관리

**접속 URL**: http://localhost:8000
