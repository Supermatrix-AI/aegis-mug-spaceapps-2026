# NASA Space Apps Challenge 2026 — Final Project Entry Pack

**Prepared:** 15 November 2026 (UAE)  
**Team:** SPECULATRON AI  
**Project:** AegisμG — Microgravity Fire Safety Intelligence  
**Challenge:** Flame in Freefall — SI-Powered Fire Safety Insights from Microgravity Combustion Data  
**Official challenge:** https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/  
**Public source repository:** https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026

> **STATUS:** This is ready-to-paste submission text, **not proof of a submitted project**. The unauthenticated live app URL, public demo link, event/team registration, and submission confirmation still require verification.

## Short description (for project summary field)

**AegisμG** by **SPECULATRON AI** is an evidence-traceable research dashboard that converts NASA's microgravity combustion reports into interactive, searchable comparisons and research briefings. Its BASS-II Atlas captures 20 PMMA tests and 43 airflow segments from NASA/TM-20210011385, Table 5.1, including 39 numeric flame-spread observations and four untracked entries left missing. The platform flags incompatible comparisons, exposes provenance, and separates NASA measurements from an explicitly hypothetical digital-twin sandbox. It supports accountable research triage—not spacecraft material certification or lunar/Martian fire-risk prediction.

## Problem

NASA's microgravity fire experiments are scientifically valuable but dispersed across technical reports and repositories. Different fuel types, geometries, airflow velocities, oxygen environments, and incomplete measurements can make cross-study comparisons misleading. Summarization systems risk inventing missing numbers, obscuring exceptions, or treating ISS microgravity observations as validated lunar or Martian predictions.

## Solution and working application components

AegisμG assembles nine research views:

1. **Mission Overview:** project purpose, measured-data coverage, and a six-step scientific demonstration.
2. **Evidence Explorer:** indexed NASA citations with search, filters, verification status, explicit missingness, and interactive **Evidence Integrity Inspector**.
3. **BASS-II Data Atlas:** NASA Table 5.1 transcription, filters, chart, M3 exception, per-segment **Inspect** drawer, and source-preserving CSV.
4. **Import & Validation:** CSV/JSON schema checks, deduplication, unit-aware handling, and provenance labels.
5. **Experiment Comparator:** comparisons with gravity, geometry, and unit incompatibility warnings.
6. **SPECULATRON Intelligence:** offline deterministic BM25 **Question Explorer** (8 briefings + strict abstention on unsupported claims), **Evidence Gap & Applicability Map** (with CSV/JSON export), deterministic research relevance ranking, and optional server-side Gemini synthesis.
7. **Digital Twin Sandbox:** (a) arithmetic replay of reported NASA flame-spread rates; (b) separately labeled hypothetical zero-dimensional oxygen-inventory model (`NOT NASA DATA · NOT VALIDATED · NOT CERTIFIED · NOT A FIRE-SPREAD PREDICTION`) with sensitivity checks.
8. **DIWA Provenance:** six-stage source-to-recommendation chain, **Scientific Reliability Scorecard**, SSRF-guarded URL checks, and audit history.
9. **Documentation & Export:** bibliography, method statements, and CSV/JSON/Markdown exports.

The core research features—including the offline Question Explorer, Evidence Gap Map, Relevance Ranking, and DIWA Scorecard—work without supplying a Gemini API key; optional generative synthesis is not a prerequisite.

## NASA datasets and exact provenance

**Primary dataset:** NASA/TM-20210011385, *Burning and Suppression of Solids–II (BASS–II) Summary Report*, Table 5.1, printed p. 57.
- Official report: https://ntrs.nasa.gov/citations/20210011385
- Archived & SHA-256 verified via `npm run verify:nasa` (`data/raw/nasa/TM-20210011385.pdf.txt`, digest `56ee5bd7702b5c8235f9934468bb9d6e4ea143c4570d7eaa1da11d904b42ea3f`).
- 20 PMMA tests (M1–M20), 43 within-test velocity segments, 39 numeric reported spread-rate values, 4 explicitly untracked segments in M6 and M12.
- Initial and final oxygen values are **test-level** measurements, not assigned to individual velocity segments.
- M3 reports 0.029 mm/s at 10 cm/s and 0.024 mm/s at 20 cm/s, with overall test-level oxygen changing from 20.8% to 19.7%. It is an observed counterexample to a simplistic monotonic interpretation, **not** an isolated causal experiment or predictive law.
- Derived in-app directional summaries describe **within-test observations**, not independent replication counts or proof of safety.
- Further NASA sources, including PSI investigation DOIs (`10.60555/mbq8-0451` for `PSI-69`, `10.60555/0t15-1z43` for `PSI-98`) and `OCHMO-TB-008`, are cataloged in `NASA_DATA_MANIFEST.md`; unextracted raw PSI measurements are **not** passed off as fully imported data.

More sources: [SOURCES.md](./SOURCES.md), [NASA_DATA_MANIFEST.md](./NASA_DATA_MANIFEST.md), and [METHODOLOGY.md](./METHODOLOGY.md).

