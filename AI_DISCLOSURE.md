# AI Assistance Disclosure

**Project:** AegisμG — Microgravity Fire Safety Intelligence  
**Team:** SPECULATRON AI  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall*

## 1. Engineering & Development AI Contribution

This application codebase, documentation, and automated test suite were authored with AI coding assistance inside Google AI Studio Build using Gemini models (`gemini-4-hydrogen` runtime context / AI Studio Build coding agent) under the strict scientific integrity constraints specified by the project author:
- Zero fabrication of NASA experimental measurements, authors, DOIs, or quotations.
- Explicit preservation of `null` (`"Not reported / Not verified"`) for unextracted measurements.
- Independent open-source implementation containing no copied private source code from private SPECULATRON AI or DIWA repositories.

## 2. Runtime AI Capabilities & Safeguards

AegisμG supports **optional** server-side Gemini integration (`@google/genai`, model `gemini-4-hydrogen`) via `POST /api/intelligence/analyze`:
- **Zero-Key Operation:** All core application workflows (search, filtering, CSV/JSON import, Zod validation, unit conversion, experiment comparison, deterministic SPECULATRON ranking, DIWA provenance auditing, and CSV/JSON/Markdown exports) operate **without** a Gemini API key.
- **Evidence Grounding:** When `GEMINI_API_KEY` is configured on the server, the model receives only sanitized metadata and numeric fields from the active workspace records and is instructed to cite exact `experimentId` and `sourceId` identifiers for every claim.
- **Prompt-Injection Defense:** Untrusted document text is sanitized (`sanitizeForLlmContext`) and framed strictly as JSON data rather than instructions.
- **Explicit Labeling:** Any runtime Gemini output is explicitly labeled **`AI-Assisted Interpretation (Gemini) — Verify Against Primary NASA Sources`**. When Gemini is unavailable, the endpoint automatically falls back to **`Deterministic Non-AI Evidence Summary`**.

## 3. Digital Twin Additions

The exploratory 0D oxygen-balance module (`src/utils/digitalTwin.ts`), unit tests (`src/tests/digitalTwin.test.ts`), and React UI (`src/components/DigitalTwin.tsx`) were authored with AI coding assistance on November 14, 2026 UTC under developer supervision via PR #1 (`feature/aegis-digital-twin-v1`), then reviewed, verified, and reconciled into the main workspace. Its input parameters and calculated time series are hypothetical (`HYPOTHETICAL` / `NOT-NASA-DATA`), never NASA-supplied measurements. Verification of any physical claims remains the responsibility of a qualified researcher. See `DIGITAL_TWIN_METHOD.md`.


## 4. BASS-II Table 5.1 Scientific Upgrade

OpenAI ChatGPT assisted with the manual transcription architecture, evidence-comparison logic, React visualization and tests on November 14, 2026. NASA/TM-20210011385 is the original source. All measurements are source-reported; numeric values and counts require human comparison against the original table before release. AI did not create new NASA experiment measurements, and the analytic directionality check is explicitly descriptive rather than causal.
