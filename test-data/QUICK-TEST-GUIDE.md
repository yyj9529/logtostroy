# Quick Test Guide - LogToStory

**목적**: MVP 기능을 빠르게 검증하기 위한 필수 테스트 가이드

---

## 🚀 Quick Start (5분 테스트)

### 1. 기본 동작 확인
```
rawLog: "버그 수정 작업"
outcome: "버그 수정 완료"
tonePreset: linkedin
outputLanguage: ko
```
**확인사항**: ✅ 출력 생성됨, ✅ Evidence 경고 표시, ✅ 복사 버튼 작동

---

### 2. Evidence 있는 경우
```
rawLog: "성능 개선"
outcome: "API 속도 향상"
tonePreset: linkedin
outputLanguage: en
evidenceBefore: "Response time: 2s"
evidenceAfter: "Response time: 0.5s"
```
**확인사항**: ✅ Evidence 인용됨, ✅ 경고 없음, ✅ 수치 포함

---

### 3. 코드 블록
```
rawLog: "함수 추가

\`\`\`javascript
function test() { return true; }
\`\`\`

완료"
outcome: "함수 추가"
tonePreset: linkedin
outputLanguage: ko
```
**확인사항**: ✅ 코드 하이라이팅, ✅ Code Card 표시

---

### 4. BOTH 모드
```
rawLog: "작업 완료"
outcome: "완료"
tonePreset: linkedin
outputLanguage: both
```
**확인사항**: ✅ 한/영 모두 생성, ✅ 언어 탭 표시

---

### 5. Tone Violation
```
rawLog: "This revolutionary breakthrough is a game-changer!"
outcome: "New feature"
tonePreset: linkedin
outputLanguage: en
```
**확인사항**: ✅ Tone 경고 (노란색), ✅ Hype 단어 목록

---

## ⚡ 우선순위별 테스트

### P0 (필수 - 5분)
- [ ] 기본 생성 (한국어)
- [ ] Evidence 처리
- [ ] 복사 기능
- [ ] 에러 없음

### P1 (중요 - 10분)
- [ ] BOTH 모드
- [ ] 코드 블록
- [ ] Tone violation
- [ ] Character counter

### P2 (선택 - 15분)
- [ ] 모든 언어/플랫폼 조합
- [ ] Edge cases
- [ ] Rate limit (1시간 후)

---

## 🎯 빠른 에러 체크

### 콘솔 에러 확인
```
F12 → Console 탭 확인
빨간색 에러 없어야 함
```

### Network 체크
```
F12 → Network 탭
/api/generate 요청 200 OK
```

### 시각적 체크
- [ ] 레이아웃 깨짐 없음
- [ ] 버튼 모두 작동
- [ ] 텍스트 잘림 없음
- [ ] 색상 정확 (빨강/노랑/파랑)

---

## 🔴 Critical Path (반드시 확인)

1. **Submit → Output 생성** ✅
2. **Copy 버튼 → Toast 알림** ✅
3. **Evidence 경고 표시** ✅
4. **Loading state 표시** ✅
5. **에러 시 메시지 표시** ✅

---

## 📊 테스트 체크리스트

```
날짜: __________
테스터: __________

[ ] P0 모든 테스트 통과
[ ] 콘솔 에러 없음
[ ] UI 정상 작동
[ ] 복사 기능 작동
[ ] Evidence 처리 정확
[ ] 에러 핸들링 정상

결과: PASS / FAIL
```

---

## 🐛 자주 발생하는 이슈

### 1. "Failed to generate content"
- OpenAI API 키 확인
- .env.local 파일 확인
- 인터넷 연결 확인

### 2. 코드 블록 안 보임
- Markdown 형식 확인 (```언어)
- Shiki 로딩 확인

### 3. Copy 안됨
- HTTPS 환경 확인 (localhost는 OK)
- 브라우저 권한 확인

### 4. Evidence 경고 안 보임
- evidenceBefore/After 비어있는지 확인
- 새로고침 후 재시도

---

## 📞 도움말

**문서**: README.md, TEST_SCENARIOS.md
**테스트 데이터**: test-data/test-logs.json
**이슈 리포트**: GitHub Issues

**Last Updated**: 2026-02-08
