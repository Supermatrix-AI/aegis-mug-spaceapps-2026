# AegisμG — Microgravity Fire Safety Intelligence

**Team:** SPECULATRON AI  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*  
**Challenge URL:** https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/

> **Independent Prototype Disclaimer:** AegisμG is an independent, unofficial open-source research prototype. It is not endorsed by NASA, does not certify spacecraft materials, and must not be used as a fire-safety or flight-qualification authority.

## Purpose

AegisμG turns authentic NASA microgravity combustion citations and user-ingested experimental datasets into a searchable, comparable, evidence-traceable research dashboard without inventing or interpolating missing scientific measurements.

### Core Modules (9 Screens)
1. **Mission Overview:** First-screen Problem / Solution / Differentiator / Value summary, 1-click **Start Scientific Demo** walkthrough, dynamic KPIs, family coverage chart, parameter availability indicators, and recent provenance activity computed strictly from active records.
2. **NASA Evidence Explorer:** Full-text search and 9-facet filtering across experiment family, investigation, fuel/material, gravity context, oxygen availability, airflow availability, measurement type, verification status, and evidence level, with expandable **Evidence Integrity Inspector** (`NASA_OBSERVED` / `NASA_REPORTED` / `DERIVED` / `INTERPRETATION` / `HYPOTHETICAL` / `UNVERIFIED`, `NEEDS_SOURCE_CHECK` guardrail, and 6-stage lineage).
3. **BASS-II Data Atlas (`src/components/Bass2Atlas.tsx`):** Full verified transcription of all `20` flat cast black PMMA tests (`M1`–`M20`) from `NASA/TM-20210011385` Table 5.1 (p. 57), spanning `43` velocity segments (`39` numeric spread rates, `4` explicit `"Not tracked"` nulls in `M6`/`M12`, `43/43` unmeasured segment-level `O2` kept blank), 7-axis filtering, per-segment **Inspect** provenance panel, Missingness strip, `M3` counterexample highlighting (`0.029` vs `0.024 mm/s`), and formula-safe CSV export.
4. **Data Import & Validation:** Client-side CSV (PapaParse) and JSON ingestion with column mapping, Zod schema enforcement, duplicate detection, SHA-256 byte-integrity hashing, unit-aware conversions, and strict `SOURCE_LINK_ONLY` flagging on import.
5. **Experiment Comparator:** Side-by-side comparison of 2–4 records with explicit gravity/fuel/geometry mismatch warnings and unit-checked Recharts visualizations (or `"No comparable numeric data available."` when numeric overlap does not exist).
6. **SPECULATRON Intelligence:** Clean 3-tab scientific synthesis workspace featuring:
   - **Question Explorer & Scientific Briefings:** Offline deterministic BM25 Question Explorer (8 preloaded evidence briefings + strict abstention `"Insufficient verified NASA evidence for this conclusion."` on partial-gravity predictions, safety certifications, or non-existent tests), interactive **AEGIS SCIENTIFIC BRIEFING** Q&A, Mission Research Briefings (ISS, Pressurized Rover, Lunar `0.165 g`, Martian `0.38 g`), and optional server-side Gemini synthesis with automatic zero-key deterministic fallback.
   - **Evidence Gap & Applicability Map:** Interactive coverage matrix (`OBSERVED` / `SOURCE_METADATA_ONLY` / `NO_MEASUREMENT` / `HYPOTHETICAL_MODEL`) across Material, Geometry, Airflow, Oxygen, and Gravity regimes, with CSV & JSON exports.
   - **Relevance Ranking & Synthesis:** Transparent completeness-gated relevance ranking.
7. **Digital Twin Sandbox:** Separate NASA Table 5.1 straight-line evidence replay and hypothetical 0D compartment oxygen-balance calculator with ideal-gas conservation & `0.5× / 1.0× / 2.0×` sensitivity checks, explicit `NOT NASA DATA · NOT VALIDATED · NOT CERTIFIED · NOT A FIRE-SPREAD PREDICTION` banners, `NOT-NASA-DATA` CSV export headers/filenames, and zero unsupported gravity scaling.
8. **DIWA Provenance & Audit:** Visual **DIWA 6-Stage Evidence Assurance Chain**, **Scientific Reliability Scorecard** (`MODEL VALIDATION: NOT VALIDATED`, explicit metric counts & denominators), inspectable data lineage, extraction methods, SHA-256 hash consistency notes, SSRF-protected NASA domain URL verification, and immutable activity logs.
9. **About, Documentation & Export:** Full methodology, verified bibliography, and provenance-preserving CSV, JSON, and Markdown Evidence Report exports.

