# Official NASA Space Apps Challenge 2026 — Portal Copy-Paste Submission Pack

**Team:** SPECULATRON AI  
**Local Event:** Abu Dhabi, United Arab Emirates  
**Deadline:** November 15, 2026, 23:59 UAE time (`UTC+4`)  
**Status:** Ready-to-paste copy — **SUBMISSION NOT CONFIRMED** until the registered Team Owner submits on `spaceappschallenge.org`.

> **Before pasting `FIELD 4` (`Link to Final Project`):** If you complete Google AI Studio **Publish** or Render deployment (`render.yaml`) and confirm the URL opens in an incognito browser without login, paste that verified HTTPS live URL in `FIELD 4` and put the GitHub URL right below it. Otherwise, keep the GitHub repository URL (`https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026`) as `FIELD 4` with the honest deployment note provided below.

---

## FIELD 1 — Project Name

```
AegisμG — Microgravity Fire Safety Intelligence
```

---

## FIELD 2 — High-Level Project Summary

```
AegisμG by SPECULATRON AI is an independent, evidence-traceable NASA microgravity combustion research dashboard built for Flame in Freefall. Grounded in NASA/TM-20210011385 (BASS-II Summary Report, Table 5.1 p. 57) and indexed NASA PSI/OCHMO sources, it organizes 20 cast black PMMA tests across 43 airflow segments, preserves 4 "Not tracked" spread rates and unmeasured per-segment oxygen strictly as null, highlights the non-monotonic M3 airflow exception (0.029 vs 0.024 mm/s), enforces unit/geometry comparison gates, provides a zero-key deterministic BM25 Question Explorer with strict anti-fabrication abstention plus an Evidence Gap Map and Scientific Reliability Scorecard, and quarantines a hypothetical 0D oxygen-balance sandbox explicitly marked NOT NASA DATA and NOT VALIDATED.
```

---

## FIELD 3 — Link to Project Demo

```
https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026/blob/main/submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf
```

*(Verified 7-slide dark-telemetry PDF hosted publicly on GitHub at HTTP 200; complies with NASA Space Apps limit of <= 7 slides.)*

---

## FIELD 4 — Link to Final Project

**Option A — Use this ONLY AFTER verifying your live deployed HTTPS URL works in incognito without Google login:**
```
[PASTE VERIFIED UNAUTHENTICATED LIVE DEPLOYMENT URL HERE]
```

**Option B — Verified public fallback if live cloud hosting is not yet published at submission time:**
```
https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026
```
*(If using Option B, note in Field 5 that the full-stack Vite + React + Express application builds and runs locally via `npm run build && npm start` and includes an unauthenticated Render Blueprint `render.yaml`, while public cloud hosting awaits owner trigger.)*

---

## FIELD 5 — Detailed Project Description

