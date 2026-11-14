# AegisμG — Interactive Scientific Demo & Judging Walkthrough Guide

**Application:** AegisμG — Microgravity Fire Safety Intelligence (`SPECULATRON AI`)  
**Dashboard Screens:** 9 integrated modules

## 1. One-Click In-App Walkthrough ("Start Scientific Demo")

Click **Start Scientific Demo** in the top-right hero panel of **Mission Overview** to launch the guided 6-step research tour:

1. **Step 1 — Evidence Explorer (`explorer`):** Filter by `Verification Status` or search `PSI-98` / `BASS-II`. Show how `EXP-BASS2-M1` carries `SOURCE_MATCHED` Table 5.1 metrics while unextracted PSI investigations keep `null` (`"Not reported / Not verified"`).
2. **Step 2 — Experiment Comparator (`comparator`):** Compare `EXP-BASS2-M1` vs `EXP-BASS2-M5` (`1 mm` vs `5 mm` PMMA). Point out geometry divergence notices and unit-checked Recharts bars.
3. **Step 3 — BASS-II Data Atlas (`evidence-atlas`):** Inspect all 20 tests (`M1`–`M20`, 43 velocity segments, 39 numeric + 4 null rows). Filter **Sample = M3** or inspect the **M3 Counterexample Card** showing spread rate dropping from `0.029 mm/s` (`10 cm/s`) to `0.024 mm/s` (`20 cm/s`) while initial/final chamber `O2` dropped (`20.8% -> 19.7%`). Click **Download BASS-II Table 5.1 CSV** to verify blank segment `O2` cells.
4. **Step 4 — SPECULATRON Intelligence (`intelligence`):**
   - Click through **Q1 (Airflow & M3)**, **Q2 (`0 g` vs `0.165 g` / `0.38 g`)**, and **Q3 (Spacecraft Materials Evidence)** in **AEGIS SCIENTIFIC BRIEFING**.
   - Switch **Target Mission Context** (`ISS Habitat` -> `Lunar Habitat` -> `Martian Habitat`) to inspect the Mission-Relevance Briefing card and see how `0 g` relevance scores are capped/penalized for partial gravity.
   - Click **Export Briefing Report (.md)** for an auditable Markdown brief.
5. **Step 5 — DIWA Provenance (`provenance`):** Inspect the **DIWA 6-Stage Evidence Assurance Chain** (`1. SOURCE -> 2. EXPERIMENT -> 3. MEASUREMENT -> 4. CLAIM -> 5. INTERPRETATION -> 6. RECOMMENDATION`) and test an allowlisted NASA URL vs blocked internal IP (`127.0.0.1`) in the SSRF checker.
6. **Step 6 — Digital Twin Sandbox (`digital-twin`):** Compare Section 1 (**NASA MEASURED DATA** Table 5.1 linear distance replay) against Section 2 (**HYPOTHETICAL MODEL OUTPUT · NOT-NASA-DATA** 0D mass balance), inspect the ideal-gas molar check + `0.5× / 1.0× / 2.0×` sensitivity strip, and export `NOT-NASA-DATA` CSV.

## 2. Offline / Zero-Key Live Demo Guarantee

If presenting in a restricted network environment or without a `GEMINI_API_KEY`:
- All 9 screens, charts, CSV/JSON/Markdown exports, deterministic SPECULATRON synthesis, BASS-II Table 5.1 filtering, and the 0D Digital Twin run 100% deterministically.
- `POST /api/intelligence/analyze` returns `DETERMINISTIC_FALLBACK` citing verified `experimentId` and `sourceId` entries.

## 3. Official ≤ 30-Second Narration Cue

> **[0:00–0:08]** "Microgravity fires burn slower, cooler, and under-ventilated—and scattered PDFs make comparing conditions error-prone. Meet **AegisμG** by **SPECULATRON AI**."  
> **[0:08–0:19]** "We preserve authentic NASA BASS-II data—20 PMMA tests, 39 spread rates, explicit nulls for M6 and M12, and the M3 airflow counterexample—while blocking invalid unit or 0 g-to-Mars extrapolations."  
> **[0:19–0:30]** "With deterministic relevance briefings, DIWA 6-stage provenance, an isolated 0D sandbox, and 34 automated tests, AegisμG delivers trustworthy space fire-safety intelligence without hallucinating numbers."
