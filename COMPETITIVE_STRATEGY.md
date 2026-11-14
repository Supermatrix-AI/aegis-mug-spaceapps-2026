# AegisμG — Evidence-First Competitive & Scientific Strategy

**Team:** SPECULATRON AI  
**Challenge:** [2026 Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data](https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/)  
**Release Horizon:** November 14–15, 2026 (Public deployment & official Space Apps submission before November 15, 2026, 11:59 PM local event time).

## 1. Challenge Alignment

The official NASA Space Apps 2026 challenge asks for an *interactive, super intelligence (SI) powered dashboard* that **summarizes, ranks, and interprets** NASA microgravity combustion findings for human space exploration, evaluated across Impact, Creativity, Validity, Relevance, and Presentation.

AegisμG's defensible scientific claim is **research discovery, unit-safe comparison, and evidence triage**—never spacecraft fire-hazard prediction or NASA material certification.

## 2. Core Differentiators

1. **NASA-First Transcription Over Synthetic Datasets:** Full 20-test transcription of `NASA/TM-20210011385` Table 5.1 (`M1`–`M20`) preserving 43 velocity segments and 39 numeric spread observations while explicitly distinguishing `20` independent test samples from `43` sequential velocity conditions.
2. **Explicit Missingness & Counterexample Honesty:** `M6` and `M12` preserve `null` (`"Not tracked"`); segment-level oxygen stays `null` because Table 5.1 tabulates only run-start and run-end `O2`; uncertainty stays `null`; and `M3` (`0.029 mm/s` at `10 cm/s` vs `0.024 mm/s` at `20 cm/s`) is surfaced rather than smoothed over.
3. **Interactive Aegis Scientific Briefing & Guided Demo:** Answers Q1–Q3 exploration questions deterministically with Mission-Relevance Briefings (ISS, Pressurized Rover, Lunar `0.165 g`, Martian `0.38 g`), 1-click Markdown export, and an in-app 6-step **Start Scientific Demo** walkthrough across all 9 dashboard views.
4. **DIWA 6-Stage Evidence Assurance Chain:** Connects `SOURCE -> EXPERIMENT -> MEASUREMENT -> CLAIM -> INTERPRETATION -> RECOMMENDATION` with SHA-256 upload checks and SSRF-protected NASA domain allowlists.
5. **Dual-Mode Intelligence & Digital Twin Separation:** Completeness-gated deterministic ranking and zero-key fallback work alongside optional grounded Gemini synthesis (`server.ts`), while the exploratory 0D oxygen-balance sandbox (`AEGIS_0D_OXYGEN_BALANCE_V1`) plus conservation/sensitivity checks stays strictly separated (`NOT-NASA-DATA`) from NASA measured replay.
6. **Public Reproducibility:** MIT-licensed repository (`Supermatrix-AI/aegis-mug-spaceapps-2026`), schema-enforced CSV/JSON imports/exports, and 34 automated unit/validation tests.

## 3. Public Ecosystem Context

Public Space Apps projects (such as NASA Flame Intelligence, FLARENEXUS, and Fotia) explore microgravity dashboards and data harmonization. Rather than duplicating synthetic demos or making unverified comparative claims, AegisμG competes on **verbatim NASA provenance, limitation-aware reasoning, zero-hallucination nulls, and zero-key production reliability**.

## 4. Critical Research Boundaries (Do Not Overclaim)

- `0 g` ISS/Cygnus findings do **not** validate Lunar (`0.165 g`) or Martian (`0.38 g`) partial-gravity fire safety.
- Deterministic Relevance Index (`R`) scores **research evidence completeness and metadata alignment**, not physical fire probability.
- Digital Twin outputs and `0.5× / 1.0× / 2.0×` sensitivity strips illustrate prescribed 0D oxygen mass balance only and omit CFD, buoyancy, pyrolysis, extinction boundaries, and toxicity transport.
