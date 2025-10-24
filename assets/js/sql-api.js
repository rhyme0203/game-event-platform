// SQL API 클라이언트
class SQLAPI {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api';
    this.userId = this.getUserId();
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
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      if (result.success) {
        this.userId = result.data.id;
        localStorage.setItem('userId', this.userId);
      }
      return result;
    } catch (error) {
      console.error('사용자 등록 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 클라이언트 IP 주소 가져오기 (간단한 방법)
  async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('IP 주소 가져오기 실패, 기본값 사용');
      return '127.0.0.1';
    }
  }

  // 게임 설정 가져오기
  async getGameSettings(gameId) {
    try {
      const response = await fetch(`${this.baseUrl}/games/${gameId}`);
      const result = await response.json();
      
      if (result.success) {
        return {
          success: true,
          data: {
            id: result.data.id,
            name: result.data.name,
            enabled: result.data.enabled,
            attempts: result.data.attempts,
            spinDuration: result.data.spin_duration,
            prizes: result.data.prizes || []
          }
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('게임 설정 가져오기 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 게임 플레이 기록
  async recordGamePlay(gameId, result) {
    try {
      const playData = {
        game_id: gameId,
        user_id: this.userId,
        won: result.won || false,
        prize_name: result.prize || null,
        prize_value: result.value || 0,
        play_data: {
          gameType: gameId,
          result: result,
          timestamp: new Date().toISOString()
        },
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      const response = await fetch(`${this.baseUrl}/game-plays`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(playData)
      });

      const apiResult = await response.json();
      console.log('게임 플레이 기록됨:', apiResult);
      return apiResult;
    } catch (error) {
      console.error('게임 플레이 기록 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 통계 가져오기
  async getStatistics(gameId = null, date = null) {
    try {
      let url = `${this.baseUrl}/statistics`;
      const params = new URLSearchParams();
      
      if (gameId) params.append('game_id', gameId);
      if (date) params.append('date', date);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await fetch(url);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('통계 가져오기 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 시스템 설정 가져오기
  async getSystemSettings() {
    try {
      const response = await fetch(`${this.baseUrl}/settings`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('시스템 설정 가져오기 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 게임 설정 저장
  async saveGameSettings(gameId, settings) {
    try {
      const response = await fetch(`${this.baseUrl}/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const result = await response.json();
      console.log('게임 설정 저장됨:', result);
      return result;
    } catch (error) {
      console.error('게임 설정 저장 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 헬스 체크
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('헬스 체크 실패:', error);
      return { success: false, error: error.message };
    }
  }
}

// 전역 인스턴스 생성
window.sqlAPI = new SQLAPI();

// SQL API 통합 클래스 (기존 AdminIntegration과 호환)
class SQLAdminIntegration {
  constructor() {
    this.sqlAPI = window.sqlAPI;
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30초
  }

  // 게임 설정 가져오기 (캐시 포함)
  async getGameSettings(gameId, forceRefresh = false) {
    const cacheKey = `game_${gameId}`;
    const cached = this.cache.get(cacheKey);
    
    if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const result = await this.sqlAPI.getGameSettings(gameId);
      if (result.success) {
        this.cache.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        });
      }
      return result;
    } catch (error) {
      console.error('게임 설정 가져오기 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 룰렛 설정 적용
  async applyRouletteSettings() {
    try {
      const result = await this.getGameSettings('roulette');
      
      if (result.success && result.data) {
        const settings = result.data;
        
        // 시도 횟수 설정
        if (settings.attempts) {
          window.maxAttempts = settings.attempts;
          console.log('SQL 시도 횟수 설정됨:', window.maxAttempts);
        }

        // 회전 시간 설정
        if (settings.spinDuration) {
          window.spinDuration = settings.spinDuration * 1000;
          console.log('SQL 회전 시간 설정됨:', window.spinDuration);
        }

        // 경품 데이터 설정
        if (settings.prizes && settings.prizes.length > 0) {
          window.prizeData = settings.prizes.map((prize, index) => ({
            id: prize.id || index + 1,
            name: prize.name,
            probability: prize.probability,
            color: prize.color || '#95a5a6'
          }));
          console.log('SQL 경품 데이터 설정됨:', window.prizeData);
        }

        console.log('SQL 룰렛 설정 적용 완료:', settings);
        
        // 설정 변경 이벤트 발생
        window.dispatchEvent(new CustomEvent('adminSettingsChanged', {
          detail: { gameType: 'roulette', settings: settings }
        }));
      }
    } catch (error) {
      console.error('룰렛 설정 적용 실패:', error);
    }
  }

  // 게임 플레이 기록
  async recordGamePlay(gameId, result) {
    try {
      const recordResult = await this.sqlAPI.recordGamePlay(gameId, result);
      console.log('SQL 게임 플레이 기록됨:', recordResult);
      return recordResult;
    } catch (error) {
      console.error('SQL 게임 플레이 기록 실패:', error);
      return { success: false, error: error.message };
    }
  }

  // 캐시 클리어
  clearCache() {
    this.cache.clear();
  }

  // 캐시된 설정 새로고침
  async refreshSettings(gameId) {
    this.cache.delete(`game_${gameId}`);
    return await this.getGameSettings(gameId, true);
  }

  // 실시간 설정 감지 시작
  startSettingsWatcher(intervalMs = 5000) {
    console.log('실시간 설정 감지 시작 (5초 간격)');
    
    setInterval(async () => {
      try {
        // 룰렛 설정 새로고침
        const result = await this.getGameSettings('roulette', true);
        if (result.success && result.data) {
          // 설정이 변경되었는지 확인
          const currentSettings = result.data;
          const lastSettings = this.cache.get('last_roulette_settings');
          
          if (!lastSettings || JSON.stringify(currentSettings) !== JSON.stringify(lastSettings)) {
            console.log('룰렛 설정 변경 감지됨:', currentSettings);
            
            // 설정 적용
            await this.applyRouletteSettings();
            
            // 마지막 설정 저장
            this.cache.set('last_roulette_settings', currentSettings);
          }
        }
      } catch (error) {
        console.error('설정 감지 중 오류:', error);
      }
    }, intervalMs);
  }
}

// 전역 SQL 통합 인스턴스 생성
window.sqlAdminIntegration = new SQLAdminIntegration();

// 기존 adminIntegration을 SQL 버전으로 교체
window.adminIntegration = window.sqlAdminIntegration;

console.log('SQL API 클라이언트가 로드되었습니다.');
