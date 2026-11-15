# NASA Space Apps Challenge 2026 — Submission Dossier

- **Project Title:** AegisμG — Microgravity Fire Safety Intelligence
- **Team / Creator:** SPECULATRON AI
- **Challenge Title:** Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data
- **Challenge Link:** https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
- **Live Application URL:** `[NOT DEPLOYED — Shared Cloud Run URL https://ais-pre-vle43tr4bszlmmgual4rke-566753127465.asia-east1.run.app/ returned HTTP 404 on 2026-11-15; publish via AI Studio UI or Render blueprint (render.yaml) and verify unauthenticated access in incognito]`
- **Public 7-Slide Demo PDF:** https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026/blob/main/submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf (`HTTP 200`, `7` slides)
- **Public GitHub Repository URL:** `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026` `[remote main verified at c3f1e66baceb01a0dddbc494c878f268ae5e5789; final Demo 1–6 audit upgrades in AI Studio workspace pending owner push to main]`

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

### Option B — Published 7-Slide Pitch Deck (`submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf`)

Published on GitHub `main` (`d2118bd377`): <https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026/blob/main/submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf> (7 pages, `14,099` B, `HTTP 200`; static backup also in `submission/presentation.html`).

1. **Slide `01 / 07` — Title & Problem:** `Flame in Freefall` — Microgravity Fire Safety Intelligence (`AegisμG` by `SPECULATRON AI`); 48-hour research prototype preventing invalid `0 g` -> partial-g extrapolation.
2. **Slide `02 / 07` — Verified NASA Evidence Base:** `NASA/TM-20210011385` (`Table 5.1`, p. 57: `20` tests, `43` segments, `39` spread observations, `4` nulls) + Table 7.1 SIBAL + `PSI-25` / `PSI-69` / `PSI-98` + `OCHMO-TB-008`.
3. **Slide `03 / 07` — 9-View Interactive Research Architecture:** Evidence Workspace, Table 5.1 Atlas, Offline Question Explorer (`Q1–Q8`), Evidence Gap Map, 6-Stage DIWA Provenance Scorecard, and Digital Twin Lab.
4. **Slide `04 / 07` — BASS-II Table 5.1 Counterexample (`M3`):** `12/13` upward directional segments align with airflow vs spread; `M3` (`0.029 -> 0.024 mm/s`) decreases alongside concurrent chamber O2 depletion (`20.8% -> 19.7%`).
5. **Slide `05 / 07` — Offline BM25 Grounded Q&A & Abstention:** Zero-API-key research retrieval (`GEMINI_API_KEY` blank returns `DETERMINISTIC_FALLBACK`) with automated abstention on out-of-scope partial-g/safety queries.
6. **Slide `06 / 07` — Digital Twin Strict Isolation (`NOT NASA DATA`):** Clear boundary between NASA Table 5.1 replay and hypothetical `AEGIS_0D_OXYGEN_BALANCE_V1` (`HYPOTHETICAL | NOT VALIDATED | NOT CERTIFIED`).
7. **Slide `07 / 07` — Open Science, Reproducibility & Honest Status:** `43/43` tests verified (`5` suites), `npm run verify:nasa` SHA-256 verification, MIT license, and explicit disclosure that public cloud deployment must be verified independently.

### Public Release Verification & Disclosure Note

As of November 15, 2026 (`19:35 UAE` / `15:35 UTC`):
- Remote GitHub `main` (`c3f1e66baceb01a0dddbc494c878f268ae5e5789`) includes `render.yaml` and the verified public 7-slide PDF (`submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf`). Final workspace Demo 1–6 audit upgrades (`Comparator` non-equivalence check, `DigitalTwin` mass-balance residual & burn-duration warning, computed-claim attribution, Guided Demo Summary, and `43/43` Vitest suite) are verified locally (`RELEASE_VERIFICATION_2026-11-15.md` & `JUDGING_READINESS_CHECKLIST.md`) and await owner push to `main`.
- GitHub Actions Run `43713957382` failed in 3 seconds before runner provisioning (`runner_id: 0`, `steps: []`), matching an infrastructure/quota block rather than a test failure.
- **Pre-09:00 UAE Commit Disclosure:** Three early commits (`55bb69b341`, `49386b23d1`, `5f024bea6d`) occurred between `08:06` and `08:44 UTC+4` on Nov 14 prior to `09:00 UTC+4` local start; transparently disclosed in `HACKATHON_DEVELOPMENT_DISCLOSURE.md` (**ELIGIBILITY RULING PENDING — contact Abu Dhabi Local Lead / GO Team**).
- Publish via AI Studio UI or Render (`render.yaml`), verify an unauthenticated public deployment URL in incognito, paste fields from `submission/FINAL_NASA_PORTAL_COPY_PASTE.md`, and click **Submit for Judging** before **23:59 UAE**.