## Setup & Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` if running optional server-side Gemini synthesis:

```bash
cp .env.example .env
```

All core application features (search, filtering, offline BM25 Question Explorer, Evidence Gap Map, CSV/JSON import, unit conversion, comparator, deterministic ranking, provenance logging, and exports) run **without** `GEMINI_API_KEY`.

### Development Server

```bash
npm run dev
```

Runs the Express + Vite full-stack server on `http://localhost:3000`.

### Production Build & Start

```bash
npm run build
npm start
```

### Automated Validation, NASA Verification & Tests

```bash
npm run lint
npm run test
npm run verify:nasa
```

`npm run verify:nasa` deterministically checks SHA-256 digests of the archived official NASA artifacts in `data/raw/nasa/` and cross-checks all `20/20` Table 5.1 PMMA rows (`M1`–`M20`) against `TM-20210011385.pdf.txt`.

## Data Sourcing & Scientific Safeguards

- Official NASA URLs (NTRS, PSI, DataCite DOIs, OCHMO, Space Apps) are cataloged in `SOURCES.md`, `NASA_DATA_MANIFEST.md`, and `src/data/nasaCatalog.ts`.
- Authentic report-level findings, derived calorimetry/equivalence ratio calculations (`13.1 kJ/g O2`, `<100 W`, `Φ_global = 1.3`), and single-condition test runs (`M1`, `M5`, `M9`, `M15`, `M20`, `GMT178-T11`, `GMT175-T9`) are ingested in `nasaCatalog.ts`, complemented by the complete `20`-test / `43`-segment **NASA BASS-II Table 5.1 Atlas** (`M1`–`M20`, `39` numeric spread rates, `4` explicit `null` `"Not tracked"` segments in `M6`/`M12`) in `src/data/bass2Table51.ts`.
- Unextracted numeric fields and per-segment oxygen concentrations (`oxygenAtSegmentVolPercent: null`) remain `null` and render as `"Not reported / Not verified"`.
- Missing values are never converted to `0`.
- Imported or AI-generated records are never auto-promoted to `HUMAN_VERIFIED`.
- Matching SHA-256 hashes prove byte-level file consistency, not scientific accuracy.
- Microgravity (`0 g`) results are never presented as empirical validation for Lunar (`0.165 g`) or Martian (`0.38 g`) partial gravity.

## Deployment

AegisμG builds to a standard Node.js + Vite SPA (`dist/`) served by `server.ts` on `process.env.PORT || 3000`. It can be deployed cleanly to Cloud Run, Render, Railway, or Fly.io with no external database required. Never expose `GEMINI_API_KEY` in client-side `VITE_*` variables.

## Digital Twin Model Boundary

The added **Digital Twin Sandbox** keeps NASA evidence and hypothetical modeling strictly separated:

1. **Evidence replay:** Uses authentic NASA BASS-II Table 5.1 (`NASA/TM-20210011385`) flame-spread rates (`M1`–`M20`) to illustrate a straight-line distance-versus-time computation (`d = v × t`). It is not an observed spatial trajectory or flame prediction.
2. **Hypothetical 0D oxygen inventory:** User-specified enclosure volume, fresh-gas flow, constant oxygen uptake, initial gas composition, and ideal-gas mass balance (`AEGIS_0D_OXYGEN_BALANCE_V1`). The output is **NOT NASA experimental data**, CFD, fire spread, certification, or a validated model of lunar (`0.165 g`) or Martian (`0.38 g`) gravity.

See `DIGITAL_TWIN_METHOD.md` for formulas, assumptions, safeguards, tests, and `ROADMAP.md` for calibration requirements.

## Public GitHub Repository, Submission Deck & Disclosures

- **Repository:** `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026` (MIT License for newly authored code; zero private source code or secrets from private SPECULATRON AI or DIWA repositories).
- **Submission Deck:** Standalone 7-slide HTML pitch deck at `submission/presentation.html` (with narration guide & PDF export steps in `submission/README.md`).
- **Audit & Eligibility Documentation:** See `NASA_DATA_MANIFEST.md`, `HACKATHON_DEVELOPMENT_DISCLOSURE.md`, `COMPETITIVE_BENCHMARK.md`, `JUDGING_READINESS_CHECKLIST.md`, `RELEASE_VERIFICATION_2026-11-15.md`, `FINAL_SPACEAPPS_2026_SUBMISSION_PACK.md`, `METHODOLOGY.md`, and `AI_DISCLOSURE.md`.
