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

### 1. 입력 검증과 상태 로직은 분리하여 테스트한다 (Test Boundary)
- **UI 입력 검증**: `src/components/PromptInput.test.tsx` — 빈 입력, 유효성, 로딩 상태에 따른 버튼 활성화 검증
- **비즈니스 로직**: `src/utils/` 안의 순수 함수들은 각각 테스트 파일을 가짐
  - `promptValidation.test.ts`: 프롬프트 길이 검증 (5개 테스트)
  - `componentStorage.test.ts`: localStorage 저장/로드/삭제 (8개 테스트)
- **UI 렌더링**: `ComponentCard.tsx`, `CodeView.tsx`, `LivePreview.tsx`는 테스트 없음 — 표시 로직만 있음
- **상태 관리**: `useComponentGenerator.ts`는 localStorage 동기화 로직을 포함하며, 유틸리티 함수로 분리되어 테스트됨

새 입력 검증, 상태 전이, 데이터 변환 로직을 추가하면 반드시 `src/utils/` 아래 순수 함수로 분리하고 테스트를 함께 작성하라.
