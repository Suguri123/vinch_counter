// Firebase Configuration for Vinci Counter
// 프로젝트: vinci-counter

const defaultFirebaseConfig = {
  apiKey: "AIzaSyCHXLfgEbRB8B3ZBhfJVDi_78XHBLp4ueM",
  authDomain: "vinci-counter.firebaseapp.com",
  projectId: "vinci-counter",
  storageBucket: "vinci-counter.firebasestorage.app",
  messagingSenderId: "723315746373",
  appId: "1:723315746373:web:0ed886563a47b3e50f252c",
  measurementId: "G-02YENGJ1J4"
};

// 로컬 저장소에 커스텀 설정이 있다면 우선 사용, 없으면 위 기본 설정 사용
function getFirebaseConfig() {
  try {
    const saved = localStorage.getItem('vincibot_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.apiKey !== 'YOUR_API_KEY_HERE') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Firebase 설정 로드 실패:', e);
  }
  return defaultFirebaseConfig;
}

window.firebaseConfig = getFirebaseConfig();
