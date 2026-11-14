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

AegisμG supports **optional** server-side Gemini integration (`@google/genai`, configurable via `GEMINI_MODEL`, defaulting to `gemini-4-hydrogen`) via `POST /api/intelligence/analyze`:
- **Zero-Key Operation:** All core application workflows (search, filtering, BASS-II Table 5.1 Atlas, interactive Scientific Briefings, CSV/JSON import, Zod validation, unit conversion, experiment comparison, deterministic SPECULATRON ranking, DIWA provenance auditing, and CSV/JSON/Markdown exports) operate **without** a Gemini API key.
- **Evidence Grounding:** When `GEMINI_API_KEY` is configured on the server, the model receives only sanitized metadata and numeric fields from the active workspace records, is instructed to cite exact `experimentId` and `sourceId` identifiers for every claim, and the response verifies cited IDs against active workspace records.
- **Prompt-Injection Defense:** Untrusted document text is sanitized (`sanitizeForLlmContext`) and framed strictly as JSON data rather than instructions.
- **Explicit Labeling:** Any runtime Gemini output is explicitly labeled **`AI-Assisted Interpretation (Gemini) — Verify Against Primary NASA Sources`**. When Gemini is unavailable, the endpoint automatically falls back to **`Deterministic Non-AI Evidence Summary`**.

## 3. Digital Twin & Table 5.1 Atlas Additions

The exploratory 0D oxygen-balance module (`src/utils/digitalTwin.ts`), unit tests (`src/tests/digitalTwin.test.ts`), and React UI (`src/components/DigitalTwin.tsx`) were authored with AI coding assistance under developer supervision via PR #1 (`feature/aegis-digital-twin-v1`, already on `main`), and enhanced with conservation/sensitivity diagnostics (`computeScenarioDiagnostics`). Its input parameters and calculated time series are hypothetical (`HYPOTHETICAL` / `NOT-NASA-DATA`), never NASA-supplied measurements.

The **BASS-II Table 5.1 Evidence Atlas** (`src/data/bass2Table51.ts`, `src/utils/bass2Insights.ts`, `src/components/Bass2Atlas.tsx`, and `src/tests/bass2Atlas.test.ts` from PR #2) was transcribed and cross-checked verbatim against official NASA NTRS full text (`NASA/TM-20210011385`, printed p. 57) under developer review (`20/20` tests, `43` segments, `39` numeric spread rates, `4` null `"Not tracked"` rows). Verification of any scientific claims remains the responsibility of a qualified researcher.
