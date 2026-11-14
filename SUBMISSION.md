# NASA Space Apps Challenge 2026 — Submission Dossier

- **Project Title:** AegisμG — Microgravity Fire Safety Intelligence
- **Team / Creator:** SPECULATRON AI
- **Challenge Title:** Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data
- **Challenge Link:** https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
- **Live Application URL:** `[PENDING_PUBLIC_DEPLOYMENT — Shared Cloud Run URL ais-pre-... currently returns HTTP 404; Dev URL requires Google auth; verify unauthenticated URL after publishing]`
- **Public GitHub Repository URL:** `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026` `[main live; PR #1 feature/aegis-digital-twin-v1 reconciled locally — pending user push/merge to main]`

## Problem Definition

NASA's microgravity combustion research (BASS, BASS-II, Saffire-I, FLEX, FLEX-2, SAME, ACME, and OCHMO technical briefs) spans decades of ISS, Cygnus, and drop-tower experiments stored across NTRS PDFs and PSI archives. Researchers and mission planners struggle to compare experimental conditions across disparate geometries and units—and generic AI summaries risk hallucinating numbers or falsely equating `0 g` results with `0.165 g` lunar or `0.38 g` Martian fire safety.

## Proposed Solution

AegisμG is an independent, evidence-traceable research dashboard that organizes official NASA combustion citations, validates user-imported PSI/NTRS CSV & JSON datasets with strict Zod schemas, prevents incompatible unit or geometry comparisons, computes transparent deterministic relevance rankings, and maintains a DIWA-inspired provenance and audit log.

## Technical Innovation

- **Strict Anti-Hallucination Architecture:** Missing values remain `null` (`"Not reported / Not verified"`)—never coerced to zero or fabricated for charts.
- **Unit-Aware Dimension Gate:** Explicitly converts compatible units (`m/s` ↔ `cm/s`, `°C` ↔ `K`, `atm` ↔ `kPa`) while refusing incompatible physical dimensions.
- **Zero-Key Deterministic Engine + Optional Grounded Gemini:** Works 100% offline/no-key via deterministic completeness-gated ranking, with optional server-side `gemini-4-hydrogen` synthesis strictly citing `experimentId`/`sourceId`.
- **DIWA Provenance & SSRF Protection:** Computes SHA-256 digests over uploaded file bytes (explicitly distinguishing file consistency from scientific correctness) and enforces HTTPS NASA domain allowlisting.

## Scientific Methodology

See `METHODOLOGY.md` for the exact relevance formula $R = (0.25 + 0.75 C)(0.30 S_{\text{env}} + 0.25 S_{\text{param}} + 0.25 S_{\text{verif}} + 0.20 S_{\text{mat}}) \times 100$, compatibility checks, and partial-gravity limitations.

## Project Impact

Helps combustion researchers, mission safety analysts, and student teams rapidly triage NASA microgravity fire literature, identify missing experimental parameters before designing new tests, and export audit-ready evidence dossiers.

## NASA Data Usage

Catalogs official NASA references (`NASA/TM-20210011385` BASS-II Summary Report, `PSI-25`, `PSI-98` Saffire-I, `OCHMO-TB-008`, NASA PSI Combustion Index, and NTRS Portal) with clickable citations and retrieval timestamps. Includes verified report-level findings, O2-consumption calorimetry and equivalence-ratio derivations (`13.1 kJ/g O2`, `< 100 W` typical HRR, `Φ_global = 1.3`), and 7 individual single-condition test runs (`Table 5.1` & `Table 7.1`) from `NASA/TM-20210011385`.

## Exploratory Digital Twin Sandbox

AegisμG includes an 8th navigation screen (`Digital Twin Sandbox`) featuring a verified NASA Table 5.1 straight-line spread-rate replay alongside a separate zero-dimensional hypothetical oxygen-inventory model (`AEGIS_0D_OXYGEN_BALANCE_V1`) with user-controlled gas composition, ventilation, and constant oxygen-consumption rate. Hypothetical curves and CSV exports (`NOT-NASA-DATA`) are **never labeled as NASA measurements**, and the model is **not validated** for fire growth, suppression, spacecraft design, or partial gravity; see `DIGITAL_TWIN_METHOD.md`.

## Full NASA BASS-II Evidence Atlas

