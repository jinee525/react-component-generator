import { describe, it, expect } from 'vitest';
import { MAX_PROMPT_LENGTH, validatePromptLength } from './promptValidation';

describe('validatePromptLength', () => {
  it('500자 이하면 null(유효)을 반환한다', () => {
    expect(validatePromptLength('a'.repeat(MAX_PROMPT_LENGTH))).toBeNull();
  });

  it('500자를 초과하면 에러 메시지를 반환한다', () => {
    const result = validatePromptLength('a'.repeat(MAX_PROMPT_LENGTH + 1));
    expect(result).not.toBeNull();
    expect(result).toContain(String(MAX_PROMPT_LENGTH));
  });

  it('빈 문자열은 유효하다(길이 제한 위반이 아님)', () => {
    expect(validatePromptLength('')).toBeNull();
  });
});
