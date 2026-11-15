# NASA Space Apps Challenge 2026 — Submission Dossier

- **Project Title:** AegisμG — Microgravity Fire Safety Intelligence
- **Team / Creator:** SPECULATRON AI
- **Challenge Title:** Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data
- **Challenge Link:** https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
- **Live Application URL:** `[PENDING OWNER ACTION — Verify an unauthenticated public deployment URL in incognito before portal submission]`
- **Public GitHub Repository URL:** `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026` `[main at cde52ac7cf; workspace enhancements & submission/presentation.html staged locally — PENDING OWNER ACTION to push]`

## Problem Definition

NASA's microgravity combustion research (BASS, BASS-II, Saffire-I, FLEX, FLEX-2, SAME, ACME, and OCHMO technical briefs) spans decades of ISS, Cygnus, and drop-tower experiments stored across NTRS PDFs and PSI archives. Researchers and mission planners struggle to compare experimental conditions across disparate geometries and units—and generic AI summaries risk hallucinating numbers or falsely equating `0 g` results with `0.165 g` lunar or `0.38 g` Martian fire safety.

## Proposed Solution

AegisμG is an independent, evidence-traceable research dashboard that organizes official NASA combustion citations, validates user-imported PSI/NTRS CSV & JSON datasets with strict Zod schemas, prevents incompatible unit or geometry comparisons, provides an offline BM25 Question Explorer with strict abstention, maps empirical gaps, and maintains a DIWA-inspired provenance and reliability scorecard.

## Technical Innovation

- **Strict Anti-Hallucination & Provenance Inspector:** Missing values remain `null` (`"Not reported / Not verified"`), every record carries an explicit classification (`NASA_OBSERVED` / `NASA_REPORTED` / `DERIVED` / `INTERPRETATION` / `HYPOTHETICAL` / `UNVERIFIED`) with `NEEDS_SOURCE_CHECK` validation, and numeric claims never auto-promote.
- **Evidence Gap & Applicability Map:** Classifies coverage (`OBSERVED`, `SOURCE_METADATA_ONLY`, `NO_MEASUREMENT`, `HYPOTHETICAL_MODEL`) across Material, Geometry, Airflow, Oxygen, and Gravity (`0 g`, `0.165 g`, `0.38 g`) with CSV/JSON exports.
- **Unit-Aware Dimension Gate:** Explicitly converts compatible units (`m/s` ↔ `cm/s`, `°C` ↔ `K`, `atm` ↔ `kPa`) while refusing incompatible physical dimensions.
- **Offline BM25 Question Explorer + Optional Grounded Gemini:** Works 100% without API keys via deterministic BM25 retrieval (with strict `"Insufficient verified NASA evidence for this conclusion."` abstention on lunar/Martian quantitative predictions or safety certifications) and completeness-gated relevance ranking, plus optional server-side `gemini-4-hydrogen` synthesis.
- **DIWA Provenance, Reliability Scorecard & Reproducible Verification:** Computes SHA-256 digests over uploaded bytes and verified NASA NTRS/DataCite artifacts (`npm run verify:nasa`), displays explicit scorecard counts (`MODEL VALIDATION: NOT VALIDATED`), and enforces HTTPS NASA domain allowlisting.

## Scientific Methodology

See `METHODOLOGY.md` for the exact relevance formula $R = (0.25 + 0.75 C)(0.30 S_{\text{env}} + 0.25 S_{\text{param}} + 0.25 S_{\text{verif}} + 0.20 S_{\text{mat}}) \times 100$, compatibility checks, and partial-gravity limitations.

## Project Impact

Helps combustion researchers, mission safety analysts, and student teams rapidly triage NASA microgravity fire literature, identify missing experimental parameters before designing new tests, and export audit-ready evidence dossiers.

## NASA Data Usage

Catalogs `8` official NASA/DataCite/SpaceApps references (`NASA/TM-20210011385` BASS-II Summary Report, `PSI-25`, `PSI-69` FLEX DataCite DOI `10.60555/mbq8-0451`, `PSI-98` Saffire-I DataCite DOI `10.60555/0t15-1z43`, `OCHMO-TB-008`, NASA PSI Combustion Index, and NTRS Portal) with verified SHA-256 digests in `NASA_DATA_MANIFEST.md`. Includes core catalog records (O2-consumption calorimetry `13.1 kJ/g O2`, `< 100 W` typical HRR, `Φ_global = 1.3`, and Table 5.1/7.1 runs) plus the complete **`20`-test / `43`-segment BASS-II Table 5.1 Atlas** (`M1`–`M20`, `39` numeric spread observations, `4` explicit `"Not tracked"` nulls in `M6`/`M12`, and the `M3` counterexample).

## Exploratory Digital Twin Sandbox

