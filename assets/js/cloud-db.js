// 클라우드 기반 데이터베이스 (GitHub Pages 호환)
class CloudDatabase {
  constructor() {
    this.baseUrl = 'https://api.jsonbin.io/v3/b';
    this.binId = '64f8a8b7b89b1e2299c8f4a1'; // 실제 사용 시 새로운 bin 생성 필요
    this.apiKey = 'YOUR_API_KEY'; // 실제 사용 시 API 키 필요
    this.fallbackData = null;
    this.init();
  }

  // 초기화
  init() {
    this.loadFallbackData();
  }

  // 폴백 데이터 로드 (로컬스토리지 또는 기본값)
  loadFallbackData() {
    try {
      const localData = localStorage.getItem('gameDatabase');
      if (localData) {
        this.fallbackData = JSON.parse(localData);
        console.log('로컬 폴백 데이터 로드됨');
      } else {
        this.fallbackData = this.getDefaultData();
        console.log('기본 폴백 데이터 로드됨');
      }
    } catch (error) {
      console.error('폴백 데이터 로드 실패:', error);
      this.fallbackData = this.getDefaultData();
    }
  }

  // 기본 데이터
  getDefaultData() {
    return {
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
  }

  // 데이터베이스 가져오기 (클라우드 우선, 폴백 사용)
  async getDatabase() {
    try {
      // 클라우드에서 데이터 가져오기
      const response = await fetch(`${this.baseUrl}/${this.binId}/latest`, {
        headers: {
          'X-Master-Key': this.apiKey
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('클라우드 데이터 로드됨:', data.record);
        return data.record;
      } else {
        throw new Error('클라우드 데이터 로드 실패');
      }
    } catch (error) {
      console.warn('클라우드 데이터 로드 실패, 폴백 사용:', error);
      return this.fallbackData;
    }
  }

  // 데이터베이스 저장 (클라우드 + 로컬)
  async saveDatabase(data) {
    try {
      // 로컬스토리지에 저장 (즉시 사용 가능)
      localStorage.setItem('gameDatabase', JSON.stringify(data));
      console.log('로컬 데이터 저장됨');
      
      // 클라우드에 저장 (백그라운드)
      this.saveToCloud(data);
      
      return true;
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      return false;
    }
  }

  // 클라우드에 저장
  async saveToCloud(data) {
    try {
      const response = await fetch(`${this.baseUrl}/${this.binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.apiKey
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log('클라우드 데이터 저장됨');
      } else {
        console.warn('클라우드 데이터 저장 실패');
      }
    } catch (error) {
      console.warn('클라우드 저장 실패:', error);
    }
  }

  // 게임 설정 가져오기
  async getGameSettings(gameId) {
    const db = await this.getDatabase();
    return db.games[gameId] || null;
  }

  // 게임 설정 저장
  async saveGameSettings(gameId, settings) {
    const db = await this.getDatabase();
    db.games[gameId] = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    return await this.saveDatabase(db);
  }

  // 통계 가져오기
  async getStatistics() {
    const db = await this.getDatabase();
    return db.statistics;
  }

  // 통계 업데이트
  async updateStatistics(stats) {
    const db = await this.getDatabase();
    db.statistics = {
      ...db.statistics,
      ...stats,
      lastUpdated: new Date().toISOString()
    };
    return await this.saveDatabase(db);
  }

  // 게임 플레이 기록
  async recordGamePlay(gameId, userId, result) {
    const db = await this.getDatabase();
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
    
    return await this.saveDatabase(db);
  }
}

// 전역 클라우드 데이터베이스 인스턴스
window.cloudDB = new CloudDatabase();
