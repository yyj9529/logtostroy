# Work Log: Character Counter Implementation

**Engineer**: Claude Opus 4.5
**Date**: 2026-02-03
**JIRA**: LOG-46 ([UI] Character Counter 구현)
**Parent**: Section 10 (Cost & Usage Guardrails)
**Branch**: `feature/LOG-46-character-counter`

---

## 1. Context

### Problem Statement
InputForm의 각 텍스트 입력 필드(`rawLog`, `outcome`, `humanInsight`)에 글자 수 제한이 존재하지만(`FIELD_LIMITS` 상수), 사용자에게 현재 글자 수를 실시간으로 보여주는 UI가 없었다. 사용자는:
- 현재 몇 글자를 입력했는지 알 수 없음
- 제한을 초과했을 때 Submit 후에야 에러를 발견
- 제한에 가까워지고 있다는 시각적 피드백 없음

### Constraints
- **기존 상수 재사용**: `lib/types/form.ts`의 `FIELD_LIMITS`를 그대로 활용 (rawLog: 2000, outcome: 200, humanInsight: 200)
- **실시간 업데이트**: 매 키 입력마다 카운터가 갱신되어야 함
- **초과 시 빨간색**: 제한을 넘으면 시각적으로 빨간색 경고
- **기존 에러 메시지와 공존**: 기존 validation 에러 메시지가 있을 때 카운터와 나란히 표시
- **최소 변경**: 새 파일/의존성 추가 없이 `InputForm.tsx` 단일 파일 수정

### Impact if Not Done
- 사용자가 rawLog 2000자 제한에 도달했는지 모른 채 긴 로그를 붙여넣고 Submit 시 에러 경험
- outcome/humanInsight 200자 제한이 직관적이지 않아 반복적 수정 필요
- PRD Section 10의 Usage Guardrails가 사용자에게 투명하게 전달되지 않음

---

## 2. Options Considered

### Option A: 별도 CharacterCounter 컴포넌트 생성
**Approach**: `components/CharacterCounter.tsx` 재사용 컴포넌트를 만들어 각 필드에 삽입

**Pros**:
- 재사용 가능한 독립 컴포넌트
- 단위 테스트 작성 용이

**Cons**:
- 3개 필드에만 사용되는데 별도 파일 생성은 과도함
- props 전달 오버헤드 (currentLength, maxLength, hasError)
- 기존 에러 메시지와의 레이아웃 조합을 위해 결국 부모에서 wrapper 필요

**Why rejected**: 현재 사용처가 3곳뿐이고 로직이 단순함 (조건부 색상 + 숫자 표시). 별도 컴포넌트는 과도한 추상화.

### Option B: InputForm 내 인라인 구현 (CHOSEN)
**Approach**: 각 필드 아래에 `flex justify-between`으로 에러 메시지(좌)와 카운터(우)를 배치

**Pros**:
- 단일 파일 수정으로 완결
- 기존 에러 메시지 레이아웃과 자연스럽게 통합
- `FIELD_LIMITS` 상수를 직접 참조하여 하드코딩 없음
- 변경 범위가 최소 (43 insertions, 6 deletions)

**Cons**:
- 3개 필드에 유사한 JSX 패턴이 반복됨

**Why chosen**: 가장 단순하고 직접적인 해법. 반복되는 패턴이 있지만, 각 필드의 에러 처리 방식이 미묘하게 다르고 (rawLog는 에러만, outcome은 에러+required, humanInsight는 optional), 3번의 반복은 추상화보다 명시적 코드가 가독성이 좋음.

### Option C: HTML `maxLength` 속성으로 입력 자체를 차단
**Approach**: `<input maxLength={200}>`, `<textarea maxLength={2000}>`으로 브라우저에서 입력 차단

**Pros**:
- 코드 변경 최소
- 브라우저 네이티브 동작

**Cons**:
- 사용자에게 왜 더 이상 입력이 안 되는지 피드백이 없음
- 붙여넣기 시 잘림 현상이 발생하며 데이터 손실 가능
- AC에서 요구하는 "X / 2000 형식 표시"를 충족하지 못함

**Why rejected**: AC에서 명시적으로 글자 수 표시를 요구. 입력 차단은 UX가 좋지 않고, 카운터 표시 요구사항을 충족하지 못함.

