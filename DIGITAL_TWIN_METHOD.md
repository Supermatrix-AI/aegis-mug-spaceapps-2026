# AegisμG Digital Twin Sandbox — Scientific Method and Evidence Boundary

**Status:** Exploratory / NOT validated for spacecraft fire prediction, material qualification, suppression, life safety, or flight decisions.
**Version:** AEGIS_0D_OXYGEN_BALANCE_V1

## 1. What is implemented

**A. Source-measurement replay:** Select a verified NASA/TM-20210011385 BASS-II Table 5.1 single-condition PMMA test (M1, M5, M9, M15, M20). Display the published flame-spread rate and metadata, with a straight-line illustrative transformation:

d_illustrative(t) = v_reported × t.

The displayed distance is NOT a directly observed NASA flame-front trajectory, a validated time-dependent flame spread model, or a prediction. Burn duration may vary, and this illustration does not reproduce transient experimental conditions.

**B. Hypothetical 0D oxygen-inventory calculation:** A perfectly mixed, uniform-temperature and constant-pressure volume exchanges fresh gas at a specified volumetric flow rate Q while oxygen is removed at a USER-ASSUMED, constant mass rate m_dot_O2. Source data does NOT set that rate automatically.

Define:
- V = assumed volume [m³].
- P = assumed absolute pressure [Pa].
- T = assumed gas temperature [K].
- x = gas-phase O2 mole fraction, assumed equivalent to volume fraction.
- x_in = inlet gas O2 mole fraction.
- Q = assumed fresh-gas exchange flow at modeled P,T [m³/s]; do NOT confuse internal recirculation with fresh inlet flow.
- M_O2 = 0.031998 kg/mol.
- n_gas = PV/(RT), using R = 8.31446261815324 J/(mol·K).
- m_dot_O2 = prescribed oxygen uptake [kg/s].

Then:
dx/dt = (Q/V) (x_in − x) − m_dot_O2 / (M_O2 × n_gas).

This linear equation is integrated analytically between equally spaced output times, with a zero-flow limiting case. Oxygen fraction is bounded to [0,1]. If the fixed uptake would drive x below zero, a depletion warning is emitted and downstream curves explicitly cease to be physically defensible as combustion predictions. Because the oxygen sink is prescribed and uncoupled to actual flame physics, do NOT interpret the calculation as fire growth, ignition, or oxygen-extinction prediction.

For transparent calorimetry context ONLY, the tool displays:
assumed HRR_equivalent [W] = (13.1 MJ/kg O2) × m_dot_O2 [kg/s].
The 13.1 kJ/g O2 factor is the Huggett oxygen-consumption calorimetry convention discussed in NASA/TM-20210011385. The model does NOT predict m_dot_O2 from flame spread, chemistry or fuels.

## 2. Gravity labels

The UI allows 0 g, 0.165 g (Moon), 0.38 g (Mars), and 1 g context labels, but **does not numerically adjust any calculations by gravity**. Lunar/Martian combustion behavior cannot be inferred from ISS microgravity records without a separately validated physics model and corresponding data.

## 3. Model omissions

No diffusion flames, pyrolysis, reaction kinetics, buoyancy, heat transfer, smoke transport, radiative exchange, pressure dynamics, oxygen sensor response, toxic exposure, suppression or flame-front dynamics. No spacecraft airflow geometries are solved. No NASA affiliation or certification.

## 4. Software verification & local diagnostics

Ten Digital Twin invariant tests (`src/tests/digitalTwin.test.ts`), complemented by `12` baseline scientific tests (`src/tests/scientific.test.ts`), `9` Table 5.1 atlas tests (`src/tests/bass2Atlas.test.ts`), `5` evidence platform tests (`src/tests/evidencePlatform.test.ts`), and `7` release/briefing validation tests (`src/tests/releaseValidation.test.ts`, **43 total tests across 5 suites**), exercise mathematical invariants: zero sink mass conservation, `durationMinutes === 0` boundary behavior, zero-flow depletion direction, ventilation convergence, input range checks, oxygen floor clamping with `null` mass-balance residual when depleted, exact analytical molar conservation (`massBalanceResidualMol < 1e-6 mol`), fixed-rate calorimetry conversion, gravity label invariance, straight-line replay arithmetic (with NASA Table 5.1 burn-duration extrapolation warning), CSV provenance metadata exports, and ideal-gas molar diagnostics + `0.5× / 1.0× / 2.0×` prescribed-sink sensitivity monotonicity (`computeScenarioDiagnostics`).

Passing tests confirms software arithmetic and basic invariants only. It does **not** validate physical applicability or uncertainty. There is no calibrated model of combustion at 0 g, 0.165 g, or 0.38 g.

## 5. Roadmap to a genuine physics-based digital twin

1. Ingest primary NASA PSI run-level time-series data and calibration metadata.
2. Build per-experiment temporal synchronization and document missingness.
3. Fit model parameters on a training partition of measurements.
4. Validate out of sample against held-out runs (include RMSE/MAE, uncertainty bands, conservation checks and sensitivity analysis).
5. Evaluate reduced-order and CFD models only with vetted geometry, boundary conditions, material properties and computational resources.
6. Publish assumptions, licenses, versioned datasets and independent review results.
7. Avoid safety claims until verified by domain-qualified subject-matter experts.

## 6. Evidence and reproducibility

NASA source of reported spread-rate values: [NASA/TM-20210011385 — BASS-II Summary Report](https://ntrs.nasa.gov/citations/20210011385), Table 5.1, p. 57 (printed).

Files:
- `src/utils/digitalTwin.ts` — pure math, analytical CSTR mass-balance diagnostics, and metadata-stamped CSV generator (`exportOxygenScenarioCsv`).
- `src/components/DigitalTwin.tsx` — user-controlled UI, NASA burn-duration limit guard in Section A, focused vs. full `0–100%` Y-axis toggle in Section B, provenance labels, plots, and CSV export.
- `src/tests/digitalTwin.test.ts` — 10 software-level math, invariance, and CSV export tests.

Any exported hypothetical scenario CSV is marked `NOT-NASA-DATA` in its filename (`aegis-exploratory-oxygen-balance-NOT-NASA-DATA.csv`), embedded `#` metadata header rows (`# model_id`, `# data_origin_NOT_NASA_DATA=NOT-NASA-DATA-HYPOTHETICAL`, `# validation_status`, `# assumptions`, `# params_units`, `# diagnostics`), and per-row columns (`NOT-NASA-DATA-HYPOTHETICAL`).
