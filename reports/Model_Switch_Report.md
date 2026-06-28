# Model Switch Report

* **Overview**: Automates model switching logic to preserve execution stability.
* **Fallbacks**:
  * Claude -> OpenAI GPT
  * OpenAI GPT -> Google Gemini
  * Google Gemini -> DeepSeek AI
  * Under low token capacity constraints (<10,000 tokens), defaults to Local Ollama model execution.