## Differentiation and scientific integrity

- **No invented measurements:** unknown values are displayed as missing, not 0; offline Question Explorer returns `"Insufficient verified NASA evidence for this conclusion."` when unsupported.
- **Comparison gates:** incompatible units/conditions and unjustified gravity extrapolations trigger caution.
- **Exception-aware exploration:** the M3 result remains visible even where other comparisons show increasing rates.
- **Evidence lineage:** experimental numbers and interpretive claims point back to original NASA sources via a 6-stage chain.
- **Clear model separation:** Digital Twin Section 2 is hypothetical and labeled `NOT-NASA-DATA` / `NOT VALIDATED`.
- **Offline-compatible path:** deterministic ranking and BM25 Question Explorer provide auditable outputs without hosted AI keys.

## Impact and limitations

This prototype helps researchers, students, and future mission-analysis teams locate, compare, and audit existing NASA combustion evidence, identify missing parameters, and prioritize follow-up experiments. It does **not** certify materials, substitute for engineering fire-safety analysis, model actual flame propagation in a spacecraft, or validate extrapolation from microgravity to 0.165 g lunar or 0.38 g Martian gravity. Laboratory confirmation, calibrated modeling, uncertainty quantification, and additional partial-gravity measurements remain necessary.

## AI use disclosure (review before submission)

Google AI Studio/Gemini and ChatGPT were used as development and research assistants for code, documentation, synthesis, and review. The application offers optional server-side Gemini synthesis alongside offline deterministic BM25 Q&A and completeness-gated ranking. AI-generated text is not itself NASA data; source and verification status are displayed separately. Team members remain responsible for reviewing the final content, licensing, originality, and NASA citations. Do not claim that all model outputs have been independently validated.

## Suggested demo: approximately 30-second spoken narration

> "NASA's microgravity fire evidence is powerful—but scattered and easy to misinterpret. Meet AegisμG by SPECULATRON AI. We organize all 20 NASA BASS-II PMMA tests, preserve 4 missing rates as null, surface the M3 airflow exception, and provide an offline Question Explorer and Gap Map that refuse unverified claims. With a 6-stage DIWA scorecard and a clearly separated hypothetical digital twin, AegisμG delivers accountable fire-safety intelligence."

**Suggested visuals:** 0–7 sec Overview; 7–16 sec BASS-II Atlas & M3 Inspector; 16–23 sec Offline Question Explorer, Gap Map & DIWA Scorecard; 23–30 sec Digital Twin `NOT NASA DATA` disclaimer and closing.

## Official 7-Slide Pitch Deck (Published on GitHub)

- **Verified 7-Slide PDF:** https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026/blob/main/submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf (`HTTP 200`, `7` pages)
- **Interactive HTML Source:** `submission/presentation.html`

## Submission links

- **GitHub:** https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026
- **NASA report:** https://ntrs.nasa.gov/citations/20210011385
- **Live public app (no login):** NOT DEPLOYED — AI Studio Shared URL currently returns `HTTP 404`; publish via AI Studio UI or Render (`render.yaml`) and verify in incognito
- **Public 7-Slide Demo PDF:** https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026/blob/main/submission/AegisMuG-SpaceApps-2026-7-Slide-Demo.pdf
- **Official team Project page:** PENDING OWNER ACTION — opened by the registered Team Owner (copy-paste pack at `submission/FINAL_NASA_PORTAL_COPY_PASTE.md`)

## Critical final checks

- [ ] Review `HACKATHON_DEVELOPMENT_DISCLOSURE.md` and submit the pre-`09:00 UAE` commit timeline clarification to the Abu Dhabi Local Lead / GO Team; confirm the Space Apps *Resources* tab manually while logged in (`ELIGIBILITY RULING PENDING`).
- [ ] Confirm selected local event and attendance eligibility and verify all team members appear under the official team Members tab.
- [ ] Push final local workspace updates (`src/App.tsx` journey bar, `submission/FINAL_NASA_PORTAL_COPY_PASTE.md`, `submission/OWNER_FINAL_FIVE_ACTIONS.md`, and updated Phase 11 docs) to `main` on `Supermatrix-AI/aegis-mug-spaceapps-2026`.
- [ ] Run Google AI Studio **Publish** (or Render `render.yaml`) and test the public live app URL + demo PDF in an incognito browser (`39/39` tests across 5 suites verified locally; see `RELEASE_VERIFICATION_2026-11-15.md`).
- [ ] Paste fields 1–8 from `submission/FINAL_NASA_PORTAL_COPY_PASTE.md` into the official Space Apps Project tab.
- [ ] Save, agree to applicable verification terms after personal review, choose **Submit for Judging**, and verify the platform displays a submitted status **before Sunday 15 November 2026, 23:59 UAE time**.

**Ownership and endorsement:** Independent open-source research prototype of SPECULATRON AI, not an official NASA product, endorsement, or spaceflight safety authority.