```markdown
### Independent Prototype & Safety Disclaimer
AegisμG is an independent, unofficial open-source research prototype developed by Team SPECULATRON AI for the NASA Space Apps Challenge 2026. It is not endorsed by NASA, does not perform NASA-STD-6001 spacecraft material qualification, and must not be used as an operational fire-safety authority.

### 1. Problem & Scientific Context
Decades of NASA microgravity combustion experiments—including BASS-II (Microgravity Science Glovebox), Saffire-I (Cygnus), FLEX/FLEX-2, SAME, and ACME—are dispersed across long NTRS technical reports and NASA PSI archives with heterogeneous units, fuel geometries, airflow directions, and omitted error bounds. Generic summarization tools risk three critical errors: (1) coercing missing measurements to zero, (2) smoothing away counterexamples in sequential multi-velocity tests, and (3) falsely treating orbital microgravity (0 g) findings as validated fire-safety predictions for Lunar (0.165 g) or Martian (0.38 g) habitats.

### 2. Primary NASA Sources & Verbatim Table 5.1 Ingestion
- **NASA/TM-20210011385 (BASS-II Summary Report):** Archived full report text (`TM-20210011385.pdf.txt`, SHA-256 verified via `npm run verify:nasa`). Ingests report-level calorimetry (`13.1 kJ/g O2`, `< 100 W` typical heat release, `Φ_global = 1.3`), Table 7.1 SIBAL tests, and a line-by-line transcription of **Table 5.1 (printed p. 57)**: **20** flat cast black PMMA tests (`M1`–`M20`) spanning **43** within-test velocity segments (**39** numeric flame-spread rates, **4** NASA-reported `"Not tracked"` entries kept `null` in `M6` & `M12`, and **43/43** per-segment O2 concentrations kept `null` rather than interpolated).
- **Indexed NASA Metadata & Cross-References:** `PSI-25` (BASS-II), `PSI-69` (FLEX, DataCite DOI `10.60555/mbq8-0451`, CC0-1.0), `PSI-98` (Saffire-I, DataCite DOI `10.60555/0t15-1z43`, CC0-1.0), `OCHMO-TB-008` (NASA Fire Protection Technical Brief), NASA PSI Investigation Repository, and NTRS Portal. Unextracted PSI telemetry streams are strictly labeled metadata-only with `null` numeric values.

### 3. Technical Architecture & Nine Research Views
Built with React 19, TypeScript, Tailwind CSS, Zod, PapaParse, Recharts, Vitest, and Express (`server.ts`, running natively on Node 22.23.2 with zero external database and full zero-key operation):
1. **Mission Overview & 6-Step Guided Scientific Demo:** Includes explicit Gravity Regime & Buoyancy Boundary cards (`0 g`, `0.165 g`, `0.38 g`, `1 g`) and walks judges along the chain `QUESTION -> NASA SOURCE -> EXPERIMENT -> MEASUREMENT -> SCIENTIFIC INTERPRETATION -> EVIDENCE GAP -> RESEARCH RECOMMENDATION`, ending in a **Guided Scientific Demo Summary**.
2. **NASA Evidence Explorer:** Full-text search, 9-axis filtering, missingness indicators, and inline **Evidence Integrity Inspector** classifying records (`NASA_OBSERVED`, `NASA_REPORTED`, `DERIVED`, `INTERPRETATION`, `HYPOTHETICAL`, `UNVERIFIED`) with automated `NEEDS_SOURCE_CHECK` validation.
3. **BASS-II Data Atlas:** Interactive 20-test / 43-segment explorer distinguishing independent tests from stepped within-test segments, highlighting `M3` (`0.029 mm/s` at `10 cm/s` dropping to `0.024 mm/s` at `20 cm/s` while test-level O2 dropped `20.8% -> 19.7%`), per-segment `Inspect` drawer, and formula-safe CSV export.
4. **Data Import & Validation:** Client/server Zod CSV & JSON ingestion, unit validation, duplicate checks, SHA-256 file integrity digests, and automatic `SOURCE_LINK_ONLY` locking (never auto-promoted to `HUMAN_VERIFIED`).
5. **Experiment Comparator:** Dimension-checked unit normalization (`cm/s <-> m/s`, `°C <-> K`, `kPa <-> atm`) with explicit gravity, geometry, fuel-phase, and equal-value non-equivalence warnings (e.g., `M1` vs `M5` both `0.071 mm/s`), plus chart refusal when numeric overlap is absent.
6. **SPECULATRON Intelligence:** Offline deterministic BM25 Question Explorer (`Q1`–`Q8` + strict abstention `"Insufficient verified NASA evidence for this conclusion."` on Lunar/Martian quantitative/extrapolated predictions, safety certifications, or non-existent missions), strict separation of `NASA Source` vs `AegisμG Computed` Evidence Chain stages, completeness-gated Research Relevance ranking, **Evidence Gap & Applicability Map** (exportable as CSV/JSON), and optional server-side Gemini synthesis with automatic zero-key fallback.
7. **Digital Twin Sandbox:** Quarantined separation between Section A (arithmetic straight-line rate replay `d = v × t` of reported Table 5.1 rates with burn-duration extrapolation warning) and Section B (`AEGIS_0D_OXYGEN_BALANCE_V1`, a hypothetical well-mixed 0D ideal-gas CSTR calculator with conservation residual diagnostics, focused vs. full `0–100%` Y-axis toggle, and `0.5× / 1.0× / 2.0×` sink sensitivity), explicitly stamped `NOT NASA DATA · NOT VALIDATED · NOT CERTIFIED · NOT A FIRE-SPREAD PREDICTION` in UI and CSV metadata exports.
8. **DIWA Provenance & Scientific Reliability Scorecard:** Interactive 6-stage traceability chain, quantitative scorecard tiles (`MODEL VALIDATION: NOT VALIDATED`), SSRF-protected NASA domain URL verifier, and session audit log.
9. **Documentation & Export:** Methodology, bibliography, AI disclosure, and provenance-preserving CSV, JSON, and Markdown exports.

### 4. Differentiation, Limitations & Future Work
Unlike ungrounded dashboards or unconstrained LLM wrappers, AegisμG refuses to zero-fill missing measurements, keeps stepped Table 5.1 segments separate from independent burn counts, preserves counterexamples like `M3`, and enforces transparent denominators and `NOT VALIDATED` model boundaries.
- **Limitations:** Per-segment O2 and per-run uncertainty intervals omitted from Table 5.1 remain `null`; raw `PSI-25`, `PSI-69`, and `PSI-98` CSV telemetry archives require interactive portal download and researcher upload; orbital `0 g` observations cannot certify `0.165 g` Lunar or `0.38 g` Martian habitats or `~34% O2 / 56.5 kPa` exploration atmospheres.
- **Future Work:** Ingest time-resolved `PSI-25` camera trajectories and gas-analyzer O2/CO/CO2 telemetry with error bounds, cross-link `PSI-98` Saffire-I Cygnus scale streams and `SAME` smoke morphology, and incorporate empirical `0.165 g` / `0.38 g` partial-gravity data before any model calibration.

### 5. Public Repository & Transparency Disclosures
- **GitHub Repository (MIT License):** https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026
- **Demo PDF (7 Slides):** https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026/blob/main/submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf
- **Hackathon Timeline Disclosure:** Documented openly in `HACKATHON_DEVELOPMENT_DISCLOSURE.md` (three initial commits occurred 16–54 min before `09:00 UTC+4` on Nov 14; formal Local Lead / GO Team clarification pending).
```

