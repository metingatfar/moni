# AI Model Selection Report

* **Mechanics**: Governed by `AIModelSelector`.
* **Rules**:
  * Low budget or high privacy ➔ Local Ollama (Llama 3)
  * Heavy reasoning ➔ Claude 3.5 Sonnet
  * General ➔ Gemini 1.5 Pro
* **Factors**: Latency, costs, and privacy constraints.
