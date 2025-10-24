const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '..', 'database', 'game_platform.db');

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err.message);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
  }
});

// 테이블 생성 SQL
const createTables = `
-- 게임 설정 테이블
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT 1,
  attempts INTEGER DEFAULT 3,
  spin_duration INTEGER DEFAULT 4,
  settings TEXT, -- JSON 형태로 저장
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 경품 테이블
CREATE TABLE IF NOT EXISTS prizes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  name TEXT NOT NULL,
  probability INTEGER NOT NULL,
  color TEXT DEFAULT '#95a5a6',
  emoji TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  phone_number TEXT,
  email TEXT,
  total_plays INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  last_play_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 게임 플레이 기록 테이블
CREATE TABLE IF NOT EXISTS game_plays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  won BOOLEAN DEFAULT 0,
  prize_name TEXT,
  prize_value INTEGER DEFAULT 0,
  play_data TEXT, -- JSON 형태로 저장
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 통계 테이블
CREATE TABLE IF NOT EXISTS statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  game_id TEXT,
  total_plays INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_revenue INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, game_id)
);

-- 시스템 설정 테이블
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_game_plays_game_id ON game_plays(game_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_user_id ON game_plays(user_id);
CREATE INDEX IF NOT EXISTS idx_game_plays_created_at ON game_plays(created_at);
CREATE INDEX IF NOT EXISTS idx_statistics_date ON statistics(date);
CREATE INDEX IF NOT EXISTS idx_statistics_game_id ON statistics(game_id);
`;

// 초기 데이터 삽입
const insertInitialData = `
-- 기본 게임 설정
INSERT OR REPLACE INTO games (id, name, enabled, attempts, spin_duration, settings) VALUES
('roulette', '룰렛', 1, 3, 4, '{"animationType": "spin", "showPin": true}'),
('slot', '슬롯머신', 1, 3, 3, '{"reelCount": 3, "symbolCount": 8}'),
('capsule', '캡슐뽑기', 1, 3, 2, '{"capsuleCount": 6, "animationType": "float"}'),
('scratch', '스크래치', 1, 3, 1, '{"revealPercent": 70, "adTrigger": 30}');

-- 룰렛 경품
INSERT OR REPLACE INTO prizes (game_id, name, probability, color, sort_order) VALUES
('roulette', '1등: 스타벅스 기프티콘', 5, '#ff6b6b', 1),
('roulette', '2등: 5,000 포인트', 10, '#4ecdc4', 2),
('roulette', '3등: 3,000 포인트', 15, '#45b7d1', 3),
('roulette', '꽝: 다음 기회에', 70, '#95a5a6', 4);

-- 슬롯머신 경품
INSERT OR REPLACE INTO prizes (game_id, name, probability, color, emoji, sort_order) VALUES
('slot', 'JACKPOT! 10,000 포인트', 1, '#ffd700', '💎💎💎', 1),
('slot', '5,000 포인트', 5, '#ff6b6b', '🍒🍒🍒', 2),
('slot', '3,000 포인트', 10, '#4ecdc4', '⭐⭐⭐', 3),
('slot', '꽝: 다음 기회에', 84, '#95a5a6', '😢', 4);

-- 캡슐뽑기 경품
INSERT OR REPLACE INTO prizes (game_id, name, probability, color, emoji, sort_order) VALUES
('capsule', '1등: 10,000원 상품권', 5, '#ffd700', '💎', 1),
('capsule', '2등: 5,000원 상품권', 10, '#ff6b6b', '🎁', 2),
('capsule', '3등: 3,000원 상품권', 15, '#4ecdc4', '🎉', 3),
('capsule', '꽝: 다음 기회에', 70, '#95a5a6', '😢', 4);

-- 스크래치 경품
INSERT OR REPLACE INTO prizes (game_id, name, probability, color, emoji, sort_order) VALUES
('scratch', '대박! 50,000원 상품권', 1, '#ffd700', '💎', 1),
('scratch', '축하! 10,000원 상품권', 5, '#ff6b6b', '🎁', 2),
('scratch', '3,000원 상품권', 10, '#4ecdc4', '🎉', 3),
('scratch', '꽝: 다음 기회에', 84, '#95a5a6', '😢', 4);

-- 시스템 설정
INSERT OR REPLACE INTO system_settings (key, value, description) VALUES
('site_name', '럭키빤쓰', '사이트 이름'),
('maintenance', 'false', '점검 모드'),
('ad_enabled', 'true', '광고 활성화'),
('max_daily_plays', '3', '일일 최대 참여 횟수'),
('prize_delivery_method', 'email', '경품 전달 방법');
`;

// 데이터베이스 초기화 실행
db.serialize(() => {
  console.log('데이터베이스 테이블 생성 중...');
  
  // 테이블 생성
  db.exec(createTables, (err) => {
    if (err) {
      console.error('테이블 생성 실패:', err.message);
    } else {
      console.log('테이블 생성 완료');
    }
  });
  
  // 초기 데이터 삽입
  db.exec(insertInitialData, (err) => {
    if (err) {
      console.error('초기 데이터 삽입 실패:', err.message);
    } else {
      console.log('초기 데이터 삽입 완료');
    }
    
    // 데이터베이스 연결 종료
    db.close((err) => {
      if (err) {
        console.error('데이터베이스 연결 종료 실패:', err.message);
      } else {
        console.log('데이터베이스 초기화 완료!');
        console.log('데이터베이스 파일 위치:', dbPath);
      }
    });
  });
});
