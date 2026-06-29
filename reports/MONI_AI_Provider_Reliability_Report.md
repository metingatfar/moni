# MONI AI Provider Reliability Report

This report summarizes the design, implementation, and verification of the robust AI Provider priorities and fallback structures in MONI.

## 1. Provider Priority & Cooldown Circuit Breaker
* **Default priority order:** Gemini (Primary) → OpenAI (Secondary, if configured) → Groq (Fallback).
* **Circuit Breaker:** If Groq yields a `429` rate limit error:
  - Groq is marked as rate-limited.
  - A recovery ETA (60 seconds) is stored.
  - Groq calls are completely skipped until the cooldown period expires.
  - Failures trigger an immediate switch to Gemini or OpenAI.

## 2. Guaranteed Local Fallback Response Engine
* **Local Parsing:** If a message matches signature queries (greetings, identity, features, help), the system bypasses API requests and generates immediate, premium quality responses locally.
* **Ultimate Fail-Safe:** If all cloud providers fail, MONI returns a clean offline helper message instead of crashing or returning raw JSON.

## 3. Configuration & Settings
* **Dropdown Option:** A dropdown selector under Settings > AI Providers allows choosing between `Auto`, `Gemini`, `OpenAI`, `Groq`, and `Local Fallback`.
* **State Syncing:** Choices are persisted in local storage and passed dynamically in all chat requests.
