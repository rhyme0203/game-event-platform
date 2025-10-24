// 관리자 API 클래스
class AdminAPI {
  constructor() {
    this.baseUrl = window.location.origin;
  }

  // 게임 설정 가져오기
  async getGameSettings(gameId) {
    try {
      const settings = window.gameDB.getGameSettings(gameId);
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 게임 설정 저장
  async saveGameSettings(gameId, settings) {
    try {
      const result = window.gameDB.saveGameSettings(gameId, settings);
      return { success: result, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 통계 가져오기
  async getStatistics() {
    try {
      const stats = window.gameDB.getStatistics();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 사용자 목록 가져오기
  async getUsers() {
    try {
      const users = window.gameDB.getUsers();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 게임 플레이 기록 가져오기
  async getGamePlays(gameId = null, limit = 100) {
    try {
      const plays = window.gameDB.getGamePlays(gameId, limit);
      return { success: true, data: plays };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 시스템 설정 가져오기
  async getSystemSettings() {
    try {
      const settings = window.gameDB.getSystemSettings();
      return { success: true, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 시스템 설정 저장
  async saveSystemSettings(settings) {
    try {
      const result = window.gameDB.saveSystemSettings(settings);
      return { success: result, data: settings };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 게임 활성화/비활성화
  async toggleGame(gameId, enabled) {
    try {
      const currentSettings = window.gameDB.getGameSettings(gameId);
      if (currentSettings) {
        currentSettings.enabled = enabled;
        const result = window.gameDB.saveGameSettings(gameId, currentSettings);
        return { success: result, data: currentSettings };
      }
      return { success: false, error: '게임 설정을 찾을 수 없습니다.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 실시간 통계 업데이트
  async updateRealTimeStats() {
    try {
      const stats = window.gameDB.getStatistics();
      const plays = window.gameDB.getGamePlays(null, 50);
      
      // 오늘 플레이 수 계산
      const today = new Date().toDateString();
      const todayPlays = plays.filter(play => 
        new Date(play.timestamp).toDateString() === today
      ).length;

      // 통계 업데이트
      const updatedStats = {
        ...stats,
        todayPlays,
        lastUpdated: new Date().toISOString()
      };

      window.gameDB.updateStatistics(updatedStats);
      
      return { success: true, data: updatedStats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 전역 API 인스턴스
window.adminAPI = new AdminAPI();
