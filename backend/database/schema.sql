-- 게임 이벤트 플랫폼 데이터베이스 스키마
-- 이 파일은 Git에 포함되어 배포 시 데이터베이스를 초기화하는 데 사용됩니다.

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