---

## 3. Final Decision

### Chosen Approach: 인라인 카운터 with 조건부 색상

**패턴 설계**:

각 필드 아래에 `flex justify-between` 컨테이너를 배치:
- **좌측**: 에러 메시지 (있을 경우) 또는 빈 `<span />`
- **우측**: `{currentLength} / {maxLength}` 카운터

**색상 로직**:
```
정상: text-gray-500 (회색, 비강조)
초과: text-red-400 (빨간색, 경고)
```

**Why `text-gray-500` for normal state?** 기존 UI가 다크 테마(`bg-[#1a1d29]`)이며, `text-gray-500`은 충분히 읽히지만 주요 콘텐츠를 방해하지 않는 밸런스. `text-gray-400`은 입력 텍스트(`text-gray-300`)와 너무 가까워 시각적 계층이 무너짐.

**Why `text-red-400` for exceeded?** 기존 에러 메시지가 이미 `text-red-400`을 사용. 동일한 색상을 사용하여 "에러 상태"의 일관성 유지.

**필드별 차이점**:

| 필드 | 타입 | 카운터 형식 | 에러 공존 | Optional 처리 |
|------|------|-------------|-----------|---------------|
| rawLog | textarea | `X / 2000` | 좌: 에러, 우: 카운터 | `formData.rawLog.length` (항상 string) |
| outcome | input | `X / 200` | 좌: 에러, 우: 카운터 | `formData.outcome.length` (항상 string) |
| humanInsight | input | `X / 200` | 카운터만 (우측 정렬) | `formData.humanInsight?.length ?? 0` (optional field) |

**Why humanInsight uses optional chaining?** `LogFormData` 인터페이스에서 `humanInsight?: string`으로 선언되어 있어 `undefined`일 수 있음. `?.length ?? 0`으로 안전하게 처리.

**Why humanInsight has no error row?** 기존 코드에서 humanInsight 필드는 에러 메시지 표시가 없었음 (optional 필드). 에러가 없으므로 `flex justify-end`로 카운터만 우측 정렬.

---

## 4. Execution Details

### Files Modified

#### `components/InputForm.tsx` (43 insertions, 6 deletions)

**Change 1: rawLog 카운터 (lines 164-179)**

```tsx
// Before
{errors.rawLog && (
  <p className="text-xs text-red-400 mt-1">{errors.rawLog}</p>
)}

// After
<div className="flex justify-between items-center mt-1">
  {errors.rawLog ? (
    <p className="text-xs text-red-400">{errors.rawLog}</p>
  ) : (
    <span />
  )}
  <span className={`text-xs ${
    formData.rawLog.length > FIELD_LIMITS.rawLog ? 'text-red-400' : 'text-gray-500'
  }`}>
    {formData.rawLog.length} / {FIELD_LIMITS.rawLog}
  </span>
</div>
```

**Why `<span />` as placeholder?** `justify-between`은 두 자식이 있어야 카운터가 우측에 배치됨. 에러가 없을 때 빈 `<span />`이 좌측 공간을 차지하여 카운터가 항상 우측 정렬.

**Why `mt-1` moved from `<p>` to `<div>`?** 에러 메시지와 카운터를 감싸는 컨테이너에 상단 마진을 적용하여 일관된 간격 유지. 개별 요소에 마진을 두면 에러 유무에 따라 간격이 달라짐.

**Change 2: outcome 카운터 (lines 197-212)**

rawLog과 동일한 패턴. `FIELD_LIMITS.outcome` (200) 사용.

**Change 3: humanInsight 카운터 (lines 337-347)**

```tsx
// Before
(no counter)

// After
<div className="flex justify-end mt-1">
  <span className={`text-xs ${
    (formData.humanInsight?.length ?? 0) > FIELD_LIMITS.humanInsight
      ? 'text-red-400'
      : 'text-gray-500'
  }`}>
    {formData.humanInsight?.length ?? 0} / {FIELD_LIMITS.humanInsight}
  </span>
</div>
```

**Why `justify-end` instead of `justify-between`?** humanInsight에는 에러 메시지가 없으므로 좌측 placeholder가 불필요. `justify-end`로 카운터만 우측 정렬.

### Files NOT Modified (의도적)

