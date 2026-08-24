# 회의록 자동 작성 도구

회의 중 오가는 말을 **실시간으로 받아쓰면서 각 발화의 경과 시각을 함께 남기는** 웹 도구. 회의를 끝내면 타임스탬프가 붙은 텍스트와 녹음 파일이 저장된다. 팀 회의 정리에 드는 시간을 줄이려고 만들었다.

**▶ [데모 영상](https://youtu.be/fdBgJYRKUAs)**

![실행 화면](https://github.com/HanSeungJun/meeting_record_helper/assets/81555330/2a34d114-11ae-424b-9a0e-227ac5d5c126)

---

## 동작

1. **회의 시작** — 타이머가 돌기 시작하고, 마이크가 자동으로 연결된다
2. **진행 중** — 확정된 발화는 `[분:초]`가 붙어 아래로 쌓이고, 아직 확정되지 않은 인식 결과는 별도 영역에 실시간으로 표시된다
3. **회의 종료** — 타이머가 멈추고 두 파일이 저장된다
   - `{ISO 8601 시각}.txt` — 타임스탬프가 붙은 전체 회의록
   - `recorded_audio.mp3` — 회의 녹음

---

## 구현 노트

**브라우저가 음성 인식을 임의로 끊는 문제.** Web Speech API는 일정 시간이 지나거나 발화가 멈추면 인식 세션을 스스로 종료한다. 그대로 두면 회의 중간에 받아쓰기가 조용히 멈춰 버린다. `onend`에서 즉시 다시 시작해 세션을 이어 붙였다.

```js
recognition.onend = function() {
  recognition.start();
};
```

**중간 결과와 확정 결과를 나눠 처리한다.** `interimResults`를 켜면 인식 중인 문장이 계속 바뀌면서 들어온다. `isFinal`이 true인 것만 타임스탬프를 찍어 회의록에 넣고, 나머지는 미리보기 영역에만 뿌린다. 그렇지 않으면 같은 문장이 여러 번 기록된다.

**받아쓰기와 녹음은 별개 API다.** 텍스트는 Web Speech API가, 음성 파일은 `MediaRecorder`가 담당한다. 두 개를 함께 시작하고 함께 멈춘다.

---

## 실행

정적 파일뿐이라 빌드가 없다. 다만 마이크 권한 때문에 `file://`로 열면 동작하지 않으므로 로컬 서버가 필요하다.

```bash
git clone https://github.com/HanSeungJun/meeting_record_helper.git
cd meeting_record_helper
python -m http.server 8000
# http://localhost:8000
```

VS Code의 **Live Server** 확장으로 `index.html`을 열어도 된다.

---

## 제약

- **Web Speech API를 지원하는 브라우저에서만 동작한다** (Chrome 계열). 미지원 브라우저에서는 안내 후 종료한다
- 인식은 브라우저가 클라우드로 보내 처리한다 — 오프라인에서는 동작하지 않는다

---

## 파일 구조

```
index.html    화면
script.js     음성 인식 · 녹음 · 타이머 · 파일 저장
style.css     스타일
```

---

## 라이선스

MIT
