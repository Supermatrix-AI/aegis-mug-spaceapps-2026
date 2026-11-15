# NASA Data Manifest & Verification Log — AegisμG

**Team:** SPECULATRON AI  
**Verified Timestamp:** 2026-11-15T03:49 UTC  
**Verification Script:** `npm run verify:nasa` (`node scripts/verify-nasa-sources.mjs`)

---

## 1. Local Verified Immutable NASA Artifacts (`data/raw/nasa/`)

| Artifact Path | Official Endpoint / URL | File Size | SHA-256 Digest | Verification Result |
|---|---|---|---|---|
| `data/raw/nasa/TM-20210011385.pdf.txt` | `https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf.txt` | `354,681` bytes | `56ee5bd7702b5c8235f9934468bb9d6e4ea143c4570d7eaa1da11d904b42ea3f` | **VERIFIED** (`20/20` Table 5.1 rows `M1..M20` matched verbatim) |
| `data/raw/nasa/ntrs_20210011385.json` | `https://ntrs.nasa.gov/api/citations/20210011385` | `7,042` bytes | `3fcf1e93014a6c0e210bc77714c5a7f95b0ccbedb7e28390184e051d517ab9e9` | **VERIFIED** (Official NTRS STI record metadata) |
| `data/raw/nasa/datacite_psi69.json` | `https://api.datacite.org/dois/10.60555/mbq8-0451` | `8,850` bytes | `7126988da8fe22fdc2a4d484eb29633705661901522ced822fa728e05f0a83e7` | **VERIFIED** (`PSI-69` FLEX v5, CC0-1.0) |
| `data/raw/nasa/datacite_psi98.json` | `https://api.datacite.org/dois/10.60555/0t15-1z43` | `4,930` bytes | `c70a9e75f6d6387bbec28bf73e59185c59e397d15e6be871067ddcb24daa236c` | **VERIFIED** (`PSI-98` Saffire-I v4, CC0-1.0) |

---

## 2. NASA & Challenge External Reference Verification Status

| Source ID | Title / Investigation | URL / DOI | HTTP Check | Ingestion Status in AegisμG | Honest Scope / Boundary |
|---|---|---|---|---|---|
| `SRC-NTRS-20210011385` | Burning and Suppression of Solids–II (BASS–II) Summary Report (`NASA/TM-20210011385`) | `https://ntrs.nasa.gov/citations/20210011385` | `HTTP 200` | **SOURCE_MATCHED / VERIFIED** | Complete Table 5.1 matrix (`M1..M20`, 43 segments, 39 numeric spread rates, 4 nulls in `M6`/`M12`), Sec. 1.4–1.5 calorimetry (`13.1 kJ/g O2`, `Φ_global=1.3`), and Table 7.1 SIBAL rows ingested. Per-segment O2 and per-run uncertainty omitted in report (`null`). |
| `SRC-PSI-25` | NASA PSI-25: Burning and Suppression of Solids - II (BASS-II) | `https://psi.nasa.gov/physci/repo/data/investigations/PSI-25` | `HTTP 200` (SPA shell) | **METADATA_ONLY** (`METADATA_REVIEWED`) | Angular SPA portal does not expose direct bulk CSV download URLs without interactive browser session. Summary/run tables covered via `TM-20210011385` above. |
| `SRC-PSI-98` | NASA PSI-98: Spacecraft Fire Experiment-I (Saffire-I) | `https://psi.nasa.gov/physci/repo/data/investigations/PSI-98` (`DOI: 10.60555/0t15-1z43`) | `HTTP 200` (SPA + DataCite) | **METADATA_ONLY** (`METADATA_REVIEWED`) | Official DataCite v4 metadata verified; raw Cygnus CSV sensor streams remain `null` until downloaded from PSI portal and imported via UI. |
| `SRC-NASA-PSI-RESEARCH-AREA` (`PSI-69` FLEX) | Flame Extinguishment Experiment (`PSI-69`) | `DOI: 10.60555/mbq8-0451` / `https://psi.nasa.gov/physci/repo/data/investigations/PSI-69` | `HTTP 200` (SPA + DataCite) | **METADATA_ONLY** (`SOURCE_LINK_ONLY`) | Official DataCite v5 metadata verified; droplet K and extinction CSVs not bundled (`reportedValue = null`). |
| `SRC-NASA-PSI-RESEARCH-AREA` (`FLEX-2`, `BASS`, `SAME`, `ACME`) | NASA PSI Combustion Investigations Index | `https://www.nasa.gov/physical-sciences-informatics-psi/psi-investigations-by-research-area/` | Referenced NASA URL | **METADATA_ONLY** (`SOURCE_LINK_ONLY`) | Investigation-level context indexed cleanly; zero numeric values fabricated. |
| `SRC-NASA-OCHMO-TB-008` | NASA Technical Brief OCHMO-TB-008: Fire Protection | `https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-008-fire-protection.pdf` | `HTTP 200` *(Note: `...-microgravity-combustion.pdf` returned HTTP 404)* | **METADATA_ONLY** (`METADATA_REVIEWED`) | Official PDF URL confirmed reachable (`HTTP 200`). Specific quantitative thresholds remain unextracted (`null`) pending structured PDF curation. |
| `SRC-NASA-SPACEAPPS-2026` | NASA Space Apps 2026: *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data* | `https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/` | `000` (timed out from sandbox) | **METADATA_INGESTED** | Official 2026 challenge brief reference; Resources tab status marked **UNVERIFIED** from sandbox. |

---

## 3. Reproducible Verification Command

Run locally to verify all raw artifacts and Table 5.1 row anchors:

```bash
npm run verify:nasa
```
