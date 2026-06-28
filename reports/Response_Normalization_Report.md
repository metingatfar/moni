# Response Normalization Report

* **Engine**: ResponseNormalizer
* **Status**: Operational
* **Normalization Logic**:
  - Normalizes heterogeneous raw LLM responses to `UnifiedAIResponse`.
  - Parses JSON content block or extracts content directly as `codeSuggestion`.
  - Attaches performance indicators, cost estimators, and standard metadata.
* **Format**: Standardized `UnifiedAIResponse` interface.
