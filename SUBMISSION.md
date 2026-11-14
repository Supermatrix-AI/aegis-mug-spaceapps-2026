# NASA Space Apps Challenge 2026 — Submission Dossier

- **Project Title:** AegisμG — Microgravity Fire Safety Intelligence
- **Team / Creator:** SPECULATRON AI
- **Challenge Title:** Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data
- **Challenge Link:** https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
- **Live Application URL:** `[PENDING_PUBLIC_DEPLOYMENT_URL — currently running in AI Studio dev preview]`
- **Public GitHub Repository URL:** `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026` `[CREATED — awaiting local git push of Phase 2/3 source]`

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
7. **Slide 7 — Impact, Tests & Open Release:** 11/11 automated validation tests passing, MIT-licensed public architecture (`Supermatrix-AI/aegis-mug-spaceapps-2026`), and full CSV/JSON/Markdown exports.

