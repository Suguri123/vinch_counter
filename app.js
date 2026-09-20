/**
 * 빈치봇 슈팅게임 - 명예의 전당 (VinciBot Shooting Game Hall of Fame)
 * Application Logic
 */

class BasketballLeaderboard {
  constructor() {
    this.storageKey = 'vincibot_basketball_scores_v1';
    this.records = this.loadRecords();

    // DOM Elements
    this.clockDateEl = document.getElementById('clockDate');
    this.clockTimeEl = document.getElementById('clockTime');
    this.podiumContainer = document.getElementById('podiumContainer');
    this.rankingTableBody = document.getElementById('rankingTableBody');
    this.emptyState = document.getElementById('emptyState');
    this.totalCountBadge = document.getElementById('totalCountBadge');
    this.searchInput = document.getElementById('searchInput');
    this.sortSelect = document.getElementById('sortSelect');
    this.tickerText = document.getElementById('tickerText');

    // Modals
    this.addModal = document.getElementById('addModal');
    this.settingsModal = document.getElementById('settingsModal');
    this.openAddModalBtn = document.getElementById('openAddModalBtn');
    this.closeAddModalBtn = document.getElementById('closeAddModalBtn');
    this.cancelAddBtn = document.getElementById('cancelAddBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.closeSettingsModalBtn = document.getElementById('closeSettingsModalBtn');
    this.closeSettingsBtn = document.getElementById('closeSettingsBtn');

    // Record Form Elements
    this.recordForm = document.getElementById('recordForm');
    this.playerNameInput = document.getElementById('playerName');
    this.playerScoreInput = document.getElementById('playerScore');
    this.playerCommentInput = document.getElementById('playerComment');
    this.btnScoreMinus = document.getElementById('btnScoreMinus');
    this.btnScorePlus = document.getElementById('btnScorePlus');
    this.btnScoreReset = document.getElementById('btnScoreReset');
    this.quickScoreButtons = document.querySelectorAll('.btn-chip[data-add]');

    // Settings Controls
    this.loadSampleDataBtn = document.getElementById('loadSampleDataBtn');
    this.exportDataBtn = document.getElementById('exportDataBtn');
    this.importDataBtn = document.getElementById('importDataBtn');
    this.importFileInput = document.getElementById('importFileInput');
    this.clearAllDataBtn = document.getElementById('clearAllDataBtn');

    // Controls
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');
    this.toastContainer = document.getElementById('toastContainer');

    // Firebase Elements
    this.cloudStatusBadge = document.getElementById('cloudStatusBadge');
    this.firebaseModalStatusBadge = document.getElementById('firebaseModalStatusBadge');
    this.fbApiKeyInput = document.getElementById('fbApiKey');
    this.fbProjectIdInput = document.getElementById('fbProjectId');
    this.saveFirebaseConfigBtn = document.getElementById('saveFirebaseConfigBtn');
    this.resetFirebaseConfigBtn = document.getElementById('resetFirebaseConfigBtn');

    this.init();
  }

  init() {
    this.startClock();
    this.initFirebaseIntegration();
    this.bindEvents();
    this.render();

    // 시작 시 안내
    if (this.records.length === 0) {
      this.showToast('빈치봇 슈팅게임 명예의 전당에 오신 것을 환영합니다! 기록을 등록해보세요.', 'info');
    }
  }

  // ================= Firebase 실시간 클라우드 연동 =================
  initFirebaseIntegration() {
    // 저장된 설정값 인풋 폼에 채우기
    if (this.fbApiKeyInput && this.fbProjectIdInput) {
      const cfg = window.firebaseConfig || {};
      if (cfg.apiKey && cfg.apiKey !== 'YOUR_API_KEY_HERE') {
        this.fbApiKeyInput.value = cfg.apiKey;
      }
      if (cfg.projectId) {
        this.fbProjectIdInput.value = cfg.projectId;
      }
    }

    if (!window.firebaseService) return;

    // 상태 변경 리스너
    window.firebaseService.onStatusChange((connected) => {
      this.updateCloudStatusUI(connected);
    });

    // Firebase 초기화 시도
    const success = window.firebaseService.init();
    if (success) {
      this.setupFirebaseSubscription();
    }
  }

  setupFirebaseSubscription() {
    if (!window.firebaseService) return;

    let isInitialLoad = true;
    window.firebaseService.subscribeScores((cloudRecords) => {
      // 신기록 감지 (다른 기기에서 1등을 갱신했을 때도 모니터에서 축하 연출)
      if (!isInitialLoad && cloudRecords.length > 0) {
        const oldMax = this.records.length > 0 ? Math.max(...this.records.map(r => r.score)) : -1;
        const newMax = Math.max(...cloudRecords.map(r => r.score));
        if (newMax > oldMax && newMax > 0) {
          const champ = cloudRecords.find(r => r.score === newMax);
          if (window.soundManager) window.soundManager.playFanfare();
          if (window.confettiEffect) window.confettiEffect.celebrate();
          this.showToast(`👑 실시간 1위 갱신! ${champ.name}님이 ${champ.score}점을 달성했습니다!`, 'champion');
        }
      }

      this.records = cloudRecords;
      this.render();
      isInitialLoad = false;
    }, (err) => {
      console.warn('Firebase 구독 오류, 로컬 모드로 전환:', err);
      this.updateCloudStatusUI(false);
    });
  }

  updateCloudStatusUI(connected) {
    if (this.cloudStatusBadge) {
      if (connected) {
        this.cloudStatusBadge.classList.add('connected');
        this.cloudStatusBadge.querySelector('.status-text').textContent = '실시간 연동 중';
      } else {
        this.cloudStatusBadge.classList.remove('connected');
        this.cloudStatusBadge.querySelector('.status-text').textContent = '로컬 모드';
      }
    }

    if (this.firebaseModalStatusBadge) {
      if (connected) {
        this.firebaseModalStatusBadge.className = 'badge live-badge';
        this.firebaseModalStatusBadge.textContent = '클라우드 연결됨';
      } else {
        this.firebaseModalStatusBadge.className = 'badge';
        this.firebaseModalStatusBadge.textContent = '로컬 모드';
      }
    }
  }

  // ================= LocalStorage 로드 / 저장 =================
  loadRecords() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('기록 불러오기 실패:', e);
      return [];
    }
  }

  saveRecords() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.records));
    } catch (e) {
      console.error('기록 저장 실패:', e);
      this.showToast('데이터 저장 중 오류가 발생했습니다.', 'error');
    }
  }

  // ================= 시계 업데이트 =================
  startClock() {
    const update = () => {
      const now = new Date();
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const date = String(now.getDate()).padStart(2, '0');
      const day = days[now.getDay()];

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      if (this.clockDateEl) {
        this.clockDateEl.textContent = `${year}.${month}.${date} (${day})`;
      }
      if (this.clockTimeEl) {
        this.clockTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
      }
    };

    update();
    setInterval(update, 1000);
  }

  // ================= 이벤트 리스너 바인딩 =================
  bindEvents() {
    // 모달 제어
    this.openAddModalBtn.addEventListener('click', () => this.openModal(this.addModal));
    this.closeAddModalBtn.addEventListener('click', () => this.closeModal(this.addModal));
    this.cancelAddBtn.addEventListener('click', () => this.closeModal(this.addModal));

    this.settingsBtn.addEventListener('click', () => this.openModal(this.settingsModal));
    this.closeSettingsModalBtn.addEventListener('click', () => this.closeModal(this.settingsModal));
    this.closeSettingsBtn.addEventListener('click', () => this.closeModal(this.settingsModal));

    // 배경 클릭 시 모달 닫기
    [this.addModal, this.settingsModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal(this.addModal);
        this.closeModal(this.settingsModal);
      }
    });

    // 점수 입력 보조 버튼
    this.btnScorePlus.addEventListener('click', () => {
      let val = parseInt(this.playerScoreInput.value, 10) || 0;
      this.playerScoreInput.value = val + 1;
      if (window.soundManager) window.soundManager.playClick();
    });

    this.btnScoreMinus.addEventListener('click', () => {
      let val = parseInt(this.playerScoreInput.value, 10) || 0;
      if (val > 0) {
        this.playerScoreInput.value = val - 1;
        if (window.soundManager) window.soundManager.playClick();
      }
    });

    this.btnScoreReset.addEventListener('click', () => {
      this.playerScoreInput.value = 0;
      if (window.soundManager) window.soundManager.playClick();
    });

    this.quickScoreButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const add = parseInt(btn.dataset.add, 10) || 0;
        let val = parseInt(this.playerScoreInput.value, 10) || 0;
        this.playerScoreInput.value = val + add;
        if (window.soundManager) window.soundManager.playScoreSound();
      });
    });

    // 폼 제출 (기록 등록)
    this.recordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRecordSubmit();
    });

    // 검색 및 정렬
    this.searchInput.addEventListener('input', () => this.render());
    this.sortSelect.addEventListener('change', () => this.render());

    // 사운드 토글
    this.soundToggleBtn.addEventListener('click', () => {
      if (window.soundManager) {
        const isEnabled = window.soundManager.toggleSound();
        this.soundToggleBtn.innerHTML = isEnabled ? '<span class="icon">🔊</span>' : '<span class="icon">🔇</span>';
        this.showToast(isEnabled ? '효과음이 켜졌습니다.' : '효과음이 음소거되었습니다.', 'info');
      }
    });

    // 전체화면 토글
    this.fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.warn('전체화면 전환 실패:', err);
        });
        this.fullscreenBtn.innerHTML = '<span class="icon">🗗</span>';
      } else {
        document.exitFullscreen().catch(err => {
          console.warn('전체화면 종료 실패:', err);
        });
        this.fullscreenBtn.innerHTML = '<span class="icon">⛶</span>';
      }
    });

    // 설정: 샘플 데이터 불러오기
    this.loadSampleDataBtn.addEventListener('click', () => {
      if (confirm('기존 기록에 샘플 참가자 10명의 데이터를 추가하시겠습니까?')) {
        this.addSampleData();
        this.closeModal(this.settingsModal);
        this.showToast('샘플 데이터 10명이 추가되었습니다!', 'success');
      }
    });

    // 설정: JSON 다운로드
    this.exportDataBtn.addEventListener('click', () => {
      this.exportToJson();
    });

    // 설정: JSON 파일 업로드
    this.importDataBtn.addEventListener('click', () => {
      this.importFileInput.click();
    });

    this.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        this.importFromJson(file);
      }
    });

    // 설정: 전체 삭제
    this.clearAllDataBtn.addEventListener('click', async () => {
      if (confirm('경고: 모든 명예의 전당 기록이 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
        if (window.firebaseService && window.firebaseService.isConnected) {
          try {
            await window.firebaseService.clearAllScores();
            this.showToast('클라우드의 모든 기록이 초기화되었습니다.', 'info');
          } catch (e) {
            console.error('Firebase 초기화 실패:', e);
            this.showToast('초기화 중 오류가 발생했습니다.', 'error');
          }
        } else {
          this.records = [];
          this.saveRecords();
          this.render();
          this.showToast('모든 기록이 초기화되었습니다.', 'info');
        }
        this.closeModal(this.settingsModal);
      }
    });

    // Firebase 설정 저장 버튼
    if (this.saveFirebaseConfigBtn) {
      this.saveFirebaseConfigBtn.addEventListener('click', () => {
        const apiKey = this.fbApiKeyInput.value.trim();
        const projectId = this.fbProjectIdInput.value.trim() || 'vinci-counter';

        if (!apiKey) {
          this.showToast('Firebase API Key를 입력해주세요.', 'error');
          return;
        }

        const newConfig = {
          apiKey: apiKey,
          authDomain: `${projectId}.firebaseapp.com`,
          projectId: projectId,
          storageBucket: `${projectId}.appspot.com`,
          messagingSenderId: '',
          appId: ''
        };

        localStorage.setItem('vincibot_firebase_config', JSON.stringify(newConfig));
        window.firebaseConfig = newConfig;

        const success = window.firebaseService.init(newConfig);
        if (success) {
          this.setupFirebaseSubscription();
          this.showToast('Firebase 클라우드 실시간 동기화가 연결되었습니다!', 'success');
        } else {
          this.showToast('Firebase 연결에 실패했습니다. 키를 확인해주세요.', 'error');
        }
      });
    }

    // Firebase 연결 해제 버튼
    if (this.resetFirebaseConfigBtn) {
      this.resetFirebaseConfigBtn.addEventListener('click', () => {
        localStorage.removeItem('vincibot_firebase_config');
        if (this.fbApiKeyInput) this.fbApiKeyInput.value = '';
        if (window.firebaseService && window.firebaseService.unsubscribe) {
          window.firebaseService.unsubscribe();
        }
        if (window.firebaseService) {
          window.firebaseService.notifyStatus(false);
        }
        this.records = this.loadRecords();
        this.render();
        this.showToast('Firebase 연결이 해제되어 로컬 모드로 전환되었습니다.', 'info');
      });
    }
  }

  openModal(modal) {
    modal.classList.add('active');
    if (modal === this.addModal) {
      this.playerNameInput.value = '';
      this.playerScoreInput.value = '0';
      this.playerCommentInput.value = '';
      setTimeout(() => this.playerNameInput.focus(), 150);
    }
  }

  closeModal(modal) {
    modal.classList.remove('active');
  }

  // ================= 기록 등록 처리 =================
  async handleRecordSubmit() {
    const name = this.playerNameInput.value.trim();
    const score = parseInt(this.playerScoreInput.value, 10);
    const comment = this.playerCommentInput.value.trim();

    if (!name) {
      this.showToast('선수 이름을 입력해주세요.', 'error');
      return;
    }

    if (isNaN(score) || score < 0) {
      this.showToast('유효한 점수를 입력해주세요.', 'error');
      return;
    }

    // 신기록 / 1위 달성 여부 체크
    const currentChampionScore = this.records.length > 0 
      ? Math.max(...this.records.map(r => r.score)) 
      : -1;

    const isNewChampion = score > currentChampionScore;

    const newRecord = {
      name: name,
      score: score,
      comment: comment || '빈치봇 슈팅게임 참가!',
      timestamp: Date.now()
    };

    // Firebase 클라우드 연동 여부에 따라 분기
    if (window.firebaseService && window.firebaseService.isConnected) {
      try {
        await window.firebaseService.addScore(newRecord);
      } catch (err) {
        console.error('Firebase 저장 실패, 로컬에 대체 저장:', err);
        newRecord.id = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
        this.records.push(newRecord);
        this.saveRecords();
        this.render();
        this.closeModal(this.addModal);
        this.showToast('⚠️ 클라우드 저장 실패! (Firestore 규칙에서 쓰기를 허용해주세요)', 'error');
        return;
      }
    } else {
      newRecord.id = 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
      this.records.push(newRecord);
      this.saveRecords();
      this.render();
    }

    this.closeModal(this.addModal);

    // 화려한 축하 연출
    if (isNewChampion && score > 0) {
      if (window.soundManager) window.soundManager.playFanfare();
      if (window.confettiEffect) window.confettiEffect.celebrate();
      this.showToast(`👑 축하합니다! ${name}님이 ${score}점으로 명예의 전당 1위 챔피언에 올랐습니다!`, 'champion');
    } else {
      if (window.soundManager) window.soundManager.playScoreSound();
      if (window.confettiEffect) window.confettiEffect.fire({ particleCount: 50, startVelocity: 30 });
      this.showToast(`🏀 ${name}님의 기록(${score}점)이 등록되었습니다!`, 'success');
    }
  }

  // ================= 기록 삭제 처리 =================
  async deleteRecord(id) {
    const record = this.records.find(r => r.id === id);
    if (!record) return;

    if (confirm(`'${record.name}' (${record.score}점) 선수의 기록을 삭제하시겠습니까?`)) {
      if (window.firebaseService && window.firebaseService.isConnected) {
        try {
          await window.firebaseService.deleteScore(id);
          this.showToast('클라우드에서 기록이 삭제되었습니다.', 'info');
        } catch (err) {
          console.error('Firebase 삭제 실패:', err);
          this.showToast('삭제 중 오류가 발생했습니다.', 'error');
        }
      } else {
        this.records = this.records.filter(r => r.id !== id);
        this.saveRecords();
        this.render();
        this.showToast('기록이 삭제되었습니다.', 'info');
      }
    }
  }

  // ================= 렌더링 =================
  render() {
    // 1. 순위별 정렬된 원본 리스트 (점수 내림차순, 동점시 빠른 등록 우선)
    const sortedByRank = [...this.records].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timestamp - b.timestamp;
    });

    // 각 아이템에 실시간 랭킹(rank) 부여
    const rankedRecords = sortedByRank.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    // 2. TOP 3 포디움 업데이트
    this.renderPodium(rankedRecords);

    // 3. 필터링 및 테이블 정렬
    const searchQuery = this.searchInput.value.trim().toLowerCase();
    const sortMode = this.sortSelect.value;

    let displayRecords = [...rankedRecords];

    if (searchQuery) {
      displayRecords = displayRecords.filter(item => 
        item.name.toLowerCase().includes(searchQuery) ||
        (item.comment && item.comment.toLowerCase().includes(searchQuery))
      );
    }

    displayRecords.sort((a, b) => {
      switch (sortMode) {
        case 'score-desc':
          return b.score - a.score || a.timestamp - b.timestamp;
        case 'score-asc':
          return a.score - b.score || a.timestamp - b.timestamp;
        case 'date-desc':
          return b.timestamp - a.timestamp;
        case 'date-asc':
          return a.timestamp - b.timestamp;
        default:
          return b.score - a.score;
      }
    });

    this.renderTable(displayRecords);

    // 4. 참가자 수 배지 및 티커 업데이트
    if (this.totalCountBadge) {
      this.totalCountBadge.textContent = `총 ${this.records.length}명 참가`;
    }

    if (this.tickerText) {
      if (rankedRecords.length > 0) {
        const champ = rankedRecords[0];
        this.tickerText.textContent = `👑 현재 1위: [${champ.name}] 선수 (${champ.score}점) - "${champ.comment}" | 빈치봇으로 새로운 기록에 도전하세요! 🏀🔥`;
      } else {
        this.tickerText.textContent = `🤖 빈치봇으로 멋진 슛을 던져보세요! 림을 통과하면 골인! 최고 득점에 도전하세요! 🏀🔥`;
      }
    }
  }

  // 포디움 렌더링
  renderPodium(rankedRecords) {
    const top1 = rankedRecords[0] || null;
    const top2 = rankedRecords[1] || null;
    const top3 = rankedRecords[2] || null;

    this.fillPodiumCard('podium1', top1, '최고 득점자에 도전하세요!');
    this.fillPodiumCard('podium2', top2, '대기 중...');
    this.fillPodiumCard('podium3', top3, '대기 중...');
  }

  fillPodiumCard(prefix, data, defaultComment) {
    const nameEl = document.getElementById(`${prefix}-name`);
    const scoreEl = document.getElementById(`${prefix}-score`);
    const dateEl = document.getElementById(`${prefix}-date`);
    const commentEl = document.getElementById(`${prefix}-comment`);

    if (data) {
      nameEl.textContent = data.name;
      scoreEl.innerHTML = `${data.score.toLocaleString()} <span class="unit">점</span>`;
      dateEl.textContent = this.formatDate(data.timestamp);
      commentEl.textContent = `"${data.comment || '파이팅!'}"`;
    } else {
      nameEl.textContent = '-';
      scoreEl.innerHTML = `0 <span class="unit">점</span>`;
      dateEl.textContent = '-';
      commentEl.textContent = defaultComment;
    }
  }

  // 순위표 테이블 렌더링
  renderTable(records) {
    if (!this.rankingTableBody) return;

    this.rankingTableBody.innerHTML = '';

    if (records.length === 0) {
      if (this.emptyState) this.emptyState.style.display = 'block';
      return;
    }

    if (this.emptyState) this.emptyState.style.display = 'none';

    records.forEach(item => {
      const tr = document.createElement('tr');
      if (item.rank === 1) tr.classList.add('row-rank-1');
      else if (item.rank === 2) tr.classList.add('row-rank-2');
      else if (item.rank === 3) tr.classList.add('row-rank-3');

      let rankDisplay = '';
      if (item.rank === 1) rankDisplay = '<span class="rank-number-badge">🥇</span>';
      else if (item.rank === 2) rankDisplay = '<span class="rank-number-badge">🥈</span>';
      else if (item.rank === 3) rankDisplay = '<span class="rank-number-badge">🥉</span>';
      else rankDisplay = `<span class="rank-number-badge">${item.rank}</span>`;

      tr.innerHTML = `
        <td class="td-rank">${rankDisplay}</td>
        <td class="td-name">
          <div class="player-info-cell">
            <span class="cell-avatar" style="position: relative;">
              ${item.rank === 1 ? '<span style="position: absolute; top: -8px; left: 50%; transform: translateX(-50%); font-size: 14px; z-index: 2;">👑</span>' : ''}
              <img src="vincibot.png" alt="빈치봇">
            </span>
            <span class="cell-name">${this.escapeHtml(item.name)}</span>
          </div>
        </td>
        <td class="td-score">
          <span class="score-icon">🏀</span>${item.score.toLocaleString()}<span class="score-unit">점</span>
        </td>
        <td class="td-comment" title="${this.escapeHtml(item.comment)}">
          ${this.escapeHtml(item.comment || '-')}
        </td>
        <td class="td-date">${this.formatDate(item.timestamp)}</td>
        <td class="td-actions">
          <button type="button" class="btn-delete-row" title="기록 삭제" data-id="${item.id}">
            🗑️
          </button>
        </td>
      `;

      const deleteBtn = tr.querySelector('.btn-delete-row');
      deleteBtn.addEventListener('click', () => this.deleteRecord(item.id));

      this.rankingTableBody.appendChild(tr);
    });
  }

  // ================= 샘플 데이터 주입 =================
  addSampleData() {
    const samples = [
      { name: '빈치마스터', score: 28, comment: '연속 3점슛 7개 성공!' },
      { name: '로봇농구왕', score: 24, comment: '빈치봇 팔 각도 45도가 비결' },
      { name: '골든스테이트', score: 22, comment: '클러치 슛 작렬!' },
      { name: '슬램덩크', score: 18, comment: '왼손은 거들 뿐' },
      { name: '코트의지배자', score: 16, comment: '다음엔 25점 넘긴다' },
      { name: '슈퍼빈치', score: 14, comment: '로봇 코딩 재미있네요' },
      { name: '농구꿈나무', score: 12, comment: '처음 해봤는데 대박' },
      { name: '버저비터', score: 10, comment: '마지막 1초 극적 골' },
      { name: '핸디플레이어', score: 8, comment: '연습 더 하고 올게요' },
      { name: '초보슈터', score: 6, comment: '재밌어요!' }
    ];

    const now = Date.now();
    samples.forEach((s, idx) => {
      this.records.push({
        id: 'sample_' + now + '_' + idx,
        name: s.name,
        score: s.score,
        comment: s.comment,
        timestamp: now - (idx * 180000) // 시간차 부여
      });
    });

    this.saveRecords();
    this.render();
  }

  // ================= 데이터 백업 및 복원 =================
  exportToJson() {
    const dataStr = JSON.stringify(this.records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vincibot_basketball_hall_of_fame_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('순위표 데이터가 다운로드되었습니다.', 'success');
  }

  importFromJson(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          this.records = imported;
          this.saveRecords();
          this.render();
          this.closeModal(this.settingsModal);
          this.showToast(`성공적으로 ${imported.length}건의 기록을 복원했습니다!`, 'success');
        } else {
          throw new Error('올바른 배열 형식이 아닙니다.');
        }
      } catch (err) {
        alert('JSON 파일 형식이 올바르지 않습니다: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ================= 유틸리티 =================
  formatDate(timestamp) {
    if (!timestamp) return '-';
    const d = new Date(timestamp);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}.${date} ${hours}:${minutes}`;
  }

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    else if (type === 'champion') icon = '👑';
    else if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${this.escapeHtml(message)}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3500);
  }
}

// 애플리케이션 시작
document.addEventListener('DOMContentLoaded', () => {
  window.leaderboardApp = new BasketballLeaderboard();
});
