// Firebase Realtime Database 설정 파일
// Firebase 콘솔에서 받은 실제 설정

const firebaseConfig = {
  apiKey: "AIzaSyBew3EgQ57RrxUjDjYDC6s_ecj49etpSVI",
  authDomain: "lucky-784fd.firebaseapp.com",
  databaseURL: "https://lucky-784fd-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lucky-784fd",
  storageBucket: "lucky-784fd.firebasestorage.app",
  messagingSenderId: "836524677981",
  appId: "1:836524677981:web:f2ffcc81e9d3619a5466b4"
};

// Firebase 설정 업데이트
if (window.firebaseDB) {
  window.firebaseDB.config = firebaseConfig;
}

console.log('Firebase 설정 로드됨:', firebaseConfig);
