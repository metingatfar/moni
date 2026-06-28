import type { RawLLMResponse } from './LLMProvider';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ResponseValidator {
  public validateResponse(response: RawLLMResponse): ValidationResult {
    const errors: string[] = [];

    if (!response.content || response.content.trim() === '') {
      errors.push('Response content is empty.');
    }

    try {
      const parsed = JSON.parse(response.content);
      if (!parsed.code) {
        errors.push('Response JSON is missing mandatory "code" section.');
      }
    } catch (_) {
      errors.push('Response content is not valid JSON.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const responseValidator = new ResponseValidator();
export default responseValidator;
