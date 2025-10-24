const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 서빙 (프론트엔드)
app.use(express.static(path.join(__dirname, '..')));

// 데이터베이스 연결
const dbPath = path.join(__dirname, 'database', 'game_platform.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err.message);
  } else {
    console.log('SQLite 데이터베이스에 연결되었습니다.');
  }
});

// 데이터베이스 디렉토리 생성
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// ==================== API 라우트 ====================

// 1. 게임 설정 관련 API

// 모든 게임 설정 가져오기
app.get('/api/games', (req, res) => {
  const query = `
    SELECT g.*, 
           GROUP_CONCAT(
             json_object(
               'id', p.id,
               'name', p.name,
               'probability', p.probability,
               'color', p.color,
               'emoji', p.emoji,
               'sort_order', p.sort_order
             )
           ) as prizes
    FROM games g
    LEFT JOIN prizes p ON g.id = p.game_id
    GROUP BY g.id
    ORDER BY g.id
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      const games = rows.map(row => ({
        ...row,
        prizes: row.prizes ? JSON.parse('[' + row.prizes + ']') : []
      }));
      res.json({ success: true, data: games });
    }
  });
});

// 특정 게임 설정 가져오기
app.get('/api/games/:gameId', (req, res) => {
  const { gameId } = req.params;
  
  const gameQuery = 'SELECT * FROM games WHERE id = ?';
  const prizesQuery = 'SELECT * FROM prizes WHERE game_id = ? ORDER BY sort_order';
  
  db.get(gameQuery, [gameId], (err, game) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else if (!game) {
      res.status(404).json({ success: false, error: '게임을 찾을 수 없습니다.' });
    } else {
      db.all(prizesQuery, [gameId], (err, prizes) => {
        if (err) {
          res.status(500).json({ success: false, error: err.message });
        } else {
          res.json({ 
            success: true, 
            data: { ...game, prizes: prizes || [] }
          });
        }
      });
    }
  });
});

// 게임 설정 업데이트
app.put('/api/games/:gameId', (req, res) => {
  const { gameId } = req.params;
  const { name, enabled, attempts, spin_duration, settings, prizes } = req.body;
  
  const updateGameQuery = `
    UPDATE games 
    SET name = ?, enabled = ?, attempts = ?, spin_duration = ?, settings = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(updateGameQuery, [name, enabled, attempts, spin_duration, JSON.stringify(settings), gameId], function(err) {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      // 경품 업데이트
      if (prizes && prizes.length > 0) {
        // 기존 경품 삭제
        db.run('DELETE FROM prizes WHERE game_id = ?', [gameId], (err) => {
          if (err) {
            console.error('기존 경품 삭제 실패:', err.message);
          }
        });
        
        // 새 경품 삽입
        const insertPrizeQuery = `
          INSERT INTO prizes (game_id, name, probability, color, emoji, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        prizes.forEach((prize, index) => {
          db.run(insertPrizeQuery, [
            gameId, 
            prize.name, 
            prize.probability, 
            prize.color || '#95a5a6',
            prize.emoji || null,
            prize.sort_order || index + 1
          ]);
        });
      }
      
      res.json({ success: true, message: '게임 설정이 업데이트되었습니다.' });
    }
  });
});

// 2. 사용자 관련 API

// 사용자 생성 또는 가져오기
app.post('/api/users', (req, res) => {
  const { ip_address, user_agent, phone_number, email } = req.body;
  
  // IP 주소로 기존 사용자 찾기
  const findUserQuery = 'SELECT * FROM users WHERE ip_address = ?';
  
  db.get(findUserQuery, [ip_address], (err, user) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else if (user) {
      // 기존 사용자 정보 업데이트
      const updateQuery = `
        UPDATE users 
        SET user_agent = ?, phone_number = ?, email = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(updateQuery, [user_agent, phone_number, email, user.id], (err) => {
        if (err) {
          res.status(500).json({ success: false, error: err.message });
        } else {
          res.json({ success: true, data: user });
        }
      });
    } else {
      // 새 사용자 생성
      const userId = 'user_' + Date.now();
      const insertQuery = `
        INSERT INTO users (id, ip_address, user_agent, phone_number, email)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(insertQuery, [userId, ip_address, user_agent, phone_number, email], function(err) {
        if (err) {
          res.status(500).json({ success: false, error: err.message });
        } else {
          const newUser = {
            id: userId,
            ip_address,
            user_agent,
            phone_number,
            email,
            total_plays: 0,
            total_wins: 0
          };
          res.json({ success: true, data: newUser });
        }
      });
    }
  });
});

// 3. 게임 플레이 관련 API

// 게임 플레이 기록
app.post('/api/game-plays', (req, res) => {
  const { game_id, user_id, won, prize_name, prize_value, play_data, ip_address, user_agent } = req.body;
  
  const insertQuery = `
    INSERT INTO game_plays (game_id, user_id, won, prize_name, prize_value, play_data, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(insertQuery, [
    game_id, user_id, won, prize_name, prize_value, 
    JSON.stringify(play_data), ip_address, user_agent
  ], function(err) {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      // 사용자 통계 업데이트
      const updateUserQuery = `
        UPDATE users 
        SET total_plays = total_plays + 1,
            total_wins = total_wins + ?,
            last_play_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      db.run(updateUserQuery, [won ? 1 : 0, user_id]);
      
      // 일일 통계 업데이트
      const today = new Date().toISOString().split('T')[0];
      const updateStatsQuery = `
        INSERT OR REPLACE INTO statistics (date, game_id, total_plays, total_wins, total_revenue, unique_users)
        VALUES (?, ?, 
                COALESCE((SELECT total_plays FROM statistics WHERE date = ? AND game_id = ?), 0) + 1,
                COALESCE((SELECT total_wins FROM statistics WHERE date = ? AND game_id = ?), 0) + ?,
                COALESCE((SELECT total_revenue FROM statistics WHERE date = ? AND game_id = ?), 0) + ?,
                (SELECT COUNT(DISTINCT user_id) FROM game_plays WHERE DATE(created_at) = ? AND game_id = ?)
        )
      `;
      
      db.run(updateStatsQuery, [
        today, game_id, today, game_id, today, game_id, won ? 1 : 0,
        today, game_id, prize_value || 0, today, game_id
      ]);
      
      res.json({ 
        success: true, 
        data: { 
          id: this.lastID,
          game_id, user_id, won, prize_name, prize_value 
        }
      });
    }
  });
});

// 게임 플레이 기록 조회
app.get('/api/game-plays', (req, res) => {
  const { game_id, user_id, limit = 100, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM game_plays WHERE 1=1';
  const params = [];
  
  if (game_id) {
    query += ' AND game_id = ?';
    params.push(game_id);
  }
  
  if (user_id) {
    query += ' AND user_id = ?';
    params.push(user_id);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.json({ success: true, data: rows });
    }
  });
});

// 4. 통계 관련 API

// 전체 통계 조회
app.get('/api/statistics', (req, res) => {
  const { date, game_id } = req.query;
  
  let query = `
    SELECT 
      s.date,
      s.game_id,
      g.name as game_name,
      s.total_plays,
      s.total_wins,
      s.total_revenue,
      s.unique_users,
      ROUND((s.total_wins * 100.0 / s.total_plays), 2) as win_rate
    FROM statistics s
    LEFT JOIN games g ON s.game_id = g.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (date) {
    query += ' AND s.date = ?';
    params.push(date);
  }
  
  if (game_id) {
    query += ' AND s.game_id = ?';
    params.push(game_id);
  }
  
  query += ' ORDER BY s.date DESC, s.game_id';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      res.json({ success: true, data: rows });
    }
  });
});

// 5. 시스템 설정 API

// 시스템 설정 조회
app.get('/api/settings', (req, res) => {
  const query = 'SELECT * FROM system_settings ORDER BY key';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
    } else {
      const settings = {};
      rows.forEach(row => {
        settings[row.key] = row.value;
      });
      res.json({ success: true, data: settings });
    }
  });
});

// 시스템 설정 업데이트
app.put('/api/settings', (req, res) => {
  const settings = req.body;
  
  const updateQuery = `
    INSERT OR REPLACE INTO system_settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `;
  
  const promises = Object.entries(settings).map(([key, value]) => {
    return new Promise((resolve, reject) => {
      db.run(updateQuery, [key, value], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
  
  Promise.all(promises)
    .then(() => {
      res.json({ success: true, message: '설정이 업데이트되었습니다.' });
    })
    .catch(err => {
      res.status(500).json({ success: false, error: err.message });
    });
});

// 6. 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API 서버가 정상 작동 중입니다.',
    timestamp: new Date().toISOString()
  });
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error('서버 에러:', err);
  res.status(500).json({ 
    success: false, 
    error: '서버 내부 오류가 발생했습니다.' 
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: '요청한 리소스를 찾을 수 없습니다.' 
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 게임 이벤트 플랫폼 API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📊 API 문서: http://localhost:${PORT}/api/health`);
  console.log(`🎮 프론트엔드: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 서버를 종료합니다...');
  db.close((err) => {
    if (err) {
      console.error('데이터베이스 연결 종료 실패:', err.message);
    } else {
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
    process.exit(0);
  });
});

module.exports = app;
