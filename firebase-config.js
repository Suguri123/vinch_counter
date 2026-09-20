// Firebase Configuration for Vinci Counter
// Firebase 콘솔(https://console.firebase.google.com/)에서 프로젝트 생성 후 
// 웹 앱(</>)을 추가하여 발급받은 설정값을 여기에 입력하거나 웹사이트의 설정(⚙️) 메뉴에서 입력할 수 있습니다.

const defaultFirebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "vinci-counter.firebaseapp.com",
  projectId: "vinci-counter",
  storageBucket: "vinci-counter.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID_HERE"
};

// 로컬 저장소에 저장된 설정이 있다면 우선 사용
function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem('vincibot_firebase_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Firebase 설정 로드 실패:', e);
  }
  return defaultFirebaseConfig;
}

window.firebaseConfig = getFirebaseConfig();
