// Firebase Realtime Database 기반 데이터베이스
class FirebaseDB {
  constructor() {
    this.isInitialized = false;
    this.config = {
      apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      authDomain: "game-event-platform.firebaseapp.com",
      databaseURL: "https://lucky-784fd-default-rtdb.asia-southeast1.firebasedatabase.app/",
      projectId: "game-event-platform",
      storageBucket: "game-event-platform.appspot.com",
      messagingSenderId: "123456789012",
      appId: "1:123456789012:web:abcdef1234567890"
    };
    
    this.init();
  }
  
  // Firebase 초기화
  async init() {
    try {
      // Firebase SDK 로드 확인
      if (typeof firebase === 'undefined') {
        await this.loadFirebaseSDK();
      }
      
      // Firebase 초기화 (v8 방식)
      if (!firebase.apps.length) {
        firebase.initializeApp(this.config);
      }
      
      this.db = firebase.database();
      this.isInitialized = true;
      
      console.log('Firebase Realtime Database 초기화 완료');
    } catch (error) {
      console.error('Firebase 초기화 실패:', error);
      this.isInitialized = false;
    }
  }
  
  // Firebase SDK 동적 로드 (CDN 방식)
  async loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
      // Firebase v8 CDN 사용 (ES6 모듈 문제 해결)
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
      script.onload = () => {
        const script2 = document.createElement('script');
        script2.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js';
        script2.onload = resolve;
        script2.onerror = reject;
        document.head.appendChild(script2);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // 사용자 등록/업데이트
  async registerUser() {
    if (!this.isInitialized) {
      throw new Error('Firebase가 초기화되지 않았습니다');
    }
    
    try {
      const userId = this.getUserId();
      const userData = {
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        phone_number: null,
        email: null,
        created_at: firebase.database.ServerValue.TIMESTAMP,
        last_active: firebase.database.ServerValue.TIMESTAMP
      };
      
      await this.db.ref(`users/${userId}`).set(userData);
      console.log('Firebase 사용자 등록 완료:', userId);
      
      return { success: true, data: { id: userId, ...userData } };
    } catch (error) {
      console.error('Firebase 사용자 등록 실패:', error);
      throw error;
    }
  }
  
  // 게임 설정 가져오기
  async getGameSettings(gameType) {
    if (!this.isInitialized) {
      throw new Error('Firebase가 초기화되지 않았습니다');
    }
    
    try {
      const snapshot = await this.db.ref(`games/${gameType}`).once('value');
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log(`${gameType} 게임 설정 로드됨:`, data);
        return data;
      } else {
        // 기본 설정 반환
        const defaultSettings = this.getDefaultGameSettings(gameType);
        console.log(`${gameType} 기본 설정 사용:`, defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      console.error('게임 설정 로드 실패:', error);
      return this.getDefaultGameSettings(gameType);
    }
  }
  
  // 게임 설정 저장
  async saveGameSettings(gameType, settings) {
    if (!this.isInitialized) {
      throw new Error('Firebase가 초기화되지 않았습니다');
    }
    
    try {
      const gameData = {
        ...settings,
        lastUpdated: firebase.database.ServerValue.TIMESTAMP
      };
      
      await this.db.ref(`games/${gameType}`).set(gameData);
      console.log(`${gameType} 게임 설정 저장됨:`, gameData);
      
      // 설정 변경 이벤트 발생
      window.dispatchEvent(new CustomEvent('adminSettingsChanged', {
        detail: {
          gameType: gameType,
          settings: settings
        }
      }));
      
      return { success: true };
    } catch (error) {
      console.error('게임 설정 저장 실패:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 게임 플레이 기록
  async recordGamePlay(gameType, result) {
    if (!this.isInitialized) {
      throw new Error('Firebase가 초기화되지 않았습니다');
    }
    
    try {
      const userId = this.getUserId();
      const playData = {
        user_id: userId,
        game_type: gameType,
        result: result,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      };
      
      await this.db.ref('game_plays').push(playData);
      console.log('게임 플레이 기록됨:', playData);
      
      return { success: true };
    } catch (error) {
      console.error('게임 플레이 기록 실패:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 통계 가져오기
  async getStatistics() {
    if (!this.isInitialized) {
      throw new Error('Firebase가 초기화되지 않았습니다');
    }
    
    try {
      const snapshot = await this.db.ref('game_plays').once('value');
      const statistics = {
        total_plays: 0,
        games: {}
      };
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const plays = Object.values(data);
        statistics.total_plays = plays.length;
        
        // 게임별 통계 계산
        plays.forEach(play => {
          const gameType = play.game_type;
          
          if (!statistics.games[gameType]) {
            statistics.games[gameType] = { plays: 0, wins: 0 };
          }
          
          statistics.games[gameType].plays++;
          if (play.result && play.result.won) {
            statistics.games[gameType].wins++;
          }
        });
      }
      
      console.log('통계 로드됨:', statistics);
      return statistics;
    } catch (error) {
      console.error('통계 로드 실패:', error);
      return { total_plays: 0, games: {} };
    }
  }
  
  // 실시간 설정 감지
  startSettingsWatcher(gameType, callback) {
    if (!this.isInitialized) {
      console.warn('Firebase가 초기화되지 않았습니다');
      return;
    }
    
    this.db.ref(`games/${gameType}`).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('실시간 설정 변경 감지:', data);
        if (callback) {
          callback(data);
        }
      }
    });
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
  
  // 기본 게임 설정
  getDefaultGameSettings(gameType) {
    const defaultSettings = {
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
        ]
      },
      slot: {
        id: 'slot',
        name: '슬롯머신',
        enabled: true,
        attempts: 3,
        symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐'],
        spinDuration: 3,
        combinations: [
          { symbols: ['🍒', '🍒', '🍒'], reward: 1000, probability: 5 },
          { symbols: ['🍋', '🍋', '🍋'], reward: 500, probability: 10 },
          { symbols: ['🍊', '🍊', '🍊'], reward: 300, probability: 15 },
          { symbols: ['🔔', '🔔', '🔔'], reward: 100, probability: 20 },
          { symbols: ['⭐', '⭐', '⭐'], reward: 50, probability: 25 },
          { symbols: ['꽝'], reward: 0, probability: 25 }
        ]
      }
    };
    
    return defaultSettings[gameType] || null;
  }
}

// Firebase DB 인스턴스 생성
window.firebaseDB = new FirebaseDB();
