// 프롬프트는 최대 500자로 제한 (AI 모델 입력 효율성 및 생성 시간 최적화)
export const MAX_PROMPT_LENGTH = 500;

export function validatePromptLength(prompt: string): string | null {
  const length = prompt.trim().length;
  if (length > MAX_PROMPT_LENGTH) {
    return `프롬프트는 ${MAX_PROMPT_LENGTH}자를 넘을 수 없습니다. (현재 ${length}자)`;
  }
  return null;
}