- **`lib/types/form.ts`**: `FIELD_LIMITS` 상수를 그대로 사용. 하드코딩 없이 상수 참조.
- **`app/api/generate/route.ts`**: 서버 사이드 validation은 이미 Zod 스키마로 동작 중. 카운터는 순수 UI 기능.
- **`globals.css`**: 새로운 CSS 불필요. Tailwind 유틸리티 클래스로 충분.

### JIRA 상태 변경

- LOG-46: `해야 할 일` -> `진행 중` (transition ID: 21)

### Commands Executed

```bash
# Branch 생성
git checkout -b feature/LOG-46-character-counter

# 의존성 설치 (fresh worktree)
npm install

# Build 검증 (TypeScript 컴파일 + ESLint)
npm run build
# Result: Compiled successfully in 16.7s
# Note: 4 pre-existing lint errors (unused vars) -- not introduced by this PR

# Commit
git add components/InputForm.tsx
git commit -m "feat: add real-time character counters to input fields (LOG-46)"

# Push 시도 -> GitHub 인증 미설정으로 실패 (수동 push 필요)
git push -u origin feature/LOG-46-character-counter
```

---

## 5. Errors & Debugging

### Error 1: TypeScript Compiler Not Found
**Symptom**: `npx tsc --noEmit` -> "This is not the tsc command you are looking for"

**Root Cause**: Fresh worktree에서 `node_modules` 미설치. `npx`가 `tsc` 패키지(typescript와 다른 패키지)를 다운로드 시도.

**Resolution**: `npm install` 후 `npm run build`로 대체 (Next.js build가 tsc + eslint 모두 실행).

**Lesson**: Fresh worktree에서는 항상 의존성 설치를 먼저 실행.

### Error 2: Pre-existing Lint Errors in Build
**Symptom**: `npm run build` -> ESLint errors (4 errors, 1 warning)

**Details**:
```
InputForm.tsx:7  - 'TonePreset' unused
InputForm.tsx:8  - 'OutputLanguage' unused
InputForm.tsx:124 - 'platform' unused parameter
InputForm.tsx:124 - 'language' unused parameter
OutputDisplay.tsx:40 - useEffect missing dependency 'outputLanguage'
```

**Root Cause**: 이전 PR들에서 유입된 기존 lint 문제. 이 PR의 변경과 무관.

**Resolution**: TypeScript 컴파일은 성공 ("Compiled successfully in 16.7s"). Lint 에러는 기존 코드 문제로, 이 PR의 scope 밖. 별도 lint fix PR에서 처리 필요.

**Lesson**: CI/CD에서 lint를 strict하게 적용하지 않으면 기존 에러가 누적됨.

### Error 3: GitHub Push Authentication Failure
**Symptom**: `git push` -> `fatal: could not read Username for 'https://github.com'`

**Root Cause**: Worktree 환경에 GitHub 인증 (PAT/SSH key)이 설정되어 있지 않음. `gh auth status`도 미인증.

**Resolution**: 커밋은 로컬에 완료됨. 사용자가 수동으로 push 및 PR 생성 예정.

---

## 6. Validation

### TypeScript Compilation
```bash
npm run build
# Compiled successfully in 16.7s
```

Validates:
- `FIELD_LIMITS.rawLog`, `FIELD_LIMITS.outcome`, `FIELD_LIMITS.humanInsight` 참조가 정상
- Optional chaining `formData.humanInsight?.length` 타입 안전
- JSX 구조에 문법 오류 없음

### Visual Logic Review

| 시나리오 | rawLog 카운터 | 색상 |
|----------|--------------|------|
| 빈 상태 | `0 / 2000` | gray-500 |
| 입력 중 | `523 / 2000` | gray-500 |
| 제한 초과 | `2100 / 2000` | red-400 |
| 에러 + 초과 | 좌: 에러 메시지 (red-400), 우: `2100 / 2000` (red-400) | both red |

### Backward Compatibility
- `handleChange` 함수 변경 없음 -- 기존 validation 로직 그대로 동작
- `validateField`, `validateForm` 변경 없음 -- Submit 시 에러 처리 동일
- 에러 메시지 텍스트 변경 없음 -- "Max X characters (current: Y)" 그대로
- API 요청/응답 형식 변경 없음

