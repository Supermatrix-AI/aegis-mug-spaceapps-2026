# AegisμG — Interactive Scientific Demo & Judging Walkthrough Guide

**Application:** AegisμG — Microgravity Fire Safety Intelligence (`SPECULATRON AI`)  
**Dashboard Screens:** 9 integrated modules

## 1. One-Click In-App Walkthrough ("Start Scientific Demo")

Click **Start Scientific Demo** in the top-right hero panel of **Mission Overview** to launch the guided 6-step research tour following `QUESTION -> NASA SOURCE -> EXPERIMENT -> MEASUREMENT -> SCIENTIFIC INTERPRETATION -> EVIDENCE GAP -> RESEARCH RECOMMENDATION`:

1. **Step 1 — Evidence Explorer (`explorer`):** Filter by `Verification Status` or search `PSI-98` / `BASS-II`. Show how `EXP-BASS2-M1` carries `NASA_OBSERVED` / `SOURCE_MATCHED` Table 5.1 metrics while unextracted PSI investigations keep `null` (`"Not reported / Not verified"`), and expand the **Evidence Integrity Inspector**.
2. **Step 2 — BASS-II Data Atlas (`evidence-atlas`):** Inspect all 20 tests (`M1`–`M20`, 43 velocity segments, 39 numeric + 4 null rows in `M6`/`M12`). Filter **Sample = M3**, click **Inspect**, and inspect the **M3 Counterexample Card** showing spread rate dropping from `0.029 mm/s` (`10 cm/s`) to `0.024 mm/s` (`20 cm/s`) while initial/final chamber `O2` dropped (`20.8% -> 19.7%`). Click **Download BASS-II Table 5.1 CSV** to verify blank segment `O2` cells.
3. **Step 3 — DIWA Provenance (`provenance`):** Inspect the **DIWA 6-Stage Evidence Assurance Chain**, **Scientific Reliability Scorecard** (`MODEL VALIDATION: NOT VALIDATED`), verified SHA-256 artifact manifest (`npm run verify:nasa`), and test an allowlisted NASA URL vs blocked internal IP (`127.0.0.1`) in the SSRF checker.
4. **Step 4 — Experiment Comparator (`comparator`):** Compare `EXP-BASS2-M1` vs `EXP-BASS2-M5` (`1 mm` vs `3 mm` / `1-sided` vs `2-sided` PMMA). Point out geometry divergence notices and unit-checked Recharts bars.
5. **Step 5 — SPECULATRON Intelligence (`intelligence`):**
   - Run queries in the offline **BM25 Question Explorer** (and click an unsupported Lunar/Mars query to show strict `"Insufficient verified NASA evidence for this conclusion."` abstention).
   - Switch to **Evidence Gap & Applicability Map** to contrast `OBSERVED` PMMA tests against `SOURCE_METADATA_ONLY` PSI investigations and `NO_MEASUREMENT` (`0.165 g` Lunar / `0.38 g` Martian).
   - Click **Export Briefing Report (.md)** or Gap Map CSV/JSON.
6. **Step 6 — Digital Twin Sandbox (`digital-twin`):** Compare Section A (**NASA MEASURED DATA** Table 5.1 linear distance replay) against Section B (**HYPOTHETICAL MODEL OUTPUT · NOT NASA DATA · NOT VALIDATED · NOT CERTIFIED · NOT A FIRE-SPREAD PREDICTION** 0D mass balance), inspect the ideal-gas molar check + `0.5× / 1.0× / 2.0×` sensitivity strip, and export `NOT-NASA-DATA` CSV.

## 2. Offline / Zero-Key Live Demo Guarantee

If presenting in a restricted network environment or without a `GEMINI_API_KEY`:
- All 9 screens, charts, offline BM25 Question Explorer, Evidence Gap Map, CSV/JSON/Markdown exports, deterministic SPECULATRON synthesis, BASS-II Table 5.1 filtering, and the 0D Digital Twin run 100% deterministically.
- `POST /api/intelligence/analyze` returns `DETERMINISTIC_FALLBACK` citing verified `experimentId` and `sourceId` entries.

## 3. Official 7-Slide PDF & ≤ 30-Second Narration Cue

- **Published 7-Slide PDF:** `submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf` (`https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026/blob/main/submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf`).

> **[0:00–0:08]** "Microgravity fires burn slower and under-ventilated—and scattered PDFs make comparing conditions error-prone. Meet **AegisμG** by **SPECULATRON AI**."  
> **[0:08–0:19]** "We preserve authentic NASA BASS-II data—20 PMMA tests, 39 spread rates, explicit nulls for M6 and M12, and the M3 airflow counterexample—while blocking invalid unit or 0 g-to-Mars extrapolations and refusing unsupported queries."  
> **[0:19–0:30]** "With an offline Question Explorer, Evidence Gap Map, DIWA scorecard, and isolated 0D sandbox, AegisμG delivers accountable fire-safety intelligence without hallucinating numbers."
