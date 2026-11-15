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
2. **Evidence Explorer:** indexed NASA citations with search, filters, verification status, and explicit missingness.
3. **BASS-II Data Atlas:** NASA Table 5.1 transcription, filters, chart, M3 exception, and source-preserving CSV.
4. **Import & Validation:** CSV/JSON schema checks, deduplication, unit-aware handling, and provenance labels.
5. **Experiment Comparator:** comparisons with gravity, geometry, and unit incompatibility warnings.
6. **SPECULATRON Intelligence:** deterministic research relevance ranking and source-linked scientific briefings, with optional server-side Gemini synthesis.
7. **Digital Twin Sandbox:** (a) arithmetic replay of reported NASA flame-spread rates; (b) separately labeled hypothetical zero-dimensional oxygen-inventory model with sensitivity checks.
8. **DIWA Provenance:** six-stage source-to-recommendation chain and audit history.
9. **Documentation & Export:** bibliography, method statements, and CSV/JSON/Markdown exports.

The core research features work without supplying a Gemini API key; optional generative synthesis is not a prerequisite.

## NASA datasets and exact provenance

**Primary dataset:** NASA/TM-20210011385, *Burning and Suppression of Solids–II (BASS–II) Summary Report*, Table 5.1, printed p. 57.
- Official report: https://ntrs.nasa.gov/citations/20210011385
- PDF: https://ntrs.nasa.gov/api/citations/20210011385/downloads/TM-20210011385.pdf
- 20 PMMA tests (M1–M20), 43 within-test velocity segments, 39 numeric reported spread-rate values, 4 explicitly untracked segments in M6 and M12.
- Initial and final oxygen values are **test-level** measurements, not assigned to individual velocity segments.
- M3 reports 0.029 mm/s at 10 cm/s and 0.024 mm/s at 20 cm/s, with overall test-level oxygen changing from 20.8% to 19.7%. It is an observed counterexample to a simplistic monotonic interpretation, **not** an isolated causal experiment or predictive law.
- Derived in-app directional summaries describe **within-test observations**, not independent replication counts or proof of safety.
- Further NASA sources, including PSI investigation indexes and fire-protection guidance, are cataloged as references; unextracted raw PSI measurements are **not** passed off as fully imported data.

More sources: [SOURCES.md](./SOURCES.md) and [METHODOLOGY.md](./METHODOLOGY.md).

## Differentiation and scientific integrity

- **No invented measurements:** unknown values are displayed as missing, not 0.
- **Comparison gates:** incompatible units/conditions and unjustified gravity extrapolations trigger caution.
- **Exception-aware exploration:** the M3 result remains visible even where other comparisons show increasing rates.
- **Evidence lineage:** experimental numbers and interpretive claims point back to original NASA sources.
- **Clear model separation:** Digital Twin Section 2 is hypothetical and labeled NOT-NASA-DATA.
- **Offline-compatible path:** deterministic ranking provides an auditable result even without optional hosted AI.

## Impact and limitations

This prototype helps researchers, students, and future mission-analysis teams locate, compare, and audit existing NASA combustion evidence, identify missing parameters, and prioritize follow-up experiments. It does **not** certify materials, substitute for engineering fire-safety analysis, model actual flame propagation in a spacecraft, or validate extrapolation from microgravity to 0.165 g lunar or 0.38 g Martian gravity. Laboratory confirmation, calibrated modeling, uncertainty quantification, and additional partial-gravity measurements remain necessary.

## AI use disclosure (review before submission)

Google AI Studio/Gemini and ChatGPT were used as development and research assistants for code, documentation, synthesis, and review. The application offers optional server-side Gemini synthesis and a deterministic no-key research-briefing mode. AI-generated text is not itself NASA data; source and verification status are displayed separately. Team members remain responsible for reviewing the final content, licensing, originality, and NASA citations. Do not claim that all model outputs have been independently validated.

## Suggested demo: approximately 30-second spoken narration

> "NASA's microgravity fire evidence is powerful—but scattered and easy to misinterpret. Meet AegisμG by SPECULATRON AI. We organize 20 NASA BASS-II tests, show the M3 airflow exception, and preserve four missing measurements instead of inventing values. Our interactive comparisons, source-linked briefings, and separate hypothetical digital twin help researchers explore fire-safety evidence responsibly—without claiming lunar or Martian certification."

**Suggested visuals:** 0–7 sec overview; 7–16 sec Atlas/M3; 16–23 sec DIWA/comparator; 23–30 sec Digital Twin disclaimer and closing.

## Alternative seven-slide demo

1. Project, team, challenge, independent-prototype disclaimer.
2. NASA problem: scattered evidence and unsafe extrapolation.
3. Primary NASA Table 5.1 source and 20/43/39/4 audit.
4. Interactive Atlas: M3 exception and explicit missing values.
5. Comparator and SPECULATRON scientific briefings.
6. DIWA provenance and strictly hypothetical 0D Digital Twin.
7. Research impact, limitations, public code, and how to try the app.

## Submission links

- **GitHub:** https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026
- **NASA report:** https://ntrs.nasa.gov/citations/20210011385
- **Live public app (no login):** PENDING — must test in incognito
- **Public demo video or seven-slide presentation:** PENDING — must verify anyone with link can view
- **Official team Project page:** PENDING — opened by the registered Team Owner

## Critical final checks

- [ ] Confirm selected local event and attendance eligibility; a Universal Event team requires at least 2 registered members according to the 2026 eligibility slide, whereas a Local Event team can have at least 1.
- [ ] Check all members appear under the official team Members tab and challenge is correct.
- [ ] Do not blindly merge PR #2: GitHub currently shows it open/non-mergeable; main already contains the Atlas and guided demo. Review differences first.
- [ ] Run `npm run lint && npm run test && npm run build` on the exact final deployed revision. Release audit states 34/34 local tests, but that is a prior report, not a newly rerun CI result.
- [ ] Test a truly public application and demo in an incognito browser.
- [ ] Add project description, source URLs, code URL, demo, originality / AI disclosures, and requested metadata to the official Space Apps Project tab.
- [ ] Save, agree to applicable verification terms after personal review, choose **Submit for Judging**, and verify the platform displays a submitted status.
- [ ] Finish **before Sunday 15 November 2026, 11:59 PM** in the registered event's applicable timezone; local organizer judging procedures may have earlier cutoffs.

**Ownership and endorsement:** Independent open-source research prototype of SPECULATRON AI, not an official NASA product, endorsement, or spaceflight safety authority.