### What Remains Unverified
1. **브라우저 렌더링**: 실제 브라우저에서 다크 테마 위 `text-gray-500` 카운터의 가독성 확인 필요
2. **모바일 반응형**: 현재 UI가 `w-1/2` 고정 레이아웃이므로 모바일은 별도 이슈
3. **스크린 리더 접근성**: 카운터가 `<span>`이므로 `aria-live="polite"` 추가 고려 가능 (별도 이슈)
4. **Pre-existing lint errors**: 이 PR과 무관하지만 build를 통과하려면 별도 수정 필요

---

## 7. Reusable Principles

### Implementation Patterns

**1. Flex Row로 에러 메시지 + 메타 정보 공존**
```tsx
<div className="flex justify-between items-center mt-1">
  {error ? <p className="text-xs text-red-400">{error}</p> : <span />}
  <span className="text-xs text-gray-500">{meta}</span>
</div>
```

**Reusable**: 입력 필드 아래에 에러(좌)와 보조 정보(우)를 동시에 보여주는 패턴. 파일 업로드 크기 표시, 비밀번호 강도 표시 등에 재활용 가능.

**Key insight**: `<span />`을 placeholder로 사용하면 `justify-between`이 항상 우측 정렬을 유지. 에러가 없을 때도 레이아웃이 흔들리지 않음.

**2. 상수 참조로 하드코딩 방지**
```tsx
// Bad
<span>0 / 2000</span>

// Good
<span>{formData.rawLog.length} / {FIELD_LIMITS.rawLog}</span>
```

**Reusable**: 제한값이 바뀌면 `FIELD_LIMITS` 한 곳만 수정. 카운터, 에러 메시지, 서버 Zod 스키마가 모두 동일 상수를 참조하여 불일치 방지.

**3. Optional Field의 안전한 길이 계산**
```tsx
// Required field (항상 string)
formData.rawLog.length

// Optional field (string | undefined)
formData.humanInsight?.length ?? 0
```

**Reusable**: TypeScript에서 optional 필드의 `.length` 접근 시 `?.` + `?? 0` 조합. 런타임 에러 방지와 타입 안전성 동시 확보.

### What I'd Do Differently Next Time

**1. 접근성 속성 추가**
```tsx
<span aria-live="polite" aria-atomic="true">
  {formData.rawLog.length} / {FIELD_LIMITS.rawLog}
</span>
```

스크린 리더 사용자에게 글자 수 변경을 알려줌. `aria-live="polite"`는 사용자의 현재 작업을 방해하지 않고 다음 일시 정지 시 알림.

**2. 임계값 경고 색상**
```
0-80%: text-gray-500 (회색)
80-100%: text-yellow-400 (노란색, 주의)
100%+: text-red-400 (빨간색, 초과)
```

현재는 초과 시에만 빨간색. 80% 도달 시 노란색 경고를 추가하면 사용자가 미리 대비 가능.

**3. 카운터 컴포넌트 분리 시점**
현재 3개 필드에 유사 패턴이 반복됨. 5개 이상의 필드에서 사용하게 되면 그때 컴포넌트로 추출하는 것이 적절. 현재는 3회 반복이 명시적 코드의 가독성 이점이 더 큼.

### What I'd Keep the Same

**1. 인라인 구현**: 3개 필드에 단순 카운터를 추가하는 데 별도 컴포넌트는 과도한 추상화.

**2. `FIELD_LIMITS` 상수 재사용**: 하드코딩 없이 단일 진실 공급원 유지.

**3. 기존 Tailwind 색상 체계 준수**: `text-red-400`은 에러 상태의 기존 컨벤션. 새로운 색상을 도입하지 않음.

**4. 최소 변경 원칙**: 새 파일 0개, 새 의존성 0개, 1개 파일 수정으로 AC 전체 충족.

---

## References

- JIRA Ticket: LOG-46 ([UI] Character Counter 구현)
- PRD Section 10: Cost & Usage Guardrails
- Branch: `feature/LOG-46-character-counter`
- Commit: `cb1ba11` -- `feat: add real-time character counters to input fields (LOG-46)`
- Related Constants: `lib/types/form.ts` -- `FIELD_LIMITS` (rawLog: 2000, outcome: 200, humanInsight: 200)
- Pending: GitHub push + PR 생성 (인증 설정 후 수동 진행)

---

**End of Work Log**
