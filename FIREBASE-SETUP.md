# 🔥 Firebase 설정 가이드

## 1단계: Firebase 프로젝트 생성

### 1.1 Firebase 콘솔 접속
- https://console.firebase.google.com/ 접속
- Google 계정으로 로그인

### 1.2 프로젝트 생성
1. **"프로젝트 추가"** 클릭
2. **프로젝트 이름**: `game-event-platform` (또는 원하는 이름)
3. **Google Analytics**: 선택사항 (비활성화해도 됨)
4. **프로젝트 생성** 완료

## 2단계: Firestore Database 설정

### 2.1 Firestore Database 생성
1. 좌측 메뉴에서 **"Firestore Database"** 클릭
2. **"데이터베이스 만들기"** 클릭
3. **보안 규칙**: "테스트 모드에서 시작" 선택 (개발용)
4. **위치**: `asia-northeast3` (서울) 선택
5. **완료** 클릭

### 2.2 보안 규칙 설정 (선택사항)
```javascript
// Firestore > 규칙 탭에서 설정
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 모든 읽기/쓰기 허용 (개발용)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 3단계: 웹 앱 등록

### 3.1 웹 앱 추가
1. 프로젝트 설정 (⚙️ 아이콘) 클릭
2. **"웹"** 아이콘 클릭
3. **앱 닉네임**: `game-event-platform-web`
4. **Firebase SDK 설정** 복사

### 3.2 설정 정보 복사
Firebase 콘솔에서 다음과 같은 설정을 복사합니다:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## 4단계: 설정 파일 업데이트

### 4.1 firebase-config.js 수정
`firebase-config.js` 파일을 열고 Firebase 콘솔에서 복사한 설정으로 교체:

```javascript
const firebaseConfig = {
  apiKey: "실제_apiKey_입력",
  authDomain: "실제_authDomain_입력",
  projectId: "실제_projectId_입력",
  storageBucket: "실제_storageBucket_입력",
  messagingSenderId: "실제_messagingSenderId_입력",
  appId: "실제_appId_입력"
};
```

## 5단계: 테스트

### 5.1 관리자 페이지 테스트
1. `admin/game-manager.html` 접속
2. 룰렛 설정 변경
3. **"설정 저장"** 클릭
4. Firebase 콘솔에서 데이터 확인

### 5.2 룰렛 게임 테스트
1. `games/roulette.html` 접속
2. 관리자에서 설정한 값이 반영되는지 확인
3. 실시간 동기화 테스트

## 6단계: 데이터 구조 확인

### 6.1 Firestore 데이터 구조
```
📁 games/
  📄 roulette/
    - id: "roulette"
    - name: "룰렛"
    - enabled: true
    - attempts: 3
    - prizes: [...]
    - lastUpdated: timestamp

📁 users/
  📄 user_1234567890/
    - ip_address: "1.2.3.4"
    - user_agent: "..."
    - created_at: timestamp
    - last_active: timestamp

📁 game_plays/
  📄 auto_id/
    - user_id: "user_1234567890"
    - game_type: "roulette"
    - result: {...}
    - timestamp: timestamp
```

## 문제 해결

### Firebase 초기화 실패
- 설정 파일이 올바른지 확인
- Firebase 프로젝트가 활성화되어 있는지 확인
- 네트워크 연결 상태 확인

### 데이터 동기화 실패
- Firestore 보안 규칙 확인
- 브라우저 콘솔에서 오류 메시지 확인
- Firebase 콘솔에서 데이터 확인

## 보안 고려사항

### 프로덕션 환경
1. **보안 규칙 설정**: 읽기/쓰기 권한 제한
2. **API 키 보호**: 클라이언트 사이드에서 민감한 정보 제거
3. **사용자 인증**: 필요시 Firebase Authentication 추가

### 개발 환경
- 테스트 모드로 시작하여 빠른 개발 가능
- 나중에 보안 규칙 적용
