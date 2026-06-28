import { executionMetrics } from './ExecutionMetrics';

export class LLMExecutionReport {
  public generateReport(): string {
    const summary = executionMetrics.getSummary();
    const successRates = Object.keys(summary.providerSuccessRates)
      .map(k => `- ${k}: ${summary.providerSuccessRates[k].toFixed(1)}%`)
      .join('\n');

    return `
# LLM Execution Report

## Performance Summary
- Total Executions: ${summary.totalExecutions}
- Average Latency: ${summary.averageLatencyMs.toFixed(1)} ms
- Total Tokens Consumed: ${summary.totalTokensConsumed}
- Total Cost (USD): $${summary.totalCostEstimateUSD.toFixed(6)}

## Provider Success Rates
${successRates || 'None'}
`;
  }
}

export const llmExecutionReport = new LLMExecutionReport();
export default llmExecutionReport;
