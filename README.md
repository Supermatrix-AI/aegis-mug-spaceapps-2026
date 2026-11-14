# AegisμG — Microgravity Fire Safety Intelligence

**Team:** SPECULATRON AI  
**Challenge:** NASA Space Apps Challenge 2026 — *Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data*  
**Challenge URL:** https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/

> **Independent Prototype Disclaimer:** AegisμG is an independent, unofficial open-source research prototype. It is not endorsed by NASA, does not certify spacecraft materials, and must not be used as a fire-safety or flight-qualification authority.

## Purpose

AegisμG turns authentic NASA microgravity combustion citations and user-ingested experimental datasets into a searchable, comparable, evidence-traceable research dashboard without inventing or interpolating missing scientific measurements.

### Core Modules (8 screens)
1. **Mission Overview:** Dynamic KPIs, family coverage chart, parameter availability indicators, and recent provenance activity computed strictly from active records.
2. **NASA Evidence Explorer:** Full-text search and 8-facet filtering across experiment family, investigation, fuel/material, gravity context, oxygen availability, airflow availability, measurement type, and verification status, with expandable provenance details.
3. **Data Import & Validation:** Client-side CSV (PapaParse) and JSON ingestion with column mapping, Zod schema enforcement, duplicate detection, SHA-256 byte-integrity hashing, unit-aware conversions, and strict `SOURCE_LINK_ONLY` flagging on import.
4. **Experiment Comparator:** Side-by-side comparison of 2–4 records with explicit gravity/fuel/geometry mismatch warnings and unit-checked Recharts visualizations (or `"No comparable numeric data available."` when numeric overlap does not exist).
5. **SPECULATRON Intelligence:** Transparent deterministic relevance scoring across ISS, pressurized rover, lunar (`0.165 g`), and Martian (`0.38 g`) contexts, plus optional server-side Gemini (`gemini-4-hydrogen`) grounded synthesis with automatic zero-key deterministic fallback.
6. **DIWA Provenance & Audit:** Inspectable data lineage, extraction methods, SHA-256 hash consistency notes, SSRF-protected NASA domain URL verification, and immutable activity logs.
7. **Digital Twin Sandbox:** Independent NASA measurement replay and hypothetical 0D compartment oxygen-balance model, with an explicit NOT VALIDATED disclaimer, user controls, audit-friendly CSV outputs, and no unsupported gravity scaling.
8. **About, Documentation & Export:** Full methodology, verified bibliography, and provenance-preserving CSV, JSON, and Markdown Evidence Report exports.

## Setup & Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` if running optional server-side Gemini synthesis:

```bash
cp .env.example .env
```

All core application features (search, filtering, CSV/JSON import, unit conversion, comparator, deterministic ranking, provenance logging, and exports) run **without** `GEMINI_API_KEY`.

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

### Automated Validation & Tests

```bash
npm run lint
npm run test
```

## Data Sourcing & Scientific Safeguards

- Official NASA URLs (NTRS, PSI, OCHMO, Space Apps) are cataloged in `SOURCES.md` and `src/data/nasaCatalog.ts`.
- Authentic report-level findings, derived calorimetry/equivalence ratio calculations (`13.1 kJ/g O2`, `<100 W`, `Φ_global = 1.3`), and 7 individual single-condition test runs (`M1`, `M5`, `M9`, `M15`, `M20`, `GMT178-T11`, `GMT175-T9`) from **NASA/TM-20210011385 (BASS-II Summary Report)** are ingested with exact page/section/table locators and `SOURCE_MATCHED` status.
- Unextracted numeric fields remain `null` and render as `"Not reported / Not verified"`.
- Missing values are never converted to `0`.
- Imported or AI-generated records are never auto-promoted to `HUMAN_VERIFIED`.
- Matching SHA-256 hashes prove byte-level file consistency, not scientific accuracy.
- Microgravity (`0 g`) results are never presented as empirical validation for Lunar (`0.165 g`) or Martian (`0.38 g`) partial gravity.

## Deployment

AegisμG builds to a standard Node.js + Vite SPA (`dist/`) served by `server.ts` on `process.env.PORT || 3000`. It can be deployed cleanly to Cloud Run, Render, Railway, or Fly.io with no external database required. Never expose `GEMINI_API_KEY` in client-side `VITE_*` variables.

## Public GitHub Repository

Public source repository: `Supermatrix-AI/aegis-mug-spaceapps-2026` (MIT License for newly authored code). Contains zero private source code or secrets from private repositories.


## Digital Twin Model Boundary

The added **Digital Twin Sandbox** has two deliberately separate features:

1. **Evidence replay:** uses authentic NASA BASS-II Table 5.1 flame-spread rates to illustrate a straight-line distance-versus-time computation. It is not an observed trajectory or flame prediction.
2. **Hypothetical 0D oxygen inventory:** user-specified enclosure volume, flow, oxygen uptake, initial gas composition, and ideal-gas assumptions. The plot is NOT NASA experiment data, CFD, fire spread, certification, or a validated model of lunar/Martian gravity.

See `DIGITAL_TWIN_METHOD.md` for formulas, assumptions, safeguards, tests, and calibration requirements.
