# AGENTS.md

## Operational Commands

- 패키지 매니저: `bun` 고정. `bun.lock`이 존재하며 모든 스크립트가 `bun run`으로 실행된다 — npm/yarn/pnpm 사용 금지.
- 의존성 설치: `bun install`
- 개발 서버 (API + 프론트엔드 동시 실행): `bun run dev` (내부적으로 `concurrently`가 `bun run server`와 `vite`를 함께 띄움)
- API 서버만 실행: `bun run server` (`bun --watch run server/index.ts`, 포트 3002)
- 빌드: `bun run build` (`tsc -b && vite build`)
- 린트: `bun run lint`
- 테스트: `bun run test` (`vitest run`, 1회 실행) / `bun run test:watch` (watch 모드)
- 테스트 대상 경로는 `vite.config.ts`의 `test.include`에 명시: `src/**/*.test.{ts,tsx}`, `server/**/*.test.ts`

## Golden Rules

이 프로젝트 전체(서버 + 프론트엔드)를 가로지르는 규칙만 여기에 둔다. 각 디렉토리 전용 규칙은 [Context Map](#context-map)의 하위 `AGENTS.md`를 참고하라.

### 1. react-live `noInline` 계약을 깨지 마라 (Hard Constraint)
`src/components/LivePreview.tsx:14`에서 `<LiveProvider code={code} noInline>`로 렌더링하며 `scope` prop을 전달하지 않는다. 즉 react-live의 기본 스코프(React 자동 주입)에만 의존한다. 이 계약은 `server/index.ts:7-20`의 SYSTEM_PROMPT에 그대로 반영되어 있다 — "import 금지, React는 이미 전역 스코프에 있다고 가정, 컴포넌트 정의 후 반드시 `render(<X />)` 호출". `LiveProvider`에 `scope`를 새로 추가하거나 `noInline`을 바꾸면 SYSTEM_PROMPT도 함께 갱신해야 하며, 그렇지 않으면 생성된 컴포넌트가 렌더링되지 않는다.

### 2. API 키는 값이 아닌 존재 여부만 클라이언트에 노출한다 (Security Boundary)
API 키는 `.env`에만 저장되며 `.gitignore`에 명시되어 커밋되지 않는다. 서버는 `ENV_KEYS`(`server/index.ts:59-62`)로 이를 읽고, `/api/config` 엔드포인트(`server/index.ts:147-157`)는 `{ anthropic: boolean, google: boolean }` 형태로 **존재 여부(boolean)만** 응답한다. 클라이언트가 직접 입력한 키(`src/App.tsx`의 `apiKey` state, `src/hooks/useComponentGenerator.ts:26`)는 요청 본문에 담겨 서버에서 그 요청 처리에만 쓰인다. 새 엔드포인트나 에러 응답에서 실제 키 값을 응답 본문이나 로그에 노출하지 마라.

## Project Context

프롬프트를 입력하면 Anthropic Claude 또는 Google Gemini가 React 컴포넌트를 생성하고, react-live로 즉시 미리보기를 렌더링하는 로컬 도구다.

Tech Stack: React 19, TypeScript, Vite, Bun (API 프록시 서버), react-live, Vitest, ESLint (typescript-eslint + eslint-plugin-react-hooks/react-refresh)

## Standards & References

- 실행/설정 방법은 `README.md` 참고 (중복 서술 금지).
- 코드 스타일은 `eslint.config.js`가 강제한다: `bun run lint`로 검증.
- 커밋 메시지는 기존 히스토리 스타일(`feat:`, `chore:` 등 한국어 요약)을 따른다.
- **Maintenance Policy**: 코드 변경으로 위 Golden Rules 중 하나라도 사실과 어긋나게 되면(예: `scope` prop 도입, API 키 응답 형식 변경 등), 이 파일과 하위 `AGENTS.md`의 해당 항목을 갱신하도록 제안하라.

## Context Map

- **[백엔드 API 프록시 (server/)](./server/AGENTS.md)** — AI 프로바이더 호출, 폴백 전략, 응답 정규화 로직을 수정할 때.
- **[프론트엔드 UI/상태 관리 (src/)](./src/AGENTS.md)** — React 컴포넌트, 훅, 미리보기 렌더링을 수정할 때.
