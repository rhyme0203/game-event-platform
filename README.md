# 🎮 게임형 이벤트 플랫폼 프로토타입

카나페(Canape)와 같은 게임형 이벤트 플랫폼의 프로토타입입니다. 다양한 게임 타입으로 고객 참여를 높이는 이벤트를 만들 수 있습니다.

## ✨ 구현된 게임

### 🎡 룰렛
- 화려한 회전 애니메이션
- 확률 기반 당첨 시스템
- 참여 횟수 제한 (하루 3회)
- 커스터마이징 가능한 경품 설정

### 🎰 슬롯머신
- 3개의 릴 애니메이션
- 조합별 차등 보상
- 레버 당기기 인터랙션
- JACKPOT 시스템

### 🔮 캡슐뽑기
- 6개의 컬러풀한 캡슐
- 선택형 게임 방식
- 부드러운 float 애니메이션
- 선택 후 전체 결과 공개

### 🎫 스크래치 카드
- Canvas 기반 스크래치 구현
- 실시간 진행도 표시
- 터치/마우스 모두 지원
- 자동 완료 기능 (70% 이상)

## 🚀 실행 방법

### 방법 1: 로컬 서버 (Python)
```bash
# Python 3가 설치되어 있다면
python3 -m http.server 8000

# 브라우저에서 접속
# http://localhost:8000
```

### 방법 2: 로컬 서버 (Node.js)
```bash
# http-server 설치
npm install -g http-server

# 서버 실행
http-server -p 8000

# 브라우저에서 접속
# http://localhost:8000
```

### 방법 3: VS Code Live Server
1. VS Code 확장 프로그램 "Live Server" 설치
2. `index.html` 파일 우클릭
3. "Open with Live Server" 선택

## 📁 프로젝트 구조

```
game-event-platform/
├── index.html              # 메인 랜딩 페이지
├── games/                  # 게임 페이지들
│   ├── roulette.html      # 룰렛 게임
│   ├── slot.html          # 슬롯머신 게임
│   ├── capsule.html       # 캡슐뽑기 게임
│   └── scratch.html       # 스크래치 게임
├── assets/
│   ├── css/
│   │   └── common.css     # 공통 스타일
│   ├── js/                # JavaScript 파일
│   └── images/            # 이미지 리소스
└── README.md
```

## 🎨 주요 기능

### 현재 구현
- ✅ 4가지 게임 타입 (룰렛, 슬롯, 캡슐, 스크래치)
- ✅ 반응형 디자인 (모바일 최적화)
- ✅ 부드러운 애니메이션 효과
- ✅ 결과 모달 팝업
- ✅ 진행 상황 표시
- ✅ 터치/마우스 모두 지원

### 향후 추가 예정
- [ ] 백엔드 API 연동
- [ ] 사용자 인증 시스템
- [ ] 관리자 대시보드
- [ ] 이벤트 생성/수정 기능
- [ ] 참여자 데이터 수집
- [ ] 통계 및 분석 기능
- [ ] 테마 커스터마이징
- [ ] 중복 참여 방지 (IP, 쿠키, 전화번호)
- [ ] 리워드 재고 관리
- [ ] 임베딩 코드 생성기

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Canvas API**: 스크래치 카드 구현
- **CSS Animations**: 부드러운 UI 애니메이션
- **Responsive Design**: Mobile-first 접근

## 🎯 다음 단계

### Phase 1: 백엔드 개발
- Node.js + Express 또는 NestJS
- PostgreSQL 데이터베이스
- RESTful API 설계

### Phase 2: 관리자 대시보드
- React + TypeScript
- 이벤트 생성/관리 UI
- 실시간 통계 대시보드

### Phase 3: 고급 기능
- 이메일/SMS 알림
- 소셜 로그인
- 쿠폰 자동 발송
- A/B 테스트 기능

## 📝 커스터마이징 가이드

### 경품 변경하기
각 게임 HTML 파일의 `prizes` 배열을 수정하세요:

```javascript
// roulette.html
const prizes = [
  { name: '원하는 경품명', color: '#색상코드', probability: 확률 },
  // ...
];
```

### 색상 테마 변경
`assets/css/common.css`의 CSS 변수를 수정하세요:

```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #ec4899;
  --success-color: #10b981;
  /* ... */
}
```

### 참여 횟수 제한 변경
각 게임 파일의 `remaining` 변수를 수정하세요:

```javascript
let remaining = 3; // 원하는 횟수로 변경
```

## 📱 브라우저 호환성

- ✅ Chrome/Edge (권장)
- ✅ Firefox
- ✅ Safari
- ✅ 모바일 브라우저 (iOS/Android)

## 📄 라이선스

MIT License - 자유롭게 사용하고 수정하세요!

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 등록해주세요!

---

Made with ❤️ for creating engaging customer experiences

