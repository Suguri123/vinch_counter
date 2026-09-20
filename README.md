# 🤖 빈치봇 슈팅게임 - 명예의 전당 (VinciBot Shooting Game Hall of Fame)

빈치봇(VinciBot) 로봇 슈팅게임의 득점 기록을 실시간으로 관리하고, 대형 모니터나 스크린에 멋지게 띄워둘 수 있는 **명예의 전당 전광판 웹 애플리케이션**입니다.

---

## 🌟 주요 기능

1. **🏆 TOP 3 명예의 전당 (포디움 시상대)**
   - 1위(챔피언 황금 포디움 & 왕관), 2위(은빛 포디움), 3위(동빛 포디움)를 실시간으로 하이라이트 표시합니다.
   - 새로운 1위가 탄생하면 화려한 **황금 폭죽(Confetti) 연출과 팡파레 축하음**이 자동으로 재생됩니다!

2. **📊 전체 참가자 순위표 (Leaderboard)**
   - 점수 순위(1~3위 메달 뱃지 표시), 참가자 이름, 득점, 소감(한마디), 등록 시간을 한눈에 확인.
   - **이름 검색** 및 **정렬 필터** (점수 높은순, 낮은순, 최신 등록순, 오래된순) 지원.

3. **🏀 편리한 점수 등록 모달**
   - 선수 이름과 점수를 손쉽게 입력할 수 있습니다.
   - 마우스나 터치로 쉽게 점수를 더할 수 있는 **빠른 추가 칩 (`+1점`, `+2점(야투)`, `+3점(3점슛)`, `+5점`)** 및 증감 버튼 지원.

4. **📺 대형 모니터 / 부스 디스플레이 최적화**
   - **전체화면(Fullscreen) 모드**: 헤더 우측의 `⛶` 버튼을 누르면 브라우저 전체화면으로 전환되어 완벽한 경기장 전광판 모드가 됩니다.
   - **실시간 디지털 시계**: 경기장 분위기를 살리는 초 단위 라이브 시계 내장.
   - **다크 네온 농구 코트 디자인**: 눈의 피로를 덜고 행사장에서 시선을 사로잡는 세련된 사이버/네온 스포츠 그래픽.

5. **💾 데이터 영구 보존 & 실시간 Firebase 클라우드 연동**
   - **Firebase 프로젝트 연동**: 프로젝트명 `vinci-counter` 지원!
   - 스마트폰이나 별도 태블릿에서 점수를 입력하면, 대형 모니터에 띄워진 전광판에 **새로고침 없이 실시간(Live Sync)으로 즉각 반영**됩니다.
   - 오프라인이거나 Firebase 미연결 시에는 자동으로 브라우저 로컬 저장소(`localStorage`)로 안전하게 보존됩니다.
   - 설정(`⚙️`) 메뉴에서 **샘플 데이터 로드**, **JSON 파일 백업/복원**, **Firebase API 키 설정**, **전체 초기화**를 할 수 있습니다.

6. **🔊 100% 오프라인 동작 사운드 & 파티클**
   - 외부 인터넷 연결이 끊겨도 Web Audio API와 자체 Canvas 파티클 엔진으로 효과음과 폭죽 효과가 100% 완벽 동작합니다.

---

## 🔥 Firebase (`vinci-counter`) 연동 방법

스마트폰이나 태블릿을 '입력용 리모컨'으로 쓰고, 모니터나 TV를 '전광판 디스플레이'로 사용하려면 Firebase를 연결할 수 있습니다:

1. [Firebase 콘솔](https://console.firebase.google.com/) 접속 -> `vinci-counter` 프로젝트 선택
2. **Firestore Database** 생성 (테스트 모드로 시작 또는 읽기/쓰기 허용 규칙 설정):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /vinci_scores/{document} {
         allow read, write: if true;
       }
     }
   }
   ```
3. **프로젝트 설정(톱니바퀴) > 일반 > 내 앱**에서 웹 앱(`</>`) 등록 후 `apiKey` 복사
4. 웹사이트 우측 상단 **설정(`⚙️`)**을 누른 후:
   - **Firebase API Key** 입력창에 복사한 키를 붙여넣고
   - **[Firebase 연결 저장 및 동기화]** 클릭!
   - 상단 로고 옆에 `🟢 실시간 연동 중` 뱃지가 표시되면 연동 완료!
5. [firebase-config.js](file:///C:/Users/handi/Desktop/pages/vincci_counter/firebase-config.js) 파일에 직접 API Key를 적어두면 매번 입력하지 않아도 자동으로 연결됩니다.

---

## 🚀 실행 방법

별도의 서버 설치나 복잡한 과정 없이 바로 실행할 수 있습니다:

1. 탐색기에서 [index.html](file:///C:/Users/handi/Desktop/pages/vincci_counter/index.html) 파일을 마우스로 **더블 클릭**합니다.
2. 기본 웹 브라우저(Chrome, Edge, Whale 등)에서 즉시 실행됩니다.
3. 모니터나 TV 화면에 창을 띄운 뒤 헤더 우측의 **`⛶` (전체화면)** 버튼을 누르면 전광판으로 활용할 수 있습니다.

---

## 📁 파일 구조

- [index.html](file:///C:/Users/handi/Desktop/pages/vincci_counter/index.html) : 전광판 및 모달 인터페이스 구조
- [style.css](file:///C:/Users/handi/Desktop/pages/vincci_counter/style.css) : 농구 코트 네온 테마, 포디움 시상대 및 애니메이션 스타일
- [app.js](file:///C:/Users/handi/Desktop/pages/vincci_counter/app.js) : 점수 계산, 순위 업데이트, 검색/필터, Firebase 및 로컬 동기화 로직
- [firebase-config.js](file:///C:/Users/handi/Desktop/pages/vincci_counter/firebase-config.js) : Firebase 프로젝트 `vinci-counter` 설정 파일
- [firebase-service.js](file:///C:/Users/handi/Desktop/pages/vincci_counter/firebase-service.js) : Firestore 실시간 구독 및 데이터 입출력 서비스
- [sounds.js](file:///C:/Users/handi/Desktop/pages/vincci_counter/sounds.js) : 브라우저 내장 신디사이저 기반 경기장 효과음 (골인 차임벨, 팡파레, 휘슬, 클릭음)
- [confetti.js](file:///C:/Users/handi/Desktop/pages/vincci_counter/confetti.js) : 100% 자체 구동 가능한 캔버스 축하 폭죽 파티클 라이브러리