The BASS-II Table 5.1 Data Atlas adds complete source-matched coverage of **20 PMMA test samples**, **43 reported airflow conditions**, and **39 numeric flame-spread observations** (four velocity conditions have untracked rates). These are observations within 20 tests, not 39 independent flames. Per-segment oxygen measurements and uncertainty bounds are not reported in the table; only test-start/test-end oxygen is shown. A descriptive directional test finds **12 of 13** assessable multi-velocity tests aligned and identifies **M3 as an exception**, avoiding an unjustified universal causal claim. The linked primary NASA report supports every row.

## Limitations

- While `NASA/TM-20210011385` report findings and representative single-condition runs are ingested, full NASA PSI raw video/radiometry telemetry archives (`PSI-25`, `PSI-98`) require interactive portal download and researcher CSV/JSON import because NASA PSI does not expose an unrestricted public API.
- Per-run error bars not tabulated in `NASA/TM-20210011385` Table 5.1/7.1 remain `null` (`"Not reported / Not verified"`).
- Unofficial independent prototype; does not certify spacecraft materials or predict Lunar/Martian fire risk from `0 g` data.

## Official NASA Space Apps Short Demo (≤ 30 Seconds / ≤ 7 Slides)

### Option A — 30-Second Video Narration Script (~70 words)

> **[0:00–0:08]** "In microgravity, fires burn slower, cooler, and under-ventilated—nothing like 1 g. Meet **AegisμG** by **SPECULATRON AI**."  
> **[0:08–0:18]** "We ingest authentic NASA BASS-II findings and test runs with exact citations, flag missing values instead of inventing data, and block invalid unit or gravity comparisons."  
> **[0:18–0:30]** "With deterministic relevance scoring, DIWA provenance audits, and zero-key operation, AegisμG turns NASA combustion records into traceable spacecraft fire-safety intelligence."

### Option B — 7-Slide Pitch Deck Outline

1. **Slide 1 — Title & Challenge:** AegisμG by SPECULATRON AI · NASA Space Apps 2026 (*Flame in Freefall*) · Independent unofficial research prototype.
2. **Slide 2 — The Problem:** NASA combustion data spans NTRS PDFs and PSI archives with mixed units, missing error bars, and risk of invalid `0 g` -> Lunar/Martian extrapolation.
3. **Slide 3 — Authentic NASA Evidence Base:** `NASA/TM-20210011385` (BASS-II calorimetry `13.1 kJ/g O2`, `Φ_global = 1.3`, Table 5.1/7.1 runs), `PSI-25`, `PSI-98` (Saffire-I), and `OCHMO-TB-008`.
4. **Slide 4 — Scientific Guardrails & Import:** Null preservation (`"Not reported / Not verified"`), Zod validation, duplicate checks, and dimension-checked unit conversions.
5. **Slide 5 — Comparator & SPECULATRON Ranking:** Side-by-side compatibility warnings and completeness-gated deterministic ranking (research triage, never fire-risk certification).
6. **Slide 6 — DIWA Provenance & Zero-Key AI:** Source-to-claim audit matrix, SHA-256 consistency hashing, SSRF-safe NASA URL checks, and optional grounded Gemini with deterministic fallback.
7. **Slide 7 — Impact, Tests & Open Release:** 18/18 automated validation tests passing (11 scientific + 7 digital twin invariants), 9 dashboard screens, MIT-licensed public repository (`Supermatrix-AI/aegis-mug-spaceapps-2026`), and full CSV/JSON/Markdown exports.

### Public Release Verification Note

As verified on November 13–14, 2026:
- GitHub `main` holds the Phase 3 codebase, and PR #1 (`feature/aegis-digital-twin-v1`) has been reviewed, verified, and reconciled locally in the workspace (passing `npm run lint`, `npm run test`, and `npm run build`) pending user push/merge on GitHub.
- The Shared Cloud Run URL (`https://ais-pre-vle43tr4bszlmmgual4rke-566753127465.asia-east1.run.app`) currently returns HTTP 404, and the Dev URL requires Google authentication; publish to a public unauthenticated host and verify in an incognito browser before finalizing the NASA Space Apps portal submission.



## Final Demo Upgrade Note

Suggested 30-second message (verify against final live app): “What makes fire behave differently in space? AegisμG brings actual NASA BASS-II measurements into an evidence-first intelligence dashboard. Explore all 20 reported PMMA test samples and 39 measured flow–spread pairs, see missing values instead of invented ones, and inspect an exception to a common trend. SPECULATRON ranks research relevance, DIWA traces the sources, and our clearly hypothetical digital twin illustrates—not certifies—future research questions.”

**Release gate:** Include the Atlas and its new automated tests as passed ONLY after the source branch is merged and tested in AI Studio. Do not claim a final live URL or NASA submission confirmation without verification.
