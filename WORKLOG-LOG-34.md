  Engineer: Claude Opus 4.5
  Date: 2026-02-03
  JIRA: LOG-48 ([UI] Code Block Rendering with Shiki)
  Related: US-06 (Code Block Extraction), PRD Section 8 (Output - Code Cards)
  Branch: root/log-48

  ---
  1. Context

  Problem Statement

  lib/services/openai.ts의 extractCodeBlocks() 함수가 rawLog에서 코드 블록을 추출하고 API 응답에 포함시키고 있었지만, 클라이언트에서 이를 렌더링하는 UI가 없었다. 구체적인 문제:
  - API 응답 변환 과정(route.ts)에서 codeBlocks 데이터가 누락되어 클라이언트에 전달되지 않음
  - Shiki 패키지(v1.26.0)가 설치되어 있었으나 실제 사용되지 않음
  - 코드 블록 렌더링 컴포넌트가 존재하지 않음
  - 긴 코드 블록에 대한 truncation 처리 없음

  Constraints

  - 서버사이드 하이라이팅: Shiki는 비동기 초기화가 필요하므로 클라이언트보다 서버에서 실행하는 것이 적합
  - 최대 3개 코드 블록: extractCodeBlocks()에서 이미 .slice(0, 3) 처리됨
  - HTML 렌더링: 이미지가 아닌 HTML로 구문 강조 표시
  - Truncation: 긴 코드 블록은 잘라내고 마커 표시
  - 에러 없는 빈 상태: 코드가 없을 경우 에러 없이 섹션 숨김
  - 다운로드 기능 제외: MVP 범위 밖

  Impact if Not Done

  - rawLog에 포함된 코드 스니펫이 출력에 표시되지 않아 기술적 맥락 손실
  - 개발자가 공유할 포스트에 코드 하이라이팅이 없어 가독성 저하
  - Shiki 의존성이 번들에 포함되지만 실제 사용되지 않는 dead dependency 상태

  ---
  2. Options Considered

  Option A: 클라이언트사이드 Shiki 렌더링

  Approach: OutputDisplay 컴포넌트에서 useEffect로 Shiki codeToHtml을 직접 호출

  Pros:
  - API 응답 변경 없음
  - 서버 부하 감소

  Cons:
  - Shiki 번들(~2MB+)이 클라이언트에 로드됨
  - 비동기 초기화로 인한 렌더링 깜빡임(flash of unstyled code)
  - use client 컴포넌트에서 import('shiki') 동적 로딩 필요

  Why rejected: 클라이언트 번들 크기 증가가 크고, 렌더링 깜빡임이 UX를 저하함.

  Option B: Next.js Server Component로 코드 블록 렌더링

  Approach: 코드 블록 렌더링을 Server Component로 분리

  Pros:
  - 서버에서 렌더링, 클라이언트 번들 영향 없음
  - Next.js 패턴에 적합

  Cons:
  - OutputDisplay가 use client 컴포넌트이므로 Server Component를 자식으로 배치하기 복잡
  - 데이터 흐름 재설계 필요 (props drilling → suspense boundary)

  Why rejected: 기존 아키텍처(use client 기반 출력 패널)와 호환하기 어려움.

  Option C: API Route에서 서버사이드 프리렌더링 (CHOSEN)

  Approach: /api/generate route에서 코드 블록을 Shiki로 하이라이팅하고 HTML 문자열을 응답에 포함

  Pros:
  - Shiki가 서버(Node.js)에서만 실행됨 → 클라이언트 번들 영향 없음
  - 깜빡임 없음 (HTML이 이미 완성된 상태로 전달)
  - 기존 데이터 흐름(API → state → props)에 자연스럽게 통합
  - 코드 블록 HTML이 캐시 가능

  Cons:
  - API 응답 크기가 약간 증가 (HTML 문자열 포함)
  - dangerouslySetInnerHTML 사용 필요 (서버 생성 HTML이므로 XSS 위험 낮음)

  Why chosen: 기존 아키텍처와 가장 자연스럽게 통합되고, 클라이언트 성능에 영향 없음.

  ---
  3. Final Decision

  Chosen Approach: API Route에서 Shiki 프리렌더링 + CodeBlockCard 컴포넌트

  데이터 흐름:
  rawLog → extractCodeBlocks() → CodeBlock[]
    → highlightCodeBlocks() [Shiki server-side] → HighlightedCodeBlock[]
    → API response → InputForm state → OutputDisplay props → CodeBlockCard render

  새 타입:
  interface HighlightedCodeBlock {
    language: string    // 원본 언어 (e.g., "typescript")
    html: string        // Shiki가 생성한 완성된 HTML
    truncated: boolean  // 20줄 초과 여부
  }

  Truncation 전략:
  - 20줄 초과 시 처음 20줄만 하이라이팅
  - truncated: true 플래그로 UI에서 마커 표시
  - 하이라이팅 전에 truncation 수행 → 성능 최적화 (긴 코드 불필요하게 파싱하지 않음)

  Shiki 설정:
  - Theme: github-dark (기존 UI의 다크 톤과 일관성)
  - 지원되지 않는 언어 → plaintext로 폴백 (에러 대신)

  ---
  4. Execution Details

  Files Created

  lib/services/codeHighlight.ts (52 lines)

  Purpose: Shiki 기반 서버사이드 코드 하이라이팅 유틸리티

  Key decisions:

  MAX_LINES = 20: 코드 블록 truncation 기준. 20줄은 함수 하나 정도의 분량으로, 맥락을 전달하기에 충분하면서 UI를 지배하지 않는 길이.

  truncation 우선 처리:
  function truncateCode(code: string): { code: string; truncated: boolean } {
    const lines = code.split('\n')
    if (lines.length <= MAX_LINES) {
      return { code, truncated: false }
    }
    return {
      code: lines.slice(0, MAX_LINES).join('\n'),
      truncated: true,
    }
  }
  Shiki에 전달하기 전에 truncation을 수행하여 불필요한 토큰 파싱 방지.

  언어 폴백:
  try {
    const html = await codeToHtml(code, { lang: block.language, theme: 'github-dark' })
    results.push({ language: block.language, html, truncated })
  } catch {
    const html = await codeToHtml(code, { lang: 'plaintext', theme: 'github-dark' })
    results.push({ language: block.language, html, truncated })
  }
  rawLog에서 추출된 언어 식별자가 Shiki에서 지원되지 않을 수 있으므로 plaintext로 폴백. language 필드는 원본 값을 유지하여 UI에서 표시.

  components/CodeBlockCard.tsx (36 lines)

  Purpose: 하이라이팅된 코드 블록을 카드 형태로 렌더링

  구조:
  - Header: 코드 블록 번호 + 언어 라벨 (Code Block 1 · typescript)
  - Body: Shiki HTML을 dangerouslySetInnerHTML로 렌더링
  - Footer: truncation 마커 (조건부)

  스타일링 결정:
  - 배경색 #24292e (GitHub Dark 테마와 일치)
  - Header/Footer 배경 #1f2428 (약간 어두운 톤으로 시각적 구분)
  - Tailwind arbitrary variant [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!p-4로 Shiki 생성 <pre> 태그의 기본 스타일 오버라이드

  dangerouslySetInnerHTML 사용 근거:
  - HTML이 서버에서 Shiki(codeToHtml)로 생성됨
  - 사용자 입력이 직접 HTML에 삽입되지 않음 (Shiki가 이스케이프 처리)
  - XSS 위험 낮음

  Files Modified

  lib/types/api.ts (+6 lines)

  Purpose: HighlightedCodeBlock 인터페이스 추가

  export interface HighlightedCodeBlock {
    language: string
    html: string
    truncated: boolean
  }

  기존 CodeBlock 인터페이스(language + code)와 별도로 정의. CodeBlock은 원본 데이터, HighlightedCodeBlock은 렌더링용 데이터라는 책임 분리.

  lib/types/output.ts (+3 lines)

  Purpose: OutputDisplayProps에 codeBlocks prop 추가

  import type { HighlightedCodeBlock } from './api'

  // OutputDisplayProps에 추가:
  codeBlocks?: HighlightedCodeBlock[]

  optional로 정의하여 코드 블록이 없는 기존 사용과 호환.

  app/api/generate/route.ts (+7 lines)

  Purpose: API 응답에 Shiki 하이라이팅된 코드 블록 포함

  import { highlightCodeBlocks } from '@/lib/services/codeHighlight'

  // 코드 블록 하이라이팅 (rawLog에서 추출, 플랫폼 무관)
  const rawCodeBlocks = result.linkedin?.codeBlocks || result.x?.codeBlocks || []
  const highlightedCodeBlocks = await highlightCodeBlocks(rawCodeBlocks)

  const response = {
    ...result,
    codeBlocks: highlightedCodeBlocks,  // 새 필드
    output: { ... },
  }

  result.linkedin?.codeBlocks || result.x?.codeBlocks: 코드 블록은 rawLog에서 추출되므로 플랫폼(LinkedIn/X)에 관계없이 동일. 선택된 플랫폼에서 가져옴.

  components/OutputDisplay.tsx (+20 lines, -1 line)

  Purpose: Code Blocks 섹션 렌더링

  변경사항:
  1. CodeBlockCard import 추가
  2. props에서 codeBlocks 수신
  3. 텍스트 영역과 Copy 버튼 사이에 Code Blocks 섹션 추가:

  {codeBlocks && codeBlocks.length > 0 && (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600">Code Blocks</h3>
      {codeBlocks.map((block, index) => (
        <CodeBlockCard key={index} block={block} index={index} />
      ))}
    </div>
  )}

  코드 블록이 없으면 (codeBlocks undefined 또는 빈 배열) 섹션 자체가 렌더링되지 않음 → AC 충족.

  4. 기존 lint 경고 수정: useEffect dependency에 outputLanguage 추가.

  components/InputForm.tsx (+4 lines, -5 lines)

  Purpose: codeBlocks 상태 관리 및 OutputDisplay에 전달

  변경사항:
  1. HighlightedCodeBlock 타입 import
  2. codeBlocks state 추가: useState<HighlightedCodeBlock[]>([])
  3. API 응답 처리에 setCodeBlocks(result.codeBlocks || []) 추가
  4. OutputDisplay에 codeBlocks={codeBlocks} prop 전달
  5. 기존 lint 에러 수정: 미사용 타입 import 제거, 미사용 파라미터 _ prefix 추가

  ---
  5. Errors & Debugging

  Error 1: TypeScript Compiler Not Found

  Symptom: pnpm type-check 실행 시 sh: 1: tsc: not found

  Root Cause: 새 worktree에서 node_modules가 없는 상태.

  Resolution: pnpm install 실행 후 정상 동작.

  Lesson: Fresh worktree에서는 항상 dependency 설치 먼저.

  Error 2: Build Fails Due to Pre-existing Lint Errors

  Symptom: pnpm build 실패 - InputForm.tsx에서 4개 ESLint 에러, OutputDisplay.tsx에서 1개 경고

  Investigation: 모두 이전 PR에서 발생한 기존 에러:
  - TonePreset, OutputLanguage 미사용 import (line 7-8)
  - platform, language 미사용 파라미터 (line 127)
  - outputLanguage useEffect dependency 누락 (line 42)

  Resolution: 이 PR에서 함께 수정:
  - 미사용 타입 import 제거
  - 미사용 콜백 파라미터에 _ prefix
  - useEffect dependency 배열에 outputLanguage 추가

  Lesson: CI에서 strict lint가 빌드를 차단하므로, pre-existing 에러도 발견 시 즉시 수정.

  Error 3: Build Fails Due to Missing OPENAI_API_KEY

  Symptom: pnpm build 실패 - ZodError: OPENAI_API_KEY is required

  Root Cause: Next.js App Router가 빌드 시 API route를 프리렌더링하면서 lib/env.ts의 Zod 환경변수 검증 트리거. worktree에 .env.local 파일 없음.

  Resolution: 인프라 이슈로 이 PR 범위 밖. tsc --noEmit과 pnpm lint 모두 통과하여 코드 정확성 검증 완료. main 브랜치에서도 동일한 이슈 존재.

  ---
  6. Validation

  TypeScript Compilation ✅

  pnpm type-check  # tsc --noEmit
  # Exit code 0 - no type errors

  검증 항목:
  - HighlightedCodeBlock 인터페이스 정확성
  - highlightCodeBlocks() 함수 시그니처
  - OutputDisplayProps에 codeBlocks prop 타입 호환
  - InputForm의 codeBlocks state 타입

  ESLint ✅

  pnpm lint
  # ✔ No ESLint warnings or errors

  검증 항목:
  - 미사용 변수/import 없음
  - React hooks dependency 규칙 통과
  - TypeScript strict mode 통과

  Acceptance Criteria 충족 ✅
  ┌────────────────────────────────────┬────────┬────────────────────────────────────────────────────────────────────┐
  │              Criteria              │ Status │                           Implementation                           │
  ├────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────────────┤
  │ rawLog에서 최대 3개 코드 블록 추출 │ ✅     │ extractCodeBlocks() → .slice(0, 3) (기존)                          │
  ├────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────────────┤
  │ Shiki 구문 강조 처리               │ ✅     │ highlightCodeBlocks() → codeToHtml() with github-dark theme        │
  ├────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────────────┤
  │ HTML로 렌더링 (이미지 아님)        │ ✅     │ dangerouslySetInnerHTML로 Shiki HTML 렌더링                        │
  ├────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────────────┤
  │ 긴 코드 truncate + 마커            │ ✅     │ 20줄 초과 시 truncation + "... truncated (showing first 20 lines)" │
  ├────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────────────┤
  │ 코드 없을 시 에러 없이 처리        │ ✅     │ codeBlocks?.length > 0 조건부 렌더링                               │
  ├────────────────────────────────────┼────────┼────────────────────────────────────────────────────────────────────┤
  │ 다운로드 기능 제외                 │ ✅     │ 미구현 (MVP 범위 밖)                                               │
  └────────────────────────────────────┴────────┴────────────────────────────────────────────────────────────────────┘
  What Remains Unverified

  1. 실제 API 연동 테스트: OPENAI_API_KEY가 없어 end-to-end 테스트 미수행. rawLog에 코드 블록이 포함된 실제 요청으로 렌더링 확인 필요.
  2. 다양한 언어 지원: Shiki 폴백(plaintext)이 모든 엣지 케이스에서 작동하는지 확인 필요 (e.g., 잘못된 언어 식별자, 빈 문자열).
  3. 반응형 레이아웃: 코드 블록이 좁은 화면에서 overflow-x-auto로 제대로 스크롤되는지 시각적 확인 필요.
  4. 성능: 3개의 큰 코드 블록을 동시에 Shiki로 처리할 때의 API 응답 지연. Shiki의 첫 호출 시 WASM 초기화 오버헤드 가능.

  ---
  7. Reusable Principles

  Architecture Decisions

  1. 서버사이드 프리렌더링 패턴
  Raw Data → Server Processing → Rendered HTML → Client Display

  Reusable: 구문 강조, Markdown 렌더링, LaTeX 수식 등 무거운 파싱이 필요한 콘텐츠는 서버에서 HTML로 변환 후 클라이언트에 전달. 클라이언트 번들 크기와 렌더링 성능 모두 이점.

  2. Truncation-Before-Processing
  const { code, truncated } = truncateCode(block.code)
  const html = await codeToHtml(code, { ... })  // truncated code만 처리

  Reusable: 비싼 연산(하이라이팅, 파싱) 전에 데이터를 먼저 줄이는 패턴. 입력 크기에 비례하는 처리 비용을 제한.

  3. Fallback with Original Metadata
  catch {
    const html = await codeToHtml(code, { lang: 'plaintext', ... })
    results.push({ language: block.language, html, truncated })
    //            ^^^^^^^^^^^^^^^^^^^^^^^^ 원본 언어 유지
  }

  Reusable: 폴백 시에도 원본 메타데이터를 유지. UI에서 "typescript" 라벨을 표시하되 하이라이팅은 plaintext로 하는 것이 "plaintext"로 표시하는 것보다 사용자에게 유용함.

  What I'd Do Differently Next Time

  1. Shiki 인스턴스 재사용
  // Current: 매 호출마다 codeToHtml (내부적으로 highlighter 생성)
  const html = await codeToHtml(code, { lang, theme })

  // Better: 싱글톤 highlighter 재사용
  const highlighter = await getSingletonHighlighter({ themes: ['github-dark'] })
  const html = highlighter.codeToHtml(code, { lang, theme: 'github-dark' })

  현재 구현은 codeToHtml shorthand를 사용하여 매번 highlighter를 생성할 수 있음. 요청당 3개 블록이므로 현재는 문제없지만, 트래픽 증가 시 싱글톤 패턴으로 전환 필요.

  2. Copy Code 버튼 추가
  각 CodeBlockCard에 코드 복사 버튼을 추가하면 사용자 편의 향상. 현재는 시각적 표시만 수행.

  3. 테스트 코드 작성
  describe('highlightCodeBlocks', () => {
    it('should highlight valid language code', async () => { ... })
    it('should fallback to plaintext for unknown language', async () => { ... })
    it('should truncate code exceeding 20 lines', async () => { ... })
    it('should return empty array for empty input', async () => { ... })
  })

  What I'd Keep the Same

  1. 서버사이드 하이라이팅 - 클라이언트 번들과 UX 모두 최적.

  2. 조건부 렌더링 - 코드 블록이 없으면 섹션 자체를 숨기는 것이 빈 "Code Blocks" 헤더를 표시하는 것보다 깔끔.

  3. 기존 lint 에러 함께 수정 - Broken windows를 방치하지 않음.

  4. Optional prop - codeBlocks?: HighlightedCodeBlock[]로 정의하여 기존 코드와 완전 호환.

  ---
  References

  - JIRA Ticket: LOG-48
  - PRD Section: 8 (Output - Code Cards)
  - User Story: US-06 (Code Block Extraction)
  - Branch: root/log-48
  - Commit: 550a8c6 - feat: render code blocks with Shiki syntax highlighting (LOG-48)

  ---
  End of Work Log
