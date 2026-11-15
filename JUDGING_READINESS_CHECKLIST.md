# NASA Space Apps Challenge 2026 — Judging Readiness Checklist

**Project:** AegisμG — Microgravity Fire Safety Intelligence  
**Team:** SPECULATRON AI  
**Challenge:** *Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data*  
**Deadline:** Sunday, November 15, 2026, 11:59 PM (Registered Event Local Time)  

---

## 1. NASA Space Apps Evaluation Pillars & Mapped Evidence

| Evaluation Pillar | How AegisμG Demonstrates Readiness | Verified Code / Doc Anchor | Status |
|---|---|---|---|
| **Impact** | Helps researchers, mission analysts, and safety teams triage fragmented microgravity fire literature, expose `0 g` vs `0.165 g` / `0.38 g` data gaps, and export audit-ready dossiers without false flight certification. | `MissionOverview.tsx`, `SpeculatronIntelligence.tsx` (`Evidence Gap & Applicability Map`), `AboutAndExport.tsx` | **IMPLEMENTED** |
| **Creativity** | Combines an authentic 20-test / 43-segment Table 5.1 Atlas, an offline zero-key BM25 Question Explorer with strict anti-fabrication abstention, a 6-stage DIWA provenance scorecard, and an explicitly quarantined hypothetical 0D digital twin. | `Bass2Atlas.tsx`, `evidenceEngine.ts`, `EvidenceInspectorCard.tsx`, `DigitalTwin.tsx` | **IMPLEMENTED** |
| **Validity** | Preserves `4` untracked spread rates (`M6`/`M12`) and `43/43` unmeasured segment O2 values as `null`; highlights `M3` (`0.029 -> 0.024 mm/s`); flags equal-rate non-equivalence (`M1` vs `M5`); separates computed claims from NASA sources; stamps Digital Twin plots & CSVs `NOT NASA DATA · NOT VALIDATED`. | `bass2Table51.ts`, `comparator.ts`, `digitalTwin.ts`, `scripts/verify-nasa-sources.mjs`, `43/43` Vitest tests | **VERIFIED & TESTED** |
| **Relevance** | Directly addresses *Flame in Freefall* using `NASA/TM-20210011385` (BASS-II), `PSI-25`, `PSI-69` (FLEX DOI `10.60555/mbq8-0451`), `PSI-98` (Saffire-I DOI `10.60555/0t15-1z43`), and `OCHMO-TB-008`. | `SOURCES.md`, `NASA_DATA_MANIFEST.md`, `nasaCatalog.ts` | **VERIFIED** |
| **Presentation** | 6-step in-app **Guided Scientific Demo** ending in a **Guided Scientific Demo Summary**, published 7-slide PDF (`submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf`), standalone HTML deck (`submission/presentation.html`), and ≤30-second spoken demo script (`submission/README.md`). | `App.tsx`, `submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf` (`HTTP 200`, 7 pages), `submission/README.md` | **VERIFIED** (PDF public on GitHub) |

---

## 2. Scientific & Technical Robustness Checklist

- [x] **No Fabricated NASA Telemetry:** Missing values preserved strictly as `null` (`"Not reported / Not verified"`), never coerced to `0`.
- [x] **Official Artifacts SHA-256 Verified:** `npm run verify:nasa` confirms exact SHA-256 digests for `TM-20210011385.pdf.txt`, `ntrs_20210011385.json`, `datacite_psi69.json`, and `datacite_psi98.json` and validates `20/20` Table 5.1 rows (`M1`–`M20`).
- [x] **Provenance Classification & Traceability Gate:** Every inspected record classifies as `NASA_OBSERVED`, `NASA_REPORTED`, `DERIVED`, `INTERPRETATION`, `HYPOTHETICAL`, or `UNVERIFIED`, flagging `NEEDS_SOURCE_CHECK` if domain/locator/units are missing; computed Evidence Chain claims (`origin: 'AEGIS_COMPUTED'`, `url: null`) never cite NASA URLs as author.
- [x] **Abstention on Out-of-Scope Queries:** Offline BM25 Question Explorer refuses quantitative/extrapolated lunar or Martian predictions, safety certifications, and non-existent missions with `"Insufficient verified NASA evidence for this conclusion."`.
- [x] **Unit, Equal-Value & Gravity Guardrails:** Incompatible unit dimensions refused in `ExperimentComparator.tsx`, equal-rate non-equivalence (`M1` vs `M5` both `0.071 mm/s`) flagged explicitly, and `0 g` data never scaled to `0.165 g` Lunar or `0.38 g` Martian risk.
- [x] **Digital Twin Boundary:** Section B (`AEGIS_0D_OXYGEN_BALANCE_V1`) carries explicit `NOT NASA DATA`, `NOT VALIDATED`, `NOT CERTIFIED`, `NOT A FIRE-SPREAD PREDICTION` labels, conservation residual checks, focused/full Y-axis toggle, burn-duration extrapolation warning in Section A, and metadata-stamped CSV exports.
- [x] **Zero-Key Operation:** Full UI, search, comparator, BM25 Q&A, Gap Map, DIWA Scorecard, and deterministic API fallback run without `GEMINI_API_KEY`.
- [x] **Secret & Security Hygiene:** SSRF allowlist on `/api/sources/verify-url`, formula-injection escaping (`'=+-@\t\r`) across all CSV exports, zero secrets committed.

---

## 3. Official Demo & Competition Eligibility Checklist (Owner Actions & Unknowns)

- [x] **Public 7-Slide Demo PDF Verified:** `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026/blob/main/submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf` (`HTTP 200`, 7 readable slides). **Verify incognito browser access once before submitting.**
- [ ] **GitHub Sync (`OWNER ACTION REQUIRED`):** Push final Demo 1–6 workspace updates (`src/`, `43/43` test suite, updated docs) to `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026` (`main`, currently at `c3f1e66bac`), and check GitHub Actions runner/billing settings if running CI on GitHub.
- [ ] **Pre-09:00 UAE Commit Disclosure (`ELIGIBILITY RULING PENDING`):** Send the draft clarification in `HACKATHON_DEVELOPMENT_DISCLOSURE.md` to your Abu Dhabi Local Lead / Global Organizing Team regarding commits `55bb69b341`, `49386b23d1`, and `5f024bea6d` (`08:06–08:44 UTC+4` on Nov 14).
- [ ] **Challenge Resources Tab Check (`UNKNOWN / OWNER ACTION REQUIRED`):** Log into `spaceappschallenge.org` and inspect the *Resources* tab on *Flame in Freefall* (`HTTP 000` timeout from sandbox).
- [ ] **Live Public Deployment & Incognito Check (`OWNER ACTION REQUIRED`):** Shared AI Studio URL returned `HTTP 404` (`NOT DEPLOYED`). Run AI Studio **Publish** or Render `render.yaml`, then verify `/`, `/api/health`, `/api/catalog`, BASS-II Atlas, Question Explorer, and Digital Twin load cleanly in an incognito browser without login.
- [ ] **Portal Finalization (`NOT CONFIRMED — OWNER ACTION REQUIRED`):** Copy fields 1–8 from `submission/FINAL_NASA_PORTAL_COPY_PASTE.md` into the Space Apps Project page, confirm team Members tab, review terms, and click **Submit for Judging** before **Nov 15, 2026 23:59 UAE time**.
