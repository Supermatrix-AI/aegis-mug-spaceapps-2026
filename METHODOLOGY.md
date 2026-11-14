# Scientific Methodology & Safeguards

## 1. Deterministic Relevance Ranking Formula

SPECULATRON Intelligence computes a transparent, reproducible **Research Relevance & Evidence Completeness Index** $R \in [0, 100]$ for each `ExperimentRecord` under a selected `ApplicationContext` (`ISS_HABITAT`, `PRESSURIZED_ROVER`, `LUNAR_HABITAT`, `MARTIAN_HABITAT`):

$$R = \left(0.25 + 0.75 \cdot C\right) \times \left(0.30\,S_{\text{env}} + 0.25\,S_{\text{param}} + 0.25\,S_{\text{verif}} + 0.20\,S_{\text{mat}}\right) \times 100$$

### Component Definitions

- **Evidence Completeness ($C \in [0, 1]$):** Fraction of 8 core fields present: `sourceUrl`, `material`, `experimentGeometry`, `citationLocator`, `oxygenPercent`, `airflowVelocity + airflowUnit`, `reportedValue + units`, and `uncertainty`. Missing fields strictly lower $C$.
- **Environment Alignment ($S_{\text{env}} \in [0, 1]$):**
  - For `ISS_HABITAT`: `MICROGRAVITY_ISS` / `MICROGRAVITY_SPACECRAFT` = `1.0`; `MICROGRAVITY_DROP_TOWER` = `0.70`; other = `0.40`.
  - For `LUNAR_HABITAT` (`0.165 g`) & `MARTIAN_HABITAT` (`0.38 g`): exact partial-gravity match = `1.0`; `0 g` microgravity = `0.55` with an explicit extrapolation warning.
  - For `PRESSURIZED_ROVER`: partial gravity = `0.90`; `0 g` microgravity = `0.65` with exploration-atmosphere caveat.
- **Parameter Alignment ($S_{\text{param}} \in [0, 1]$):** Baseline `0.20`, plus `+0.25` for `oxygenPercent`, `+0.25` for `airflowVelocity + airflowUnit`, `+0.20` for `reportedValue + units`, and `+0.10` for `uncertainty`.
- **Verification Weight ($S_{\text{verif}}$):** `HUMAN_VERIFIED` = `1.0`, `SOURCE_MATCHED` = `0.85`, `METADATA_REVIEWED` = `0.60`, `SOURCE_LINK_ONLY` = `0.35`, `CONTRADICTED` = `0.15`.
- **Material/Scope Alignment ($S_{\text{mat}}$):** Solid spacecraft materials / fire protection guidance (`0.80–0.90`), smoke aerosol (`0.85`), liquid/gaseous combustion (`0.60`), unspecified (`0.40`).

**What This Score Is NOT:** $R$ is strictly a research-triage and completeness metric. It is never a fire probability, physical hazard rating, or material safety certification.

## 2. Experiment Comparison Rules

Two to four records may be compared side by side. AegisμG enforces:
1. **Explicit Mismatch Warnings:** Differences in `gravityContext`, `fuelType`, `experimentGeometry`, or `HYPOTHETICAL` origin are surfaced prominently.
2. **Dimension-Checked Unit Normalization:** Only measurements sharing the same physical dimension (e.g., `m/s` and `cm/s` -> `VELOCITY`) can be normalized onto a common chart axis. Incompatible dimensions (`cm/s` vs `°C`) are rejected.
3. **No Fabricated Charts:** If fewer than 2 selected records share a unit-compatible numeric dimension, no chart is drawn and `"No comparable numeric data available."` is displayed with exact field-level explanations.

## 3. Uncertainty & Scientific Limitations

- Bundled catalog entries without parsed PDF tables preserve `null` for unextracted numbers rather than estimating values.
- `0 g` microgravity eliminates buoyancy-driven natural convection; partial-gravity (`0.165 g` lunar, `0.38 g` Martian) reintroduces weak buoyant flow and cannot be validated solely from ISS tests.
- Small-scale MSG duct results (BASS-II) differ from large-scale spacecraft duct tests (Saffire-I) in boundary-layer development, wall heat loss, and oxygen depletion dynamics.


## 4. Digital Twin Sandbox (Exploratory, Unvalidated)

The digital twin contains an evidence replay and a separate zero-dimensional oxygen inventory calculation. Gravity labels do not change calculations. No CFD, radiative transfer, ignition model, flame spread prediction, safety threshold, or validated spacecraft hazard model is implemented. Details: `DIGITAL_TWIN_METHOD.md`.
