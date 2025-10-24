// SQL API 클라이언트 (로컬스토리지 기반)
class SQLAPI {
  constructor() {
    this.baseUrl = this.getBaseUrl();
    this.userId = this.getUserId();
  }
  
  // 환경에 따른 API URL 결정
  getBaseUrl() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    if (isLocalhost || isGitHubPages) {
      // 로컬스토리지 사용
      return null;
    } else {
      // 서버 환경에서는 SQL API 사용
      return 'http://localhost:3000/api';
    }
  }

  // 사용자 ID 가져오기 또는 생성
  getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Date.now();
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  // 사용자 정보 등록/업데이트
  async registerUser() {
    try {
      if (!this.baseUrl) {
        // 로컬스토리지 사용
        const userData = {
          user_id: this.userId,
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
          phone_number: null,
          email: null,
          created_at: new Date().toISOString()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('로컬 사용자 등록 성공:', userData);
        return { success: true, data: userData };
      } else {
        // SQL API 사용
        const userData = {
          ip_address: await this.getClientIP(),
          user_agent: navigator.userAgent,
          phone_number: null,
          email: null
        };

        const response = await fetch(`${this.baseUrl}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: this.userId,
            ...userData
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('사용자 등록 성공:', result);
          return result;
        } else {
          throw new Error(`사용자 등록 실패: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('사용자 등록 오류:', error);
      throw error;
    }
  }

  // 클라이언트 IP 가져오기
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('IP 주소 가져오기 실패:', error);
      return 'unknown';
    }
  }

  // 게임 설정 가져오기
  async getGameSettings(gameType) {
    try {
      if (!this.baseUrl) {
        // 로컬스토리지 사용
        const gameData = localStorage.getItem('gameDatabase');
        if (gameData) {
          const data = JSON.parse(gameData);
          const gameSettings = data.games[gameType];
          console.log(`${gameType} 게임 설정 로드됨:`, gameSettings);
          return gameSettings;
        } else {
          // 기본 데이터 반환
          const defaultData = this.getDefaultGameData(gameType);
          console.log(`${gameType} 기본 게임 설정 사용:`, defaultData);
          return defaultData;
        }
      } else {
        // SQL API 사용
        const response = await fetch(`${this.baseUrl}/games/${gameType}`);
        if (response.ok) {
          const result = await response.json();
          return result.data;
        } else {
          throw new Error(`게임 설정 로드 실패: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('게임 설정 로드 오류:', error);
      return this.getDefaultGameData(gameType);
    }
  }

  // 게임 설정 저장
  async saveGameSettings(gameType, settings) {
    try {
      if (!this.baseUrl) {
        // 로컬스토리지 사용
        const gameData = localStorage.getItem('gameDatabase');
        let data = gameData ? JSON.parse(gameData) : { games: {}, settings: {} };
        
        data.games[gameType] = {
          ...data.games[gameType],
          ...settings,
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('gameDatabase', JSON.stringify(data));
        console.log(`${gameType} 게임 설정 저장됨:`, settings);
        
        // 설정 변경 이벤트 발생
        window.dispatchEvent(new CustomEvent('adminSettingsChanged', {
          detail: {
            gameType: gameType,
            settings: settings
          }
        }));
        
        return { success: true };
      } else {
        // SQL API 사용
        const response = await fetch(`${this.baseUrl}/games/${gameType}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(settings)
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`${gameType} 게임 설정 저장됨:`, result);
          return result;
        } else {
          throw new Error(`게임 설정 저장 실패: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('게임 설정 저장 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 기본 게임 데이터
  getDefaultGameData(gameType) {
    const defaultData = {
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
        attempts: 3,
        prizes: [
          { id: 1, name: '1등: 아이폰 15', probability: 1, color: '#ff6b6b' },
          { id: 2, name: '2등: 에어팟', probability: 5, color: '#4ecdc4' },
          { id: 3, name: '3등: 1,000 포인트', probability: 20, color: '#45b7d1' },
          { id: 4, name: '꽝', probability: 74, color: '#95a5a6' }
        ],
        lastUpdated: new Date().toISOString()
      }
    };
    
    return defaultData[gameType] || null;
  }

  // 게임 플레이 기록
  async recordGamePlay(gameType, result) {
    try {
      if (!this.baseUrl) {
        // 로컬스토리지 사용
        const playData = {
          user_id: this.userId,
          game_type: gameType,
          result: result,
          timestamp: new Date().toISOString()
        };
        
        const existingPlays = JSON.parse(localStorage.getItem('gamePlays') || '[]');
        existingPlays.push(playData);
        localStorage.setItem('gamePlays', JSON.stringify(existingPlays));
        
        console.log('게임 플레이 기록됨:', playData);
        return { success: true };
      } else {
        // SQL API 사용
        const response = await fetch(`${this.baseUrl}/game-plays`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_id: this.userId,
            game_type: gameType,
            result: result
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('게임 플레이 기록됨:', result);
          return result;
        } else {
          throw new Error(`게임 플레이 기록 실패: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('게임 플레이 기록 오류:', error);
      return { success: false, error: error.message };
    }
  }

  // 통계 가져오기
  async getStatistics() {
    try {
      if (!this.baseUrl) {
        // 로컬스토리지 사용
        const gamePlays = JSON.parse(localStorage.getItem('gamePlays') || '[]');
        const statistics = {
          total_plays: gamePlays.length,
          games: {}
        };
        
        // 게임별 통계 계산
        gamePlays.forEach(play => {
          if (!statistics.games[play.game_type]) {
            statistics.games[play.game_type] = { plays: 0, wins: 0 };
          }
          statistics.games[play.game_type].plays++;
          if (play.result && play.result !== '꽝') {
            statistics.games[play.game_type].wins++;
          }
        });
        
        console.log('통계 로드됨:', statistics);
        return statistics;
      } else {
        // SQL API 사용
        const response = await fetch(`${this.baseUrl}/statistics`);
        if (response.ok) {
          const result = await response.json();
          return result.data;
        } else {
          throw new Error(`통계 로드 실패: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('통계 로드 오류:', error);
      return { total_plays: 0, games: {} };
    }
  }
}

// SQL API 인스턴스 생성
window.sqlAPI = new SQLAPI();