AegisμG includes the **Digital Twin Sandbox** featuring a verified NASA Table 5.1 straight-line spread-rate replay alongside a separate zero-dimensional hypothetical oxygen-inventory model (`AEGIS_0D_OXYGEN_BALANCE_V1`) with ideal-gas molar diagnostics, a `0.5× / 1.0× / 2.0×` prescribed-sink sensitivity strip, user-controlled gas composition, ventilation, and constant oxygen-consumption rate. Hypothetical curves and CSV exports (`NOT-NASA-DATA`) are **never labeled as NASA measurements**, and the model is **not validated** for fire growth, suppression, spacecraft design, or partial gravity; see `DIGITAL_TWIN_METHOD.md`.

## Limitations

- While `NASA/TM-20210011385` report findings and Table 5.1/7.1 runs are ingested, full NASA PSI raw video/radiometry telemetry archives (`PSI-25`, `PSI-69`, `PSI-98`) require interactive portal download and researcher CSV/JSON import because NASA PSI renders an Angular SPA without direct bulk public CSV URLs.
- Per-run error bars and per-segment O2 not tabulated in `NASA/TM-20210011385` Table 5.1 remain `null` (`"Not reported / Not verified"`).
- Unofficial independent prototype; does not certify spacecraft materials or predict Lunar/Martian fire risk from `0 g` data.

## Official NASA Space Apps Short Demo (≤ 30 Seconds / ≤ 7 Slides)

### Option A — 30-Second Video Narration Script (~72 words)

> **[0:00–0:08]** "In microgravity, fires burn slower and under-ventilated—and `0 g` never certifies Moon or Mars habitats. Meet **AegisμG** by **SPECULATRON AI**."  
> **[0:08–0:19]** "We organize all 20 NASA BASS-II PMMA tests, preserve 4 missing rates and unmeasured segment oxygen as null, surface the `M3` airflow exception, and run an offline Question Explorer that refuses unverified claims."  
> **[0:19–0:30]** "With our Evidence Gap Map, 6-stage DIWA provenance scorecard, and clearly separated hypothetical Digital Twin, AegisμG delivers accountable NASA fire-safety intelligence."

### Option B — 7-Slide Pitch Deck (`submission/presentation.html`)

1. **Slide 1 — Title & Problem:** AegisμG by SPECULATRON AI · NASA Space Apps 2026 (*Flame in Freefall: SI-Powered Fire Safety Insights*) · Independent unofficial research prototype addressing fragmented NASA data and invalid `0 g` -> partial-g extrapolation.
2. **Slide 2 — Verified NASA Evidence Base:** `NASA/TM-20210011385` (`20` tests, `43` segments, `39` spread observations, `4` nulls, Table 7.1 SIBAL), `PSI-25`, `PSI-69`/`PSI-98` DataCite DOIs, `OCHMO-TB-008`, and `npm run verify:nasa` SHA-256 verification.
3. **Slide 3 — Integrity & Missing-Data Guardrails:** `NASA_OBSERVED` .. `UNVERIFIED` taxonomy, `NEEDS_SOURCE_CHECK` validation, `null` preservation (`"Not reported / Not verified"`), and dimension-checked unit gates.
4. **Slide 4 — BASS-II Table 5.1 Atlas & M3 Counterexample:** Interactive multi-axis explorer with empirical Table 5.1 plot highlighting `12/13` upward directional alignment and `M3` decreasing (`0.029 -> 0.024 mm/s`) alongside O2 depletion.
5. **Slide 5 — Offline BM25 Question Explorer & Evidence Gap Map:** Zero-key grounded Q&A (`Q1–Q8`) with automatic abstention on lunar/Martian predictions or safety certifications, plus `OBSERVED` vs `NO_MEASUREMENT` gap matrix.
6. **Slide 6 — Digital Twin Boundaries (`NOT NASA DATA`):** Strict separation between NASA Table 5.1 linear replay and the unvalidated 0D compartment oxygen balance (`AEGIS_0D_OXYGEN_BALANCE_V1`).
7. **Slide 7 — Reliability Scorecard, Verification & Impact:** 6-stage DIWA provenance scorecard (`MODEL VALIDATION: NOT VALIDATED`), `39/39` passing automated tests across 5 suites, and MIT-licensed open-source release.

### Public Release Verification & Disclosure Note

As of November 15, 2026:
- All local workspace code, tests (`39/39` across 5 suites), NASA artifact verification (`npm run verify:nasa`), and `submission/presentation.html` are verified locally (see `RELEASE_VERIFICATION_2026-11-15.md` and `JUDGING_READINESS_CHECKLIST.md`).
- **Pre-09:00 UAE Commit Disclosure:** Three early commits (`55bb69b341`, `49386b23d1`, `5f024bea6d`) occurred between `08:06` and `08:44 UTC+4` on Nov 14 prior to `09:00 UTC+4` local start; transparently disclosed in `HACKATHON_DEVELOPMENT_DISCLOSURE.md` (**Ruling Pending — contact Local Lead / GO Team**).
- Verify git push, an unauthenticated public deployment URL in incognito, and export/host the 7-slide PDF or <=30s video before clicking **Submit for Judging**.

