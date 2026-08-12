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

  it('앞뒤 공백을 제외한 길이가 500자 이하면 공백 포함 길이가 500자를 넘어도 유효하다', () => {
    const padded = ' '.repeat(50) + 'a'.repeat(MAX_PROMPT_LENGTH) + ' '.repeat(50);
    expect(validatePromptLength(padded)).toBeNull();
  });

  it('500자를 초과할 때 에러 메시지에 trim된 길이를 표시한다', () => {
    const padded = ' '.repeat(30) + 'a'.repeat(MAX_PROMPT_LENGTH + 1) + ' '.repeat(30);
    const result = validatePromptLength(padded);
    expect(result).not.toBeNull();
    expect(result).toContain(`현재 ${MAX_PROMPT_LENGTH + 1}자`);
  });
});
