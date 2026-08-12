# AGENTS.md (src/)

## Module Context

React 19 프론트엔드. 프롬프트 입력(`PromptInput`) → `useComponentGenerator` 훅이 `/api/generate`를 호출 → 결과 코드를 `LivePreview`(react-live)로 렌더링하거나 `CodeView`로 표시한다. 루트 규칙은 [../AGENTS.md](../AGENTS.md) 참고 (특히 react-live `noInline` 계약).

## Tech Stack & Constraints

- 네트워크/상태 로직은 `hooks/useComponentGenerator.ts`에 모으고, `components/*`는 프레젠테이션 위주로 유지한다(현재 컴포넌트들이 이 패턴을 따르고 있다).
- `LivePreview.tsx`가 렌더링하는 `code`는 AI가 생성한 신뢰할 수 없는 문자열이다 — 이 컴포넌트에 `scope`를 추가하는 등 react-live 설정을 바꿀 때는 루트 Golden Rule #1을 반드시 확인하라.

## Testing Strategy

- `@testing-library/react` + `@testing-library/user-event` + jsdom(`src/test/setup.ts`)을 사용한다.
- `bun run test` 실행 시 `src/**/*.test.{ts,tsx}`가 대상이 된다.

## Local Golden Rules

### 1. 사용자 입력이 트리거하는 로직만 테스트되어 있다 (Test Boundary)
`src/components/PromptInput.test.tsx`만 존재한다 — 빈 입력 시 버튼 비활성화, 입력 후 활성화 및 `onGenerate` 호출, 로딩 중 비활성화 등 "사용자 입력이 무엇을 트리거하는가"를 검증한다. `ComponentCard.tsx`, `CodeView.tsx`, `LivePreview.tsx`, `useComponentGenerator.ts`는 테스트가 없다. 즉 이 프로젝트는 표시/오케스트레이션 컴포넌트보다 입력 검증·상태 전이 로직을 더 위험한 영역으로 보고 있다. 새 입력 검증이나 제출 조건 로직을 추가하면 반드시 테스트를 함께 작성하라.