---

## FIELD 6 — Use of Super Intelligence (AI Disclosure)

```markdown
1. **Deterministic & Offline SI Architecture:** AegisμG implements a zero-key deterministic BM25 Question Explorer, a transparent completeness-weighted Research Relevance index, an Evidence Gap Map, and a 6-stage DIWA provenance validator. These core components operate deterministically without external LLM calls and refuse unsubstantiated queries (`"Insufficient verified NASA evidence for this conclusion."`) when queried on partial-gravity limits, safety certifications, or non-existent experiments.
2. **Optional Runtime Generative AI:** The backend (`POST /api/intelligence/analyze`) supports optional server-side Google Gemini (`@google/genai`, configurable model defaulting to `gemini-4-hydrogen`) restricted strictly to sanitized workspace JSON metadata and required to cite exact `experimentId` and `sourceId` fields. When `GEMINI_API_KEY` is absent, the endpoint returns a `DETERMINISTIC_FALLBACK` summary. Any runtime Gemini output is explicitly labeled `AI-Assisted Interpretation (Gemini) — Verify Against Primary NASA Sources` and is not NASA data or independently validated engineering advice.
3. **Development AI Assistance:** Google AI Studio / Gemini and ChatGPT were used as coding, documentation, and verification assistants under strict human author review. All BASS-II Table 5.1 measurements, DataCite DOIs, automated tests (`npm run test`), and `npm run verify:nasa` SHA-256 artifact checks were independently verified against primary NASA files by the developer.
```

