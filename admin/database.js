// 게임 설정 데이터베이스 (로컬스토리지 기반)
class GameDatabase {
  constructor() {
    this.initDatabase();
  }

  // 데이터베이스 초기화
  initDatabase() {
    if (!localStorage.getItem('gameDatabase')) {
      const initialData = {
        games: {
          roulette: {
            id: 'roulette',
            name: '룰렛',
            enabled: true,
            attempts: 3,
            spinDuration: 4,
            prizes: [
              { id: 1, name: '1등: 스타벅스 기프티콘', probability: 5, color: '#ff6b6b' },
              { id: 2, name: '2등: 5,000 포인트', probability: 10, color: '#4ecdc4' },
              { id: 3, name: '3등: 3,000 포인트', probability: 15, color: '#45b7d1' },
              { id: 4, name: '꽝: 다음 기회에', probability: 70, color: '#95a5a6' }
            ],
            lastUpdated: new Date().toISOString()
          },
          slot: {
            id: 'slot',
            name: '슬롯머신',
            enabled: true,
            symbols: ['🍒', '🍋', '🍊', '⭐', '🍇', '🍉', '💎', '🎰'],
            spinDuration: 3,
            combinations: [
              { id: 1, pattern: '💎💎💎', reward: 'JACKPOT! 10,000 포인트', probability: 1 },
              { id: 2, pattern: '🍒🍒🍒', reward: '5,000 포인트', probability: 5 },
              { id: 3, pattern: '⭐⭐⭐', reward: '3,000 포인트', probability: 10 }
            ],
            lastUpdated: new Date().toISOString()
          },
          capsule: {
            id: 'capsule',
            name: '캡슐뽑기',
            enabled: true,
            capsuleCount: 6,
            animationDuration: 2,
            prizes: [
              { id: 1, name: '1등: 10,000원 상품권', emoji: '💎', probability: 5 },
              { id: 2, name: '2등: 5,000원 상품권', emoji: '🎁', probability: 10 },
              { id: 3, name: '3등: 3,000원 상품권', emoji: '🎉', probability: 15 },
              { id: 4, name: '꽝: 다음 기회에', emoji: '😢', probability: 70 }
            ],
            lastUpdated: new Date().toISOString()
          },
          scratch: {
            id: 'scratch',
            name: '스크래치',
            enabled: true,
            revealPercent: 70,
            adTrigger: 30,
            prizes: [
              { id: 1, name: '대박! 50,000원 상품권', emoji: '💎', probability: 1 },
              { id: 2, name: '축하! 10,000원 상품권', emoji: '🎁', probability: 5 },
              { id: 3, name: '3,000원 상품권', emoji: '🎉', probability: 10 },
              { id: 4, name: '꽝: 다음 기회에', emoji: '😢', probability: 84 }
            ],
            lastUpdated: new Date().toISOString()
          }
        },
        users: [],
        statistics: {
          totalUsers: 1234,
          todayPlays: 567,
          totalPrizes: 89,
          revenue: 2340000,
          lastUpdated: new Date().toISOString()
        },
        settings: {
          siteName: '럭키빤쓰',
          maintenance: false,
          adEnabled: true,
          lastUpdated: new Date().toISOString()
        }
      };
      localStorage.setItem('gameDatabase', JSON.stringify(initialData));
    }
  }

  // 데이터베이스 가져오기
  getDatabase() {
    return JSON.parse(localStorage.getItem('gameDatabase'));
  }

  // 데이터베이스 저장
  saveDatabase(data) {
    localStorage.setItem('gameDatabase', JSON.stringify(data));
  }

  // 게임 설정 가져오기
  getGameSettings(gameId) {
    const db = this.getDatabase();
    return db.games[gameId] || null;
  }

  // 게임 설정 저장
  saveGameSettings(gameId, settings) {
    const db = this.getDatabase();
    db.games[gameId] = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    this.saveDatabase(db);
    return true;
  }

  // 통계 가져오기
  getStatistics() {
    const db = this.getDatabase();
    return db.statistics;
  }

  // 통계 업데이트
  updateStatistics(stats) {
    const db = this.getDatabase();
    db.statistics = {
      ...db.statistics,
      ...stats,
      lastUpdated: new Date().toISOString()
    };
    this.saveDatabase(db);
    return true;
  }

  // 사용자 추가
  addUser(userData) {
    const db = this.getDatabase();
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    this.saveDatabase(db);
    return newUser;
  }

  // 사용자 목록 가져오기
  getUsers() {
    const db = this.getDatabase();
    return db.users;
  }

  // 게임 플레이 기록
  recordGamePlay(gameId, userId, result) {
    const db = this.getDatabase();
    if (!db.gamePlays) {
      db.gamePlays = [];
    }
    
    const playRecord = {
      id: Date.now(),
      gameId,
      userId,
      result,
      timestamp: new Date().toISOString()
    };
    
    db.gamePlays.push(playRecord);
    
    // 통계 업데이트
    db.statistics.todayPlays += 1;
    if (result.won) {
      db.statistics.totalPrizes += 1;
    }
    
    this.saveDatabase(db);
    return playRecord;
  }

  // 게임 플레이 기록 가져오기
  getGamePlays(gameId = null, limit = 100) {
    const db = this.getDatabase();
    let plays = db.gamePlays || [];
    
    if (gameId) {
      plays = plays.filter(play => play.gameId === gameId);
    }
    
    return plays.slice(-limit).reverse();
  }

  // 시스템 설정 가져오기
  getSystemSettings() {
    const db = this.getDatabase();
    return db.settings;
  }

  // 시스템 설정 저장
  saveSystemSettings(settings) {
    const db = this.getDatabase();
    db.settings = {
      ...db.settings,
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    this.saveDatabase(db);
    return true;
  }
}

// 전역 데이터베이스 인스턴스
window.gameDB = new GameDatabase();
