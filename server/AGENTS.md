# AGENTS.md (server/)

## Module Context

Bun 기반 API 프록시 서버(`Bun.serve`, 포트 3002). 프론트엔드의 `/api/generate` 요청을 받아 Anthropic Claude 또는 Google Gemini를 호출하고, 응답을 react-live가 실행 가능한 코드로 정규화해 반환한다. 루트 규칙은 [../AGENTS.md](../AGENTS.md) 참고.

## Tech Stack & Constraints

- 외부 API 호출은 SDK 없이 `fetch`로 직접 호출한다(`callAnthropic`, `callGoogleModel`) — 새 프로바이더를 추가할 때도 이 패턴을 유지하라.
- `Bun.serve`의 단일 `fetch` 핸들러(`index.ts`)가 라우팅을 겸한다 — 별도 라우터 프레임워크 없음.

## Testing Strategy

- `bun run test` (vitest) 실행 시 `server/**/*.test.ts`가 대상이 된다.
- 테스트는 순수 함수만 대상으로 한다 (아래 Local Golden Rules #3 참고). 네트워크 호출을 모킹해서 `index.ts`를 테스트하려 하지 마라 — 이 프로젝트는 그 경계를 의도적으로 유지하고 있다.

## Local Golden Rules

### 1. 프롬프트 규칙은 코드에서 이중으로 방어된다 (Double Defense)
SYSTEM_PROMPT는 모델에게 "마크다운 코드펜스 없이 응답", "끝에 `render(...)` 호출 포함"을 요구하지만(`index.ts:16,20`), 모델이 이를 지키지 않을 경우를 대비해 `generator.ts`가 코드 레벨로 동일한 제약을 한 번 더 강제한다: `stripCodeFences`(`generator.ts:5-10`)가 코드펜스를 제거하고, `ensureRenderCall`(`generator.ts:16-24`)이 `render()` 호출이 없으면 자동 주입한다. 한쪽(프롬프트 문구 또는 후처리 함수)만 수정하고 다른 쪽을 지우지 마라 — 두 방어선은 서로 다른 실패 모드(모델의 불완전한 준수)를 막기 위해 함께 존재한다.

### 2. Anthropic과 Google 경로는 대칭이 아니다 (Asymmetry)
`callGoogle`(`index.ts:134-136`)은 `GOOGLE_MODELS` 배열(`index.ts:5`)을 `withModelFallback`(`fallback.ts`)으로 감싸 순차 폴백하지만, `callAnthropic`(`index.ts:68-96`)은 모델 하나(`claude-haiku-4-5-20251001`)만 호출하고 폴백이 없다. 이는 현재 의도된 상태이지 누락된 버그가 아니다. Anthropic 쪽에 폴백을 추가하려면 Google과 동일한 패턴(모델 배열 + `withModelFallback`)을 그대로 재사용하라.

### 3. 순수 로직은 `generator.ts`/`fallback.ts`에만 추가한다 (Test Boundary)
`generator.ts`, `fallback.ts`는 각각 전용 테스트 파일(`generator.test.ts`, `fallback.test.ts`)을 가진 순수 함수 모음이다. `fallback.ts:1` 주석이 명시하듯 "부수효과(Bun.serve 등)가 없어 단위 테스트가 가능하다"는 것이 이 분리의 이유다. 반면 `index.ts`(Bun.serve 요청 핸들러)는 테스트 파일이 없다. AI 응답 정규화, 재시도/폴백 전략 등 새 비즈니스 로직은 `index.ts`에 인라인하지 말고 `generator.ts`/`fallback.ts`에 순수 함수로 추가하고 테스트를 함께 작성하라.
