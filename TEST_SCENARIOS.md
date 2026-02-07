# LogToStory Test Scenarios

**Last Updated**: 2026-02-08
**Purpose**: Comprehensive test scenarios for manual and automated testing
**Target**: MVP validation and quality assurance

---

## Test Environment Setup

### Prerequisites
- [ ] Development server running (`npm run dev`)
- [ ] Environment variables configured (`.env.local`)
- [ ] OpenAI API key valid and with sufficient credits
- [ ] Browser: Chrome/Firefox/Safari (latest versions)

### Test Data Location
All test inputs are provided in this document under each scenario.

---

## 📋 Test Scenario Categories

1. [Basic Functionality](#1-basic-functionality-tests)
2. [Evidence Handling](#2-evidence-handling-tests)
3. [Code Block Processing](#3-code-block-processing-tests)
4. [Language & Platform Combinations](#4-language--platform-combinations)
5. [Tone Violation Detection](#5-tone-violation-detection)
6. [Character Limits & Validation](#6-character-limits--validation)
7. [Error Handling](#7-error-handling-tests)
8. [UI/UX Features](#8-uiux-features)
9. [Edge Cases](#9-edge-cases)

---

## 1. Basic Functionality Tests

### Test 1.1: Simple Log to LinkedIn Post (Korean)

**Input**:
```
rawLog: "오늘 회원가입 버그를 수정했다. 이메일 validation이 제대로 작동하지 않아서 일부 사용자가 가입할 수 없었다."
outcome: "회원가입 버그 수정 완료"
tonePreset: linkedin
outputLanguage: ko
evidenceBefore: (empty)
evidenceAfter: (empty)
humanInsight: (empty)
```

**Expected Output**:
- ✅ LinkedIn 한국어 포스트 생성됨
- ✅ STAR 프레임워크 구조 (Situation, Task, Action, Result)
- ✅ Evidence missing info 메시지 표시 (파란색)
- ✅ 숫자/성능 주장 없음 (evidence 없으므로)
- ✅ Copy 버튼 활성화
- ✅ 편집 가능한 텍스트 영역

**Success Criteria**:
- [ ] Output이 한국어로 생성됨
- [ ] Evidence missing 경고 표시됨
- [ ] 복사 기능 작동
- [ ] 텍스트 편집 가능

---

### Test 1.2: Simple Log to X Post (English)

**Input**:
```
rawLog: "Fixed a critical authentication bug that was blocking 20% of login attempts. Root cause was a race condition in the token refresh logic."
outcome: "Fixed auth bug affecting 20% of logins"
tonePreset: x
outputLanguage: en
evidenceBefore: "Login success rate: 80%"
evidenceAfter: "Login success rate: 100%"
humanInsight: (empty)
```

**Expected Output**:
- ✅ X 영어 포스트 생성됨 (짧고 간결)
- ✅ Evidence 수치 포함 (80% → 100%)
- ✅ Evidence missing 메시지 없음
- ✅ 280자 이내 (X 제한)

**Success Criteria**:
- [ ] Output이 영어로 생성됨
- [ ] Evidence 수치가 포함됨
- [ ] 280자 이내
- [ ] Evidence 경고 없음

---

### Test 1.3: Both Languages Output

**Input**:
```
rawLog: "데이터베이스 쿼리 최적화 작업. N+1 쿼리 문제를 해결하고 인덱스를 추가했다."
outcome: "DB 쿼리 성능 개선"
tonePreset: linkedin
outputLanguage: both
evidenceBefore: "응답 시간: 2.5초"
evidenceAfter: "응답 시간: 0.3초"
humanInsight: "인덱스 추가가 가장 큰 효과를 냈음"
```

**Expected Output**:
- ✅ LinkedIn 한국어 포스트 생성
- ✅ LinkedIn 영어 포스트 생성
- ✅ 언어 탭 표시 (KO/EN)
- ✅ 각 언어별 독립적 편집 가능
- ✅ Evidence 수치 양쪽 언어 모두 포함
- ✅ Human insight 반영

**Success Criteria**:
- [ ] 한국어/영어 포스트 모두 생성
- [ ] 언어 탭이 표시됨
- [ ] 각 언어 독립적으로 편집 가능
- [ ] Evidence가 양쪽에 포함

---

## 2. Evidence Handling Tests

### Test 2.1: With Complete Evidence

**Input**:
```
rawLog: "API 응답 속도 개선 작업. 캐싱 레이어 추가 및 불필요한 DB 쿼리 제거"
outcome: "API 성능 10배 향상"
tonePreset: linkedin
outputLanguage: ko
evidenceBefore: "평균 응답시간: 1000ms, 처리량: 100 req/s"
evidenceAfter: "평균 응답시간: 100ms, 처리량: 1000 req/s"
humanInsight: "Redis 캐싱이 핵심이었음"
```

**Expected Output**:
- ✅ Evidence 수치가 정확히 인용됨
- ✅ Evidence missing 경고 없음
- ✅ Before/After 비교 명확
- ✅ Human insight 반영

**Success Criteria**:
- [ ] Evidence 원문 그대로 포함
- [ ] 경고 메시지 없음
- [ ] Before/After 명확히 구분

---

### Test 2.2: Without Evidence (Should Suppress Numbers)

**Input**:
```
rawLog: "사용자 피드백 기반으로 UI/UX 개선. 버튼 위치 변경, 색상 조정, 폰트 크기 증가"
outcome: "UI/UX 대폭 개선으로 사용성 향상"
tonePreset: linkedin
outputLanguage: ko
evidenceBefore: (empty)
evidenceAfter: (empty)
humanInsight: (empty)
```

**Expected Output**:
- ✅ Evidence missing info 메시지 표시
- ✅ "대폭", "10배", "50% 향상" 같은 숫자 주장 없음
- ✅ 정성적 표현 사용 ("개선", "향상", "더 나은")

**Success Criteria**:
- [ ] Evidence 경고 표시됨
- [ ] 구체적 숫자/퍼센트 없음
- [ ] 정성적 표현만 사용

---

### Test 2.3: Partial Evidence (Only Before)

**Input**:
```
rawLog: "메모리 누수 버그 수정"
outcome: "메모리 누수 해결"
tonePreset: linkedin
outputLanguage: en
evidenceBefore: "Memory usage: 2GB and growing"
evidenceAfter: (empty)
humanInsight: (empty)
```

**Expected Output**:
- ✅ Evidence missing 경고 표시 (After 없음)
- ✅ Before 수치는 언급 가능
- ✅ After 수치는 주장하지 않음

**Success Criteria**:
- [ ] Before evidence만 포함
- [ ] After 수치 주장 없음
- [ ] Evidence 경고 표시

---

## 3. Code Block Processing Tests

### Test 3.1: Single Code Block

**Input**:
```
rawLog: "간단한 유틸리티 함수 추가

```javascript
function formatDate(date) {
  return date.toISOString().split('T')[0];
}
```

이제 날짜 포맷팅이 일관되게 적용됨"
outcome: "날짜 포맷팅 유틸리티 추가"
tonePreset: linkedin
outputLanguage: ko
```

**Expected Output**:
- ✅ 코드 블록이 Shiki로 렌더링됨
- ✅ JavaScript 문법 하이라이팅
- ✅ Code Block Card 표시
- ✅ 언어 라벨 표시 (javascript)

**Success Criteria**:
- [ ] 코드 블록 렌더링됨
- [ ] 문법 하이라이팅 적용
- [ ] 언어 라벨 정확

---

### Test 3.2: Multiple Code Blocks (Max 3)

**Input**:
```
rawLog: "API 엔드포인트 리팩토링

Before:
```javascript
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    res.json(results);
  });
});
```

After:
```javascript
app.get('/users', async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
});
```

Tests:
```javascript
test('GET /users returns all users', async () => {
  const response = await request(app).get('/users');
  expect(response.status).toBe(200);
});
```

추가 코드 (4번째 - 무시되어야 함):
```javascript
const extra = 'should be ignored';
```
"
outcome: "API 엔드포인트 리팩토링 완료"
tonePreset: linkedin
outputLanguage: ko
```

**Expected Output**:
- ✅ 처음 3개 코드 블록만 렌더링
- ✅ 4번째 블록은 무시됨
- ✅ 각 블록 문법 하이라이팅 적용

**Success Criteria**:
- [ ] 정확히 3개 블록만 표시
- [ ] 모든 블록 하이라이팅됨
- [ ] 4번째 블록 무시됨

---

### Test 3.3: Long Code Block (Truncation)

**Input**:
```
rawLog: "긴 설정 파일 추가

```json
{
  "name": "logtostory",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "next": "^15.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write ."
  }
}
```
(이 설정은 20줄 이상이라고 가정)"
outcome: "프로젝트 설정 파일 추가"
tonePreset: linkedin
outputLanguage: ko
```

**Expected Output**:
- ✅ 코드 블록 truncated (최대 줄 수 제한)
- ✅ "... (truncated)" 표시
- ✅ `truncated: true` 플래그

**Success Criteria**:
- [ ] 긴 코드는 잘림
- [ ] Truncation 표시됨
- [ ] 여전히 렌더링됨

---

## 4. Language & Platform Combinations

### Test 4.1: All 12 Combinations

| # | Language | Platform | Evidence | Expected Result |
|---|----------|----------|----------|-----------------|
| 1 | ko | linkedin | Yes | ✅ 한국어 LinkedIn 포스트 + Evidence |
| 2 | ko | linkedin | No | ✅ 한국어 LinkedIn 포스트 + Evidence 경고 |
| 3 | ko | x | Yes | ✅ 한국어 X 포스트 (짧음) + Evidence |
| 4 | ko | x | No | ✅ 한국어 X 포스트 + Evidence 경고 |
| 5 | en | linkedin | Yes | ✅ 영어 LinkedIn 포스트 + Evidence |
| 6 | en | linkedin | No | ✅ 영어 LinkedIn 포스트 + Evidence 경고 |
| 7 | en | x | Yes | ✅ 영어 X 포스트 + Evidence |
| 8 | en | x | No | ✅ 영어 X 포스트 + Evidence 경고 |
| 9 | both | linkedin | Yes | ✅ 양쪽 언어 + 탭 + Evidence |
| 10 | both | linkedin | No | ✅ 양쪽 언어 + 탭 + Evidence 경고 |
| 11 | both | x | Yes | ✅ 양쪽 언어 + 탭 + Evidence |
| 12 | both | x | No | ✅ 양쪽 언어 + 탭 + Evidence 경고 |

**Test Data for Each**:
```
rawLog: "버그 수정 작업"
outcome: "버그 수정 완료"
evidenceBefore: "에러율: 5%"  (if Yes)
evidenceAfter: "에러율: 0.1%"  (if Yes)
```

**Success Criteria**:
- [ ] 모든 12개 조합 성공
- [ ] 언어별 올바른 출력
- [ ] 플랫폼별 톤 차이
- [ ] Evidence 처리 정확

---

## 5. Tone Violation Detection

### Test 5.1: Hype Words in rawLog

**Input**:
```
rawLog: "This is a revolutionary breakthrough that will dramatically transform the industry. Our game-changing solution leverages cutting-edge AI to deliver unparalleled results."
outcome: "Launched new AI feature"
tonePreset: linkedin
outputLanguage: en
```

**Expected Output**:
- ✅ Tone violation 경고 (노란색)
- ✅ 감지된 hype 단어 목록:
  - "revolutionary"
  - "breakthrough"
  - "dramatically"
  - "transform"
  - "game-changing"
  - "cutting-edge"
  - "unparalleled"
- ✅ 출력에서 hype 단어 중화됨

**Success Criteria**:
- [ ] Tone violation 경고 표시
- [ ] Hype 단어 목록 정확
- [ ] 출력에서 중화됨

---

### Test 5.2: Multiple Tone Violations

**Input**:
```
rawLog: "Amazing breakthrough! Revolutionary game-changer with incredible results. Best-in-class solution!"
outcome: "New feature launch"
tonePreset: linkedin
outputLanguage: en
```

**Expected Output**:
- ✅ Tone violation 경고
- ✅ 여러 hype 단어 감지
- ✅ 전문적인 톤으로 재작성

**Success Criteria**:
- [ ] 모든 hype 단어 감지
- [ ] 경고 표시됨
- [ ] 중화된 출력

---

## 6. Character Limits & Validation

### Test 6.1: Maximum Length Fields

**Input**:
```
rawLog: (2000자 정확히 - "a" 반복)
outcome: (200자 정확히 - "b" 반복)
humanInsight: (300자 정확히 - "c" 반복)
tonePreset: linkedin
outputLanguage: ko
```

**Expected Output**:
- ✅ 모든 필드 수락됨
- ✅ Character counter 표시: "2000 / 2000"
- ✅ 에러 없음

**Success Criteria**:
- [ ] 최대 길이에서 수락됨
- [ ] Counter 정확
- [ ] 제출 성공

---

### Test 6.2: Exceeding Maximum Length

**Input**:
```
rawLog: (2001자 - 초과)
outcome: "Test"
tonePreset: linkedin
outputLanguage: ko
```

**Expected Output**:
- ✅ 빨간색 에러 메시지
- ✅ "Max 2000 characters (current: 2001)"
- ✅ Submit 버튼 비활성화 또는 에러

**Success Criteria**:
- [ ] 에러 메시지 표시
- [ ] Character counter 빨강
- [ ] 제출 실패

---

### Test 6.3: Empty Required Field (outcome)

**Input**:
```
rawLog: "Some work"
outcome: (empty)
tonePreset: linkedin
outputLanguage: ko
```

**Expected Output**:
- ✅ Validation 에러 (빨강)
- ✅ "One Sentence Result is required"
- ✅ 제출 불가

**Success Criteria**:
- [ ] Required field 에러
- [ ] 제출 차단

---

## 7. Error Handling Tests

### Test 7.1: Rate Limit Error (429)

**Setup**: 1시간 내에 4번 요청

**Expected Output**:
- ✅ Rate limit 에러 메시지 (빨강)
- ✅ "Too many requests from this IP address"
- ✅ Retry after time 표시 (예: "Please try again in 45 minutes")
- ✅ Output 영역 비워짐
- ✅ Dismissable = false (닫기 불가)

**Success Criteria**:
- [ ] 에러 메시지 표시됨
- [ ] Retry 시간 정확
- [ ] Output 클리어됨
- [ ] 닫기 버튼 없음

---

### Test 7.2: Budget Exceeded Error

**Setup**: 월간 예산 초과 (환경 변수로 낮게 설정)

**Expected Output**:
- ✅ Budget exceeded 에러 (빨강)
- ✅ "Monthly LLM budget has been reached"
- ✅ Budget 상태 표시:
  - Spent: $X.XX / Limit: $Y.YY
  - Resets: YYYY-MM-DD
- ✅ Dismissable = false

**Success Criteria**:
- [ ] 에러 메시지 표시
- [ ] Budget 정보 정확
- [ ] Reset 날짜 표시

---

### Test 7.3: Network Error

**Setup**: 서버 중지 후 요청

**Expected Output**:
- ✅ API 에러 메시지 (빨강)
- ✅ "An error occurred while generating content"
- ✅ Dismissable = true

**Success Criteria**:
- [ ] 에러 메시지 표시
- [ ] 닫기 가능

---

### Test 7.4: Invalid JSON Response

**Setup**: (Requires backend modification)

**Expected Output**:
- ✅ API 에러 처리
- ✅ 사용자 친화적 메시지

**Success Criteria**:
- [ ] Graceful error handling
- [ ] No crash

---

## 8. UI/UX Features

### Test 8.1: Copy to Clipboard (Individual)

**Steps**:
1. Generate output
2. Click "Copy LinkedIn Post (한국어)" button

**Expected Output**:
- ✅ 버튼 텍스트: "Copy" → "Copied!" (2초)
- ✅ Checkmark icon 표시
- ✅ Toast 알림: "LinkedIn (한국어) post copied to clipboard!"
- ✅ Clipboard에 텍스트 복사됨

**Success Criteria**:
- [ ] 버튼 상태 변경
- [ ] Toast 표시
- [ ] 실제 복사 성공

---

### Test 8.2: Copy All with Watermark

**Steps**:
1. Generate BOTH languages
2. Click "Copy All" button

**Expected Output**:
- ✅ 버튼: "Copy All" → "Copied!" (2초)
- ✅ Toast: "All content copied to clipboard with watermark!"
- ✅ Clipboard 내용:
```
## LinkedIn (한국어)
[content]

## LinkedIn (English)
[content]

## X (한국어)
[content]

## X (English)
[content]

---
Generated by LogToStory
```

**Success Criteria**:
- [ ] 모든 콘텐츠 복사
- [ ] 워터마크 포함
- [ ] 포맷 정확

---

### Test 8.3: Edit Output

**Steps**:
1. Generate output
2. Click into textarea
3. Edit text
4. Copy edited version

**Expected Output**:
- ✅ 텍스트 편집 가능
- ✅ 편집된 내용이 복사됨
- ✅ 원본 output 상태 유지

**Success Criteria**:
- [ ] 편집 가능
- [ ] 편집 내용 복사됨

---

### Test 8.4: Platform/Language Tab Switching

**Steps**:
1. Generate BOTH languages
2. Switch between platforms (LinkedIn ↔ X)
3. Switch between languages (KO ↔ EN)

**Expected Output**:
- ✅ 탭 전환 시 올바른 콘텐츠 표시
- ✅ Active 탭 하이라이팅
- ✅ 각 조합별 독립적 내용

**Success Criteria**:
- [ ] 탭 전환 부드러움
- [ ] 올바른 콘텐츠 표시
- [ ] 하이라이팅 정확

---

### Test 8.5: Loading State

**Steps**:
1. Submit form
2. Observe loading state

**Expected Output**:
- ✅ Spinner animation 표시
- ✅ "Generating..." 버튼 텍스트
- ✅ 버튼 비활성화
- ✅ Output 영역에 로딩 표시

**Success Criteria**:
- [ ] Loading indicator 표시
- [ ] 버튼 비활성화
- [ ] 중복 제출 방지

---

### Test 8.6: Dismiss Feedback Messages

**Steps**:
1. Generate output without evidence (shows info message)
2. Click X button on feedback message

**Expected Output**:
- ✅ 메시지가 사라짐
- ✅ 다른 내용 영향 없음
- ✅ 재생성 시 다시 표시됨

**Success Criteria**:
- [ ] Dismiss 작동
- [ ] 재생성 시 재표시

---

## 9. Edge Cases

### Test 9.1: Empty rawLog (Optional Field)

**Input**:
```
rawLog: (empty)
outcome: "Completed task"
tonePreset: linkedin
outputLanguage: ko
```

**Expected Output**:
- ✅ 여전히 생성됨 (rawLog는 optional)
- ✅ outcome 기반 콘텐츠

**Success Criteria**:
- [ ] 생성 성공
- [ ] Outcome 반영됨

---

### Test 9.2: Special Characters & Emojis

**Input**:
```
rawLog: "🚀 Deployed new feature! 특수문자: <>&\"' 테스트"
outcome: "Feature 🎉 deployed"
tonePreset: linkedin
outputLanguage: ko
```

**Expected Output**:
- ✅ 이모지 처리됨
- ✅ 특수 문자 이스케이프됨
- ✅ XSS 방지

**Success Criteria**:
- [ ] 이모지 유지/제거 일관성
- [ ] 특수 문자 안전 처리
- [ ] XSS 없음

---

### Test 9.3: Very Short Input

**Input**:
```
rawLog: "Fixed bug"
outcome: "Done"
tonePreset: linkedin
outputLanguage: en
```

**Expected Output**:
- ✅ 짧지만 의미있는 출력 생성
- ✅ STAR 구조 유지 시도
- ✅ 최소 길이 보장

**Success Criteria**:
- [ ] 출력 생성됨
- [ ] 의미 있는 내용

---

### Test 9.4: Code Blocks Only (No Text)

**Input**:
```
rawLog: "
```javascript
function test() { return true; }
```
"
outcome: "Added test function"
tonePreset: linkedin
outputLanguage: en
```

**Expected Output**:
- ✅ 코드 블록 추출됨
- ✅ 텍스트 콘텐츠 생성됨
- ✅ 코드 카드 표시

**Success Criteria**:
- [ ] 코드 인식됨
- [ ] 텍스트 생성됨

---

### Test 9.5: Mixed Language Input

**Input**:
```
rawLog: "버그 수정 completed. Fixed the authentication issue in login flow. 이제 정상 작동한다."
outcome: "Authentication bug fixed"
tonePreset: linkedin
outputLanguage: en
```

**Expected Output**:
- ✅ 영어 출력 생성 (outputLanguage=en)
- ✅ 한글 입력 번역/이해됨
- ✅ 일관된 언어로 출력

**Success Criteria**:
- [ ] 혼합 입력 처리
- [ ] 올바른 출력 언어

---

## 📊 Test Execution Checklist

### Pre-Test Setup
- [ ] Clear browser cache
- [ ] Check `.env.local` configuration
- [ ] Verify OpenAI API key
- [ ] Start dev server
- [ ] Open browser console (check for errors)

### Execution
- [ ] Run each test scenario
- [ ] Record results (Pass/Fail)
- [ ] Screenshot failures
- [ ] Note unexpected behaviors

### Post-Test
- [ ] Summarize results
- [ ] File bug reports for failures
- [ ] Update test scenarios based on findings
- [ ] Verify all P0 features work

---

## 🐛 Bug Report Template

When a test fails, use this template:

```markdown
**Test ID**: [e.g., Test 5.1]
**Test Name**: [e.g., Hype Words in rawLog]
**Status**: FAIL

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
[What should happen]

**Actual Result**:
[What actually happened]

**Screenshots**:
[Attach screenshots]

**Browser**: [Chrome/Firefox/Safari version]
**Environment**: [Development/Production]
**Priority**: [P0/P1/P2]
```

---

## ✅ Test Results Summary

**Date**: _________
**Tester**: _________
**Environment**: _________

| Category | Total | Passed | Failed | Skip | Pass Rate |
|----------|-------|--------|--------|------|-----------|
| Basic Functionality | 3 | | | | |
| Evidence Handling | 3 | | | | |
| Code Block Processing | 3 | | | | |
| Language/Platform Combos | 12 | | | | |
| Tone Violation | 2 | | | | |
| Character Limits | 3 | | | | |
| Error Handling | 4 | | | | |
| UI/UX Features | 6 | | | | |
| Edge Cases | 5 | | | | |
| **TOTAL** | **41** | | | | |

**Overall Status**: [ ] PASS / [ ] FAIL
**MVP Ready**: [ ] YES / [ ] NO

---

## 📝 Notes

- Evidence 없이 테스트할 경우 숫자 주장이 없는지 확인
- Rate limit 테스트는 1시간에 3번만 가능하므로 신중히 실행
- Budget 테스트는 환경 변수 조정 필요
- BOTH 모드 테스트 시 양쪽 언어 모두 확인

**Last Test Run**: _________
**Next Test Scheduled**: _________
