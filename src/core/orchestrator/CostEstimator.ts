export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  currency: string;
}

export class CostEstimator {
  public estimateCost(
    providerName: string,
    inputTokens: number,
    outputTokens: number
  ): CostEstimate {
    let ratePerMillionInput = 0;
    let ratePerMillionOutput = 0;

    const lower = providerName.toLowerCase();
    if (lower.includes('claude')) {
      ratePerMillionInput = 3.0; // Claude 3.5 Sonnet pricing example
      ratePerMillionOutput = 15.0;
    } else if (lower.includes('gpt')) {
      ratePerMillionInput = 2.5; // GPT-4o pricing example
      ratePerMillionOutput = 10.0;
    } else if (lower.includes('gemini')) {
      ratePerMillionInput = 0.075; // Gemini 1.5 Flash pricing example
      ratePerMillionOutput = 0.3;
    } else {
      // Local/Free models
      return {
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        currency: 'USD'
      };
    }

    const inputCost = (inputTokens / 1000000) * ratePerMillionInput;
    const outputCost = (outputTokens / 1000000) * ratePerMillionOutput;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      currency: 'USD'
    };
  }
}

export const costEstimator = new CostEstimator();
export default costEstimator;
