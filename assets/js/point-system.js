// 포인트 시스템 클래스
class PointSystem {
  constructor() {
    this.points = 0;
    this.history = [];
    this.init();
  }

  // 초기화
  init() {
    this.loadPoints();
    this.createUI();
    this.bindEvents();
  }

  // 포인트 로드
  loadPoints() {
    const savedPoints = localStorage.getItem('userPoints');
    const savedHistory = localStorage.getItem('pointHistory');
    
    this.points = savedPoints ? parseInt(savedPoints) : 0;
    this.history = savedHistory ? JSON.parse(savedHistory) : [];
    
    console.log('포인트 로드됨:', this.points);
  }

  // 포인트 저장
  savePoints() {
    localStorage.setItem('userPoints', this.points.toString());
    localStorage.setItem('pointHistory', JSON.stringify(this.history));
  }

  // UI 생성
  createUI() {
    // 포인트 시스템 컨테이너
    const pointContainer = document.createElement('div');
    pointContainer.className = 'point-system';
    pointContainer.id = 'pointSystem';
    
    pointContainer.innerHTML = `
      <div class="point-header">
        <div class="point-title">
          <span class="point-icon">💰</span>
          내 포인트
        </div>
      </div>
      <div class="point-amount" id="pointAmount">${this.points.toLocaleString()}P</div>
      <div class="point-actions">
        <button class="point-btn" id="historyBtn">히스토리</button>
        <button class="point-btn" id="resetBtn">초기화</button>
      </div>
    `;
    
    document.body.appendChild(pointContainer);
    
    // 히스토리 모달
    const historyModal = document.createElement('div');
    historyModal.className = 'point-history-modal';
    historyModal.id = 'historyModal';
    
    historyModal.innerHTML = `
      <div class="point-history-content">
        <div class="point-history-header">
          <h2 class="point-history-title">포인트 히스토리</h2>
          <button class="close-history-btn" id="closeHistoryBtn">×</button>
        </div>
        <div class="point-history-list" id="historyList">
          ${this.renderHistory()}
        </div>
      </div>
    `;
    
    document.body.appendChild(historyModal);
  }

  // 이벤트 바인딩
  bindEvents() {
    // 히스토리 버튼
    document.getElementById('historyBtn').addEventListener('click', () => {
      this.showHistory();
    });
    
    // 히스토리 닫기 버튼
    document.getElementById('closeHistoryBtn').addEventListener('click', () => {
      this.hideHistory();
    });
    
    // 모달 외부 클릭 시 닫기
    document.getElementById('historyModal').addEventListener('click', (e) => {
      if (e.target.id === 'historyModal') {
        this.hideHistory();
      }
    });
    
    // 초기화 버튼
    document.getElementById('resetBtn').addEventListener('click', () => {
      if (confirm('정말로 포인트를 초기화하시겠습니까?')) {
        this.resetPoints();
      }
    });
  }

  // 포인트 추가
  addPoints(amount, description = '포인트 획득') {
    this.points += amount;
    this.history.unshift({
      amount: amount,
      description: description,
      date: new Date().toISOString(),
      type: 'earned'
    });
    
    this.savePoints();
    this.updateUI();
    this.showPointAnimation(amount);
    
    console.log(`포인트 추가: +${amount}P (${description})`);
  }

  // 포인트 차감
  spendPoints(amount, description = '포인트 사용') {
    if (this.points < amount) {
      alert('포인트가 부족합니다!');
      return false;
    }
    
    this.points -= amount;
    this.history.unshift({
      amount: -amount,
      description: description,
      date: new Date().toISOString(),
      type: 'spent'
    });
    
    this.savePoints();
    this.updateUI();
    
    console.log(`포인트 차감: -${amount}P (${description})`);
    return true;
  }

  // UI 업데이트
  updateUI() {
    const pointAmount = document.getElementById('pointAmount');
    if (pointAmount) {
      pointAmount.textContent = `${this.points.toLocaleString()}P`;
    }
  }

  // 히스토리 렌더링
  renderHistory() {
    if (this.history.length === 0) {
      return '<div style="text-align: center; padding: 20px; color: #666;">포인트 히스토리가 없습니다.</div>';
    }
    
    return this.history.map(item => `
      <div class="point-history-item ${item.type}">
        <div class="point-history-info">
          <div class="point-history-description">${item.description}</div>
          <div class="point-history-date">${new Date(item.date).toLocaleString('ko-KR')}</div>
        </div>
        <div class="point-history-amount ${item.amount > 0 ? 'positive' : 'negative'}">
          ${item.amount > 0 ? '+' : ''}${item.amount.toLocaleString()}P
        </div>
      </div>
    `).join('');
  }

  // 히스토리 표시
  showHistory() {
    const modal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    
    historyList.innerHTML = this.renderHistory();
    modal.classList.add('show');
  }

  // 히스토리 숨기기
  hideHistory() {
    const modal = document.getElementById('historyModal');
    modal.classList.remove('show');
  }

  // 포인트 초기화
  resetPoints() {
    this.points = 0;
    this.history = [];
    this.savePoints();
    this.updateUI();
    
    const historyList = document.getElementById('historyList');
    if (historyList) {
      historyList.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">포인트 히스토리가 없습니다.</div>';
    }
    
    console.log('포인트 초기화됨');
  }

  // 포인트 애니메이션
  showPointAnimation(amount) {
    const animation = document.createElement('div');
    animation.className = 'point-animation';
    animation.textContent = `+${amount}P`;
    animation.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #28a745;
      font-size: 24px;
      font-weight: bold;
      pointer-events: none;
      z-index: 1500;
    `;
    
    document.body.appendChild(animation);
    
    setTimeout(() => {
      document.body.removeChild(animation);
    }, 2000);
  }

  // 포인트 가져오기
  getPoints() {
    return this.points;
  }

  // 포인트 설정
  setPoints(amount) {
    this.points = amount;
    this.savePoints();
    this.updateUI();
  }
}

// 전역 포인트 시스템 인스턴스
window.pointSystem = new PointSystem();

// 포인트 시스템 헬퍼 함수들
window.addPoints = (amount, description) => {
  return window.pointSystem.addPoints(amount, description);
};

window.spendPoints = (amount, description) => {
  return window.pointSystem.spendPoints(amount, description);
};

window.getPoints = () => {
  return window.pointSystem.getPoints();
};

window.showPointHistory = () => {
  return window.pointSystem.showHistory();
};

console.log('포인트 시스템 로드됨');