---

## FIELD 7 — NASA Data

```markdown
- **Primary Measured NASA Source (SOURCE_MATCHED / VERIFIED):**
  - *Burning and Suppression of Solids–II (BASS–II) Summary Report*, NASA/TM-20210011385 (E-19939), Oct 2021 — https://ntrs.nasa.gov/citations/20210011385 (archived text `data/raw/nasa/TM-20210011385.pdf.txt`, SHA-256 `56ee5bd7702b5c8235f9934468bb9d6e4ea143c4570d7eaa1da11d904b42ea3f`, NTRS STI metadata `ntrs_20210011385.json`). Table 5.1 (printed p. 57: 20 PMMA tests `M1`–`M20`, 43 segments, 39 numeric rates, 4 `"Not tracked"` nulls), Table 7.1 (p. 96 SIBAL tests), and Sec. 1.4–1.5 calorimetry (`13.1 kJ/g O2`, `< 100 W`, `Φ_global = 1.3`) ingested and cross-checked via `npm run verify:nasa`.
- **Indexed NASA Metadata References (METADATA_ONLY — raw telemetry not bundled):**
  - NASA PSI Investigation `PSI-25` (BASS-II): https://psi.nasa.gov/physci/repo/data/investigations/PSI-25
  - NASA PSI Investigation `PSI-69` (FLEX, Version 5, CC0-1.0): https://psi.nasa.gov/physci/repo/data/investigations/PSI-69 — DataCite DOI `10.60555/mbq8-0451` (`datacite_psi69.json`)
  - NASA PSI Investigation `PSI-98` (Saffire-I, Version 4, CC0-1.0): https://psi.nasa.gov/physci/repo/data/investigations/PSI-98 — DataCite DOI `10.60555/0t15-1z43` (`datacite_psi98.json`)
  - NASA Technical Brief `OCHMO-TB-008`: Fire Protection (Dec 2023): https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-008-fire-protection.pdf
  - NASA PSI Repository & Combustion Research Area Indexes: https://psi.nasa.gov/physci/repo/search?data_source=psi&data_type=investigation and https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/
```

---

## FIELD 8 — Space Agency Partner Data and Other References

```markdown
- **Space Agency Partner Data:** None used. This project relies strictly on public NASA STI (NTRS) and NASA Physical Sciences Informatics (PSI) / DataCite records and makes no claim of integrating ESA, JAXA, CSA, or other partner agency datasets.
- **Open-Source Software & Engineering Stack (MIT-compatible / OSS):** React 19, TypeScript, Vite 8, Tailwind CSS 4, Express, Zod, PapaParse, Recharts, Lucide Icons, Framer Motion (`motion`), Vitest, Node.js 22 (`node:crypto` SHA-256 verification), and optional `@google/genai`.
- **Competition Governance & Reference Method:** DIWA provenance framing inspired by conceptual 6-stage traceability; zero external source code, model weights, or private datasets were copied from other hackathon submissions or private repositories (see `COMPETITIVE_BENCHMARK.md`).
```

---

## FIELD 9 — Eligibility & Originality Disclosure Note (For Team/Notes If Requested)

```markdown
Transparency note recorded in `HACKATHON_DEVELOPMENT_DISCLOSURE.md`: Public git history on `Supermatrix-AI/aegis-mug-spaceapps-2026` preserves three initial commits on Saturday Nov 14, 2026 at 04:06–04:44 UTC (08:06–08:44 UTC+4 UAE, 16–54 minutes prior to 09:00 UAE local hackathon start), followed by full core scientific engineering, Table 5.1 extraction, integrity/BM25/scorecard implementation, testing, and submission documentation during the official Nov 14–15 event window. Commit history has not been rewritten. Formal ruling from the Abu Dhabi Local Lead / Global Organizing Team is marked ELIGIBILITY RULING PENDING.
```
