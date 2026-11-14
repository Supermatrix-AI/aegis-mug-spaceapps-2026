# Official NASA & Challenge Sources Inventory

**Retrieval Date:** 2026-11-13  
**Policy:** Every URL listed below is an authentic NASA or NASA Space Apps Challenge reference. Where full-text PDF tables or NASA PSI CSV bundles are not retrieved, numeric measurements remain `null` (`"Not reported / Not verified"`). Where full text was retrieved via official NTRS API (`NASA/TM-20210011385`), extracted values carry exact section, equation, page, and table locators.

| Source ID | Title | Program / Report ID | Ingestion State | URL |
| :--- | :--- | :--- | :--- | :--- |
| `SRC-NTRS-20210011385` | Burning and Suppression of Solids–II (BASS–II) Summary Report | NASA/TM-20210011385 (E-19939) · Oct 2021 | `METADATA_INGESTED` + Full-text NTRS `.pdf.txt` extracted (Sec. 1.1–1.6, Table 5.1, Table 7.1) | https://ntrs.nasa.gov/citations/20210011385 |
| `SRC-NASA-SPACEAPPS-2026` | Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data | NASA Space Apps Challenge 2026 | `METADATA_INGESTED` | https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ |
| `SRC-PSI-25` | NASA PSI Investigation PSI-25: Burning and Suppression of Solids - II (BASS-II) | NASA PSI `PSI-25` | `METADATA_INGESTED` (raw CSV archive requires portal download) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-25 |
| `SRC-PSI-98` | NASA PSI Investigation PSI-98: Spacecraft Fire Experiment-I (Saffire-I) | NASA PSI `PSI-98` | `METADATA_INGESTED` (raw CSV archive requires portal download) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-98 |
| `SRC-NASA-OCHMO-TB-008` | NASA Technical Brief OCHMO-TB-008: Fire Protection | `OCHMO-TB-008` (Dec 2023) | `METADATA_INGESTED` | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-008-fire-protection.pdf |
| `SRC-NASA-PSI-SEARCH` | NASA Physical Sciences Informatics (PSI) Investigation Repository | PSI Portal | `REFERENCE_INDEXED` | https://psi.nasa.gov/physci/repo/search?data_source=psi&data_type=investigation |
| `SRC-NASA-PSI-RESEARCH-AREA` | NASA PSI Combustion Investigations by Research Area (BASS, FLEX, FLEX-2, SAME, ACME) | PSI Index | `REFERENCE_INDEXED` | https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/ |
| `SRC-NASA-NTRS-PORTAL` | NASA Technical Reports Server (NTRS) | NASA STI | `REFERENCE_INDEXED` | https://ntrs.nasa.gov/ |

## Authentic NASA/TM-20210011385 Ingestion Summary

- **Authors:** Sandra L. Olson, Paul V. Ferkul, Subrata Bhattacharjee, Fletcher J. Miller, Carlos Fernandez-Pello, Shmuel Link, James S. T'ien, Indrek Wichman.
- **Report-Level Findings & Derived Values (`EXP-BASS-II-NTRS-2021`):**
  - Hardware & Geometry: `7.6 × 7.6 × 17 cm` rectangular flow duct inside `250 L` ISS Microgravity Science Glovebox (MSG) with gaseous N2 dilution modeled via CSTR (`Sec. 1.1–1.3, pp. 3–6`). Unrestricted max duct flow `~55 cm/s`; `~35 cm/s` with 2 restrictors (`Sec. 1.1, p. 3`).
  - O2 Consumption Calorimetry (`DERIVED_CALCULATION`): Huggett's constant `13.1 kJ/g O2` (`Sec. 1.4, p. 8`); most tests released well below `100 W` (max brief concurrent rod `~110 W`; one prolonged `~100 W` opposed thick-slab test damaged front window corner).
  - Global Equivalence Ratio (`DERIVED_CALCULATION`): `Φ_global = 1.3` (fuel rich, under-ventilated) across `19` usable returned postflight samples out of `34` returned (`Sec. 1.5, pp. 10–11, Eq. 1.2–1.4`).
  - Gas Products (`SOURCE_REPORTED` / `DERIVED_CALCULATION`): PMMA O2 depletion vs CO2 matched 6:5 stoichiometry (`Eq. 1.1`); concurrent rods averaged `550 ppm CO / 1% CO2`, opposed thick slabs averaged `370 ppm CO / 1% CO2`, with CO/CO2 ratios above efficient flue gas (`< 0.004`).
- **Individual Single-Condition Test Runs Extracted:**
  - Table 5.1 (`p. 57`, opposed-flow flat PMMA): `M1`, `M5`, `M9`, `M15`, `M20` (preserving `uncertainty: null` since Table 5.1 does not tabulate error bounds). These five `SOURCE_MATCHED` runs also supply the reported spread-rate inputs to Section 1 of the Digital Twin Sandbox (`NASA BASS-II evidence replay`).
  - Table 7.1 (`p. 96`, concurrent-flow flat SIBAL fabric): `GMT178-T11` (sustained burn at `4 cm/s`, `17.1 vol% O2`) and `GMT175-T9` (non-ignition at `10 cm/s`, `16.4 vol% O2`), preserving `reportedValue: null` where spread rates are plotted only in Fig. 7.4 or undefined.
  - Note: All outputs from Section 2 of the Digital Twin Sandbox (`AEGIS_0D_OXYGEN_BALANCE_V1`) are strictly hypothetical user-parameterized calculations marked `NOT-NASA-DATA` and are excluded from NASA source citations.

## Documented Source Discrepancies & Caveats (Preserved Verbatim, Not Altered)

1. **Table 4.2 (p. 48) velocity range ordering anomaly:** For `0.009525 m` black PMMA rods, the original PDF prints `"Flow velocity, m/s: 0.043 to 0.02"` (descending order, unlike `0.0041 to 0.075` and `0.0137 to 0.0164`). Flagged for human review; not auto-corrected.
2. **Table 5.1 (p. 57) omitted uncertainty & multi-step runs:** Per-test error bounds are not reported (`null`); tests `M6` and `M12` report spread rate as `"Not tracked"`, and 15 of 20 M-series tests stepped across multiple velocities in one burn and were excluded from single-condition `EXPERIMENT_RUN` rows.
3. **Table 7.1 (p. 96) footnote `b` & figure-only spread rates:** Tests `GMT45-T1` and `GMT45-T2` carry footnote `b` (*"O2 reading in these two tests might be inaccurate"*); steady spread rates are plotted in Fig. 7.4 (p. 98) rather than tabulated numerically, so `EXP-BASS2-GMT178-T11` preserves `reportedValue: null`.
4. **Section 1.4–1.5 sensor saturation & exclusions (pp. 7–10):** The CSA-CP CO sensor saturated (`> 1,000 ppm`) on the `2.8% CO2` outlier burn, and `15` of `34` returned samples were excluded from the `Φ_global = 1.3` calculation (`8` modified on orbit, `7` too short for O2 depletion).
