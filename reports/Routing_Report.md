# Routing Report

* **Model Routing Rules**:
  - `architecture` or `mimari` requests -> Route to Claude (95% confidence)
  - `bug`, `hata` or `fix` requests -> Route to GPT (90% confidence)
  - context size > 80,000 chars -> Route to Gemini (98% confidence)
  - Default offline/fallback -> Local LLM (70% confidence)
