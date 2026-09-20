/**
 * Firebase Firestore Service for Vinci Counter
 * 실시간 클라우드 동기화 (모바일/태블릿에서 입력 시 모니터 전광판에 즉각 반영)
 */

class FirebaseService {
  constructor() {
    this.app = null;
    this.db = null;
    this.collectionName = 'vinci_scores';
    this.unsubscribe = null;
    this.isConnected = false;
    this.statusListeners = [];
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
    callback(this.isConnected);
  }

  notifyStatus(connected) {
    this.isConnected = connected;
    this.statusListeners.forEach(fn => fn(connected));
  }

  isConfigured(config) {
    const cfg = config || window.firebaseConfig;
    return !!(cfg && cfg.apiKey && cfg.apiKey !== 'YOUR_API_KEY_HERE' && cfg.projectId);
  }

  init(config) {
    const cfg = config || window.firebaseConfig;
    if (!this.isConfigured(cfg)) {
      console.log('Firebase 설정이 완료되지 않아 로컬 모드로 작동합니다.');
      this.notifyStatus(false);
      return false;
    }

    try {
      if (!window.firebase) {
        console.warn('Firebase SDK가 로드되지 않았습니다.');
        this.notifyStatus(false);
        return false;
      }

      if (window.firebase.apps.length > 0) {
        this.app = window.firebase.apps[0];
      } else {
        this.app = window.firebase.initializeApp(cfg);
      }

      this.db = window.firebase.firestore();
      this.notifyStatus(true);
      console.log('Firebase Firestore 연결 성공:', cfg.projectId);
      return true;
    } catch (err) {
      console.error('Firebase 초기화 실패:', err);
      this.notifyStatus(false);
      return false;
    }
  }

  // 실시간 점수 구독
  subscribeScores(onUpdate, onError) {
    if (!this.db) return null;

    if (this.unsubscribe) {
      this.unsubscribe();
    }

    try {
      this.unsubscribe = this.db.collection(this.collectionName)
        .onSnapshot((snapshot) => {
          const records = [];
          snapshot.forEach(doc => {
            records.push({
              id: doc.id,
              ...doc.data()
            });
          });
          records.sort((a, b) => (b.score || 0) - (a.score || 0));
          onUpdate(records);
        }, (error) => {
          console.error('Firestore 실시간 동기화 오류:', error);
          if (onError) onError(error);
        });

      return this.unsubscribe;
    } catch (e) {
      console.error('Firestore 구독 설정 실패:', e);
      return null;
    }
  }

  // 새 기록 저장
  async addScore(record) {
    if (!this.db) throw new Error('Firebase가 연결되지 않았습니다.');
    
    // Firestore 문서 추가
    const docRef = await this.db.collection(this.collectionName).add({
      name: record.name,
      score: record.score,
      comment: record.comment || '',
      timestamp: record.timestamp || Date.now()
    });

    return docRef.id;
  }

  // 기록 삭제
  async deleteScore(id) {
    if (!this.db) throw new Error('Firebase가 연결되지 않았습니다.');
    await this.db.collection(this.collectionName).doc(id).delete();
  }

  // 전체 기록 삭제
  async clearAllScores() {
    if (!this.db) throw new Error('Firebase가 연결되지 않았습니다.');
    const snapshot = await this.db.collection(this.collectionName).get();
    const batch = this.db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
}

window.firebaseService = new FirebaseService();
