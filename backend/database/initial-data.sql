-- 게임 이벤트 플랫폼 초기 데이터
-- 이 파일은 Git에 포함되어 배포 시 기본 데이터를 삽입하는 데 사용됩니다.

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
