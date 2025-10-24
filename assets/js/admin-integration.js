// 게임에서 관리자 설정을 읽어오는 통합 스크립트
class AdminIntegration {
  constructor() {
    this.adminData = null;
    this.init();
  }

  // 초기화
  init() {
    this.loadAdminData();
  }

  // 관리자 데이터 로드
  loadAdminData() {
    try {
      const adminData = localStorage.getItem('gameDatabase');
      if (adminData) {
        this.adminData = JSON.parse(adminData);
        console.log('관리자 설정 로드됨:', this.adminData);
      } else {
        console.log('관리자 설정이 없습니다. 기본 설정을 사용합니다.');
      }
    } catch (error) {
      console.error('관리자 설정 로드 실패:', error);
    }
  }

  // 게임 설정 가져오기
  getGameSettings(gameId) {
    if (!this.adminData || !this.adminData.games) {
      return this.getDefaultSettings(gameId);
    }

    const gameSettings = this.adminData.games[gameId];
    if (!gameSettings || !gameSettings.enabled) {
      return this.getDefaultSettings(gameId);
    }

    return gameSettings;
  }

  // 기본 설정 가져오기
  getDefaultSettings(gameId) {
    const defaults = {
      roulette: {
        attempts: 3,
        spinDuration: 4,
        prizes: [
          { name: '1등: 스타벅스 기프티콘', probability: 5, color: '#ff6b6b' },
          { name: '2등: 5,000 포인트', probability: 10, color: '#4ecdc4' },
          { name: '3등: 3,000 포인트', probability: 15, color: '#45b7d1' },
          { name: '꽝: 다음 기회에', probability: 70, color: '#95a5a6' }
        ]
      },
      slot: {
        symbols: ['🍒', '🍋', '🍊', '⭐', '🍇', '🍉', '💎', '🎰'],
        spinDuration: 3,
        combinations: [
          { pattern: '💎💎💎', reward: 'JACKPOT! 10,000 포인트', probability: 1 },
          { pattern: '🍒🍒🍒', reward: '5,000 포인트', probability: 5 },
          { pattern: '⭐⭐⭐', reward: '3,000 포인트', probability: 10 }
        ]
      },
      capsule: {
        capsuleCount: 6,
        animationDuration: 2,
        prizes: [
          { name: '1등: 10,000원 상품권', emoji: '💎', probability: 5 },
          { name: '2등: 5,000원 상품권', emoji: '🎁', probability: 10 },
          { name: '3등: 3,000원 상품권', emoji: '🎉', probability: 15 },
          { name: '꽝: 다음 기회에', emoji: '😢', probability: 70 }
        ]
      },
      scratch: {
        revealPercent: 70,
        adTrigger: 30,
        prizes: [
          { name: '대박! 50,000원 상품권', emoji: '💎', probability: 1 },
          { name: '축하! 10,000원 상품권', emoji: '🎁', probability: 5 },
          { name: '3,000원 상품권', emoji: '🎉', probability: 10 },
          { name: '꽝: 다음 기회에', emoji: '😢', probability: 84 }
        ]
      }
    };

    return defaults[gameId] || {};
  }

  // 룰렛 설정 적용
  applyRouletteSettings() {
    const settings = this.getGameSettings('roulette');
    
    // 시도 횟수 설정
    if (settings.attempts) {
      window.maxAttempts = settings.attempts;
    }

    // 회전 시간 설정
    if (settings.spinDuration) {
      window.spinDuration = settings.spinDuration * 1000; // 밀리초로 변환
    }

    // 경품 데이터 설정
    if (settings.prizes && settings.prizes.length > 0) {
      window.prizeData = settings.prizes.map((prize, index) => ({
        id: index + 1,
        name: prize.name,
        probability: prize.probability,
        color: prize.color || '#95a5a6'
      }));
    }

    console.log('룰렛 설정 적용됨:', settings);
  }

  // 슬롯머신 설정 적용
  applySlotSettings() {
    const settings = this.getGameSettings('slot');
    
    // 심볼 설정
    if (settings.symbols && settings.symbols.length > 0) {
      window.slotSymbols = settings.symbols;
    }

    // 회전 시간 설정
    if (settings.spinDuration) {
      window.slotSpinDuration = settings.spinDuration * 1000;
    }

    // 당첨 조합 설정
    if (settings.combinations && settings.combinations.length > 0) {
      window.slotCombinations = settings.combinations;
    }

    console.log('슬롯머신 설정 적용됨:', settings);
  }

  // 캡슐뽑기 설정 적용
  applyCapsuleSettings() {
    const settings = this.getGameSettings('capsule');
    
    // 캡슐 개수 설정
    if (settings.capsuleCount) {
      window.capsuleCount = settings.capsuleCount;
    }

    // 애니메이션 시간 설정
    if (settings.animationDuration) {
      window.capsuleAnimationDuration = settings.animationDuration * 1000;
    }

    // 경품 데이터 설정
    if (settings.prizes && settings.prizes.length > 0) {
      window.capsulePrizes = settings.prizes;
    }

    console.log('캡슐뽑기 설정 적용됨:', settings);
  }

  // 스크래치 설정 적용
  applyScratchSettings() {
    const settings = this.getGameSettings('scratch');
    
    // 자동 완료 퍼센트 설정
    if (settings.revealPercent) {
      window.scratchRevealPercent = settings.revealPercent;
    }

    // 광고 트리거 퍼센트 설정
    if (settings.adTrigger) {
      window.scratchAdTrigger = settings.adTrigger;
    }

    // 경품 데이터 설정
    if (settings.prizes && settings.prizes.length > 0) {
      window.scratchPrizes = settings.prizes;
    }

    console.log('스크래치 설정 적용됨:', settings);
  }

  // 게임 플레이 기록
  recordGamePlay(gameId, result) {
    try {
      if (!this.adminData) {
        this.loadAdminData();
      }

      if (!this.adminData.gamePlays) {
        this.adminData.gamePlays = [];
      }

      const playRecord = {
        id: Date.now(),
        gameId,
        userId: this.getUserId(),
        result,
        timestamp: new Date().toISOString()
      };

      this.adminData.gamePlays.push(playRecord);

      // 통계 업데이트
      if (this.adminData.statistics) {
        this.adminData.statistics.todayPlays += 1;
        if (result.won) {
          this.adminData.statistics.totalPrizes += 1;
        }
      }

      // 로컬스토리지에 저장
      localStorage.setItem('gameDatabase', JSON.stringify(this.adminData));
      
      console.log('게임 플레이 기록됨:', playRecord);
    } catch (error) {
      console.error('게임 플레이 기록 실패:', error);
    }
  }

  // 사용자 ID 가져오기
  getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Date.now();
      localStorage.setItem('userId', userId);
    }
    return userId;
  }

  // 설정 변경 감지 (폴링)
  startSettingsWatcher() {
    setInterval(() => {
      this.loadAdminData();
    }, 5000); // 5초마다 체크
  }
}

// 전역 인스턴스 생성
window.adminIntegration = new AdminIntegration();
