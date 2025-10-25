// Firebase 설정 파일
// 실제 Firebase 프로젝트 설정으로 교체하세요

const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "game-event-platform.firebaseapp.com",
  projectId: "game-event-platform",
  storageBucket: "game-event-platform.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Firebase 설정 업데이트
if (window.firebaseDB) {
  window.firebaseDB.config = firebaseConfig;
}

console.log('Firebase 설정 로드됨:', firebaseConfig);
