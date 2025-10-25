// Firebase 설정 파일
// Firebase 콘솔에서 받은 실제 설정으로 교체하세요

const firebaseConfig = {
  apiKey: "여기에_실제_apiKey_입력",
  authDomain: "여기에_실제_authDomain_입력",
  projectId: "여기에_실제_projectId_입력",
  storageBucket: "여기에_실제_storageBucket_입력",
  messagingSenderId: "여기에_실제_messagingSenderId_입력",
  appId: "여기에_실제_appId_입력"
};

// Firebase 설정 업데이트
if (window.firebaseDB) {
  window.firebaseDB.config = firebaseConfig;
}

console.log('Firebase 설정 로드됨:', firebaseConfig);
