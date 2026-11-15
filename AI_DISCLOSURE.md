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
- **Zero-Key Operation:** All core application workflows (search, filtering, BASS-II Table 5.1 Atlas, offline BM25 Question Explorer with abstention, Evidence Gap Map, interactive Scientific Briefings, CSV/JSON import, Zod validation, unit conversion, experiment comparison, deterministic SPECULATRON ranking, DIWA provenance auditing, Scientific Reliability Scorecard, and CSV/JSON/Markdown exports) operate **without** a Gemini API key.
- **Evidence Grounding & Abstention:** The offline Question Explorer strictly abstains (`"Insufficient verified NASA evidence for this conclusion."`) when queried on partial-gravity limits, safety certifications, or non-existent tests. When `GEMINI_API_KEY` is configured on the server, Gemini receives only sanitized metadata and numeric fields from active workspace records, must cite exact `experimentId` and `sourceId` identifiers, and is verified against active records.
- **Prompt-Injection Defense:** Untrusted document text is sanitized (`sanitizeForLlmContext`) and framed strictly as JSON data rather than instructions.
- **Explicit Labeling:** Any runtime Gemini output is explicitly labeled **`AI-Assisted Interpretation (Gemini) — Verify Against Primary NASA Sources`**. When Gemini is unavailable, the endpoint automatically falls back to **`Deterministic Non-AI Evidence Summary`**.

## 3. Digital Twin, Table 5.1 Atlas & Integrity Platform Additions

The exploratory 0D oxygen-balance module (`src/utils/digitalTwin.ts`), unit tests (`src/tests/digitalTwin.test.ts`), and React UI (`src/components/DigitalTwin.tsx`) were authored with AI coding assistance under developer supervision via PR #1 (`feature/aegis-digital-twin-v1`, already on `main`), enhanced with conservation/sensitivity diagnostics (`computeScenarioDiagnostics`) and explicit `NOT NASA DATA · NOT VALIDATED · NOT CERTIFIED · NOT A FIRE-SPREAD PREDICTION` labels. Its input parameters and calculated time series are hypothetical (`HYPOTHETICAL` / `NOT-NASA-DATA`), never NASA-supplied measurements.

The **BASS-II Table 5.1 Evidence Atlas** (`src/data/bass2Table51.ts`, `src/utils/bass2Insights.ts`, `src/components/Bass2Atlas.tsx`, and `src/tests/bass2Atlas.test.ts`) was transcribed and cross-checked verbatim against official NASA NTRS full text (`TM-20210011385.pdf.txt`, SHA-256 `56ee5bd...42ea3f`, printed p. 57) via `npm run verify:nasa` (`20/20` rows, `43` segments, `39` numeric spread rates, `4` null `"Not tracked"` rows).

The Phase 3–6 **Evidence Integrity Engine** (`src/utils/evidenceEngine.ts`, `src/components/EvidenceInspectorCard.tsx`, `src/tests/evidencePlatform.test.ts`) adds deterministic provenance classification, Evidence Gap mapping, offline BM25 Q&A with abstention, and the Scientific Reliability Scorecard across `39` automated tests in `5` suites. Full hackathon commit timeline transparency is documented in `HACKATHON_DEVELOPMENT_DISCLOSURE.md`. Verification of any scientific claims remains the responsibility of a qualified researcher.
