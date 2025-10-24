// GitHub Pages 호환 데이터베이스 (GitHub API 사용)
class GitHubDatabase {
  constructor() {
    this.repo = 'rhyme0203/game-event-platform';
    this.filePath = 'data/game-database.json';
    this.fallbackData = null;
    this.init();
  }

  // 초기화
  init() {
    this.loadFallbackData();
    // 데이터 로드 완료를 기다림
    this.waitForData();
  }
  
  // 데이터 로드 완료 대기
  async waitForData() {
    while (!this.fallbackData) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log('GitHub DB 데이터 로드 완료');
  }

  // 폴백 데이터 로드
  loadFallbackData() {
    try {
      // 실제 데이터 파일 로드 시도
      this.loadGameData();
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      this.fallbackData = this.getDefaultData();
    }
  }
  
  // 게임 데이터 로드
  async loadGameData() {
    try {
      // 루트 경로에서 데이터 파일 로드
      const response = await fetch('../data/game-database.json');
      if (response.ok) {
        const data = await response.json();
        this.fallbackData = data;
        console.log('게임 데이터 파일 로드됨:', data);
      } else {
        throw new Error('데이터 파일을 찾을 수 없습니다');
      }
    } catch (error) {
      console.warn('데이터 파일 로드 실패, 로컬 데이터 사용:', error);
      
      // 로컬 데이터 확인
      const localData = localStorage.getItem('gameDatabase');
      if (localData) {
        this.fallbackData = JSON.parse(localData);
        console.log('로컬 폴백 데이터 로드됨');
      } else {
        this.fallbackData = this.getDefaultData();
        console.log('기본 폴백 데이터 로드됨');
      }
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
        }
      },
      statistics: {
        totalUsers: 1234,
        todayPlays: 567,
        totalPrizes: 89,
        revenue: 2340000,
        lastUpdated: new Date().toISOString()
      }
    };
  }

  // GitHub에서 데이터 가져오기
  async getDatabase() {
    try {
      // GitHub API로 파일 내용 가져오기
      const response = await fetch(`https://api.github.com/repos/${this.repo}/contents/${this.filePath}`);
      
      if (response.ok) {
        const data = await response.json();
        const content = atob(data.content); // Base64 디코딩
        const parsed = JSON.parse(content);
        console.log('GitHub 데이터 로드됨:', parsed);
        return parsed;
      } else {
        throw new Error('GitHub 데이터 로드 실패');
      }
    } catch (error) {
      console.warn('GitHub 데이터 로드 실패, 폴백 사용:', error);
      return this.fallbackData;
    }
  }

  // GitHub에 데이터 저장 (실제로는 불가능하지만 시뮬레이션)
  async saveDatabase(data) {
    try {
      // 로컬스토리지에 저장
      localStorage.setItem('gameDatabase', JSON.stringify(data));
      console.log('로컬 데이터 저장됨');
      
      // GitHub 저장 시뮬레이션 (실제로는 불가능)
      console.log('GitHub 저장 시뮬레이션:', data);
      
      return true;
    } catch (error) {
      console.error('데이터 저장 실패:', error);
      return false;
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
}

// 전역 GitHub 데이터베이스 인스턴스
window.githubDB = new GitHubDatabase();
