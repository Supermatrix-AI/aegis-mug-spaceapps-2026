# MASTER CODEX EXECUTION BRIEF — AegisμG 2026 Emergency Upgrade
**Instruction to Codex:** You are acting inside the checkout of `Supermatrix-AI/aegis-mug-spaceapps-2026`. Execute the work in this file autonomously to the extent supported by your tools; edit code and documentation, run checks, preserve user work, and report factual results. The official 2026 Space Apps submission deadline is **Sunday 15 November 2026 at 23:59 local time** for the Team Owner's registered event. Prioritize a safe, visible, reproducible working demo over feature quantity.

**Read first, in order:**
1. `READINESS_AND_COMPETITOR_OSINT_2026-11-15.md`
2. `README.md`, `SUBMISSION.md`, `SOURCES.md`, `METHODOLOGY.md`, `DATA_DICTIONARY.md`, `DIGITAL_TWIN_METHOD.md`, `AI_DISCLOSURE.md`, `RELEASE_AUDIT.md`, `DEMO_GUIDE.md`, `FINAL_SPACEAPPS_2026_SUBMISSION_PACK.md`
3. `package.json`, `.github/workflows/ci.yml`, `server.ts`, `src/App.tsx`, `src/data/*`, `src/utils/*`, `src/tests/*`
4. Current branch and recent commit history, PR #2 status and changed files (only if accessible).
5. The official challenge requirements at https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ and Resources tab if accessible.

## Mission, boundaries and priority

Make **AegisμG — Microgravity Fire Safety Intelligence** by **SPECULATRON AI** a demonstrably usable, scientifically trustworthy evidence explorer for **Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data**. It must **summarize, rank, interpret**, trace back to NASA data, state limitations, and be understandable in a short judging demo.

Critical release order:
**P0** eligibility and operational readiness -> **P1** stronger *actual* research usability -> **P2** larger verified NASA dataset where obtainable -> **P3** polish/presentation and post-hackathon research. When a P0 blocker remains, do not spend substantial work on P2/P3; produce a clear manual-owner action instead.

### Non-negotiable scientific/legal standards

- Preserve NASA-origin measurement, report-level statement, user import, derived arithmetic, deterministic interpretation, optional generative synthesis, and hypothetical model output as **distinct provenance types**. A model output is never a NASA measurement.
- Existing BASS-II source is **NASA/TM-20210011385, Table 5.1, printed p.57**. Preserve **20 PMMA tests, 43 within-test velocity segments, 39 numeric rate observations and 4 untracked nulls**, while verifying against original source whenever possible. `M3`: 10 cm/s -> 0.029 mm/s; 20 cm/s -> 0.024 mm/s. O2 changes across the **test**, not per segment; do not assign initial/final O2 to each segment. Within-test sequential velocities are **not independent samples**; no causal claim or inferential confidence interval from pseudoreplicated segments.
- Flag/report underdetermined claims; never invent a source cell, row, oxygen measurement, spread-rate uncertainty, raw PSI stream, scientific model accuracy or risk prediction.
- NASA microgravity results do not validate `0.165g` lunar or `0.38g` Martian combustion risk. Partial-gravity or fire-propagation predictions **abstain** unless a real, reproducible externally validated physical model and suitable data exist; retain existing 0D compartment calculator as **HYPOTHETICAL / NOT NASA DATA / NOT VALIDATED**, not safety authority.
- Scientific risk rank is not human safety risk. Rename ambiguous badges to `Research relevance`, `Evidence completeness`, `Observed test coverage` or `Research priority` with visible formulas.
- Treat published competitors as **idea references only**, not raw code to appropriate. No copy-paste of competitor code, images, prose, datasets or model parameters without explicit license compatibility, attribution and scientific verification. Prefer primary NASA PSI/NTRS material with version and DOI.
- No NASA endorsement or brand claims, unauthorized NASA logos, fictional telemetry, fake user feedback, fabricated 2026 competition outcomes, inflated test counts or AI outputs disguised as ground truth.
- No hidden network calls, secrets in source or client bundles. Optional Gemini stays server side; zero-key deterministic fallback must work.
- **Historic eligibility:** Our public history shows initial competition project commits at 2026-11-14 04:06, 04:17 and 04:44 UTC (08:06, 08:17, 08:44 UAE), before the official UAE 09:00 start. Official GO guidance says challenge-specific work before the event may lead to disqualification: https://github.com/nasa/spaceapps/discussions/1827 . Do **not** change commit dates, rewrite or falsify history, delete relevant evidence, or declare eligibility guaranteed. Create an accurate `HACKATHON_DEVELOPMENT_DISCLOSURE.md` with exact facts, a concise proposed question to Local Lead/GO Team about the pre-9am commits, a table separating prior code from actual in-event work, and `ruling pending` unless official confirmation is produced.
- Official GO guidance also says at least **one NASA data/resource from the specific challenge's Resources list** is necessary for Global Judging. If no access to that list, record `UNVERIFIED` rather than assume BASS-II qualifies; show Team Owner how to check.
- NASA project page submission and terms declarations require the user/Team Owner. Never assert official submission succeeded without platform confirmation.

## Workstream 0: diagnose and stabilize the **current** release

A. Inspect `git status`, main/working branch, modified files, PR #2, and history. Start a fresh non-destructive feature branch such as `feature/aegis-release-evidence-upgrade-20261115` from the working HEAD when appropriate; do not reset work or merge PR #2 blindly, since main has newer changes. Preserve uncommitted work. If the feature branch exists choose another stable suffix; do not force-push.
B. Run all available checks on the exact checkout:
```sh
npm install --no-audit --no-fund
npm run lint
npm run test
npm run build
```
Capture the exact outputs, versions and exit codes in `RELEASE_VERIFICATION_2026-11-15.md`. Fix code/test/build failures with the smallest reliable patch, and rerun. Do not change assertions merely to make tests green. If missing network dependencies, record BLOCKED, not PASS.
C. Test both development startup and production execution on a supported Node version: `npm run dev`; `npm start`. In production, ensure `GET /api/health`, `GET /api/catalog`, static `/`, route fallback, and simple import/analysis endpoints serve correctly. Check that `npm start` works for actual Node runtime `server.ts` (native type stripping may be version-sensitive); if not, fix launch safely (e.g. runtime `tsx` or compiled server) and document production environment.
D. Inspect current remote Actions results if available: run 43669448020 has a failed validate job with **zero steps** in ~2 seconds. Never call this a failing test suite. Inspect runner logs and account settings; record scheduling/quota/permissions as suspected unless actual error verified. Keep CI configuration accurate, and add a reproducible local offline verification guide.
E. Inspect deployment config: no public app URL has been verified. Provide minimal, secure publish steps for Google AI Studio / Cloud Run or another host already in use; do NOT expose API keys. If authentication and permission exist, use a deployment preview only with user-authorized credentials and clearly record host/cost. A verified no-login HTTPS URL is a **human/host approval gate**; don't invent it.
F. Verify README and submission fields against current main. Remove stale text implying PR #2 still must be integrated if main already contains Atlas and guided demo; describe PR #2 as superseded/open and non-mergeable, after actually comparing file diffs. Normalize official challenge title to `SI-Powered` while preserving source quotation where appropriate.

## Workstream 1: scientific power-ups with real, auditable data (build only if P0 stable)

### Feature 1 — Evidence Integrity Inspector
Implement an obvious `Inspect evidence` affordance on current Atlas and/or Explorer record details, reusing existing components where possible:
- Show `sourceId`, NASA URL, document ID / DOI, experimental family, test identifier, unit, reported field, verification status, methodology, original raw text/CSV header/row/column **only if actually held**, and `not available` otherwise.
- For BASS-II Table 5.1 transcriptions, the legitimate locator is printed p.57, Table 5.1, test ID / field. Do not invent Excel-like row/column IDs for PDFs.
- A copyable deep link to NASA primary source (opens new tab with safe `rel`).
- Classify `NASA_REPORTED`, `NASA_OBSERVED`, `DERIVED`, `INTERPRETATION`, `HYPOTHETICAL`, `UNVERIFIED`, and show `NEEDS_SOURCE_CHECK` if a claim is not backed by a value locator.
- Add tests: all displayed raw numeric values correspond to cited local records; `null` stays null; unsupported citation stays unavailable.

### Feature 2 — Evidence Gap & Applicability Map
Create a data-derived **coverage explorer**, not a false predictive risk heatmap:
- Choose experiment family, material, geometry; group measured BASS-II Table 5.1 segments into *source-observed* airflow bins and show only actually measured oxygen at valid test-level granularity.
- Clear legend: `OBSERVED` / `SOURCE-METADATA-ONLY` / `NO MEASUREMENT` / `HYPOTHETICAL MODEL`. Grey unmeasured cells, NO numerical predictions outside observed envelope.
- Show "what we know", "what we do not know", "which additional experiment would reduce uncertainty", each linked to a source or explicitly marked as research suggestion.
- Make source-vs-derivation separation visible in title, chart axes, tooltip, export, and screenshot. Preserve correct units.

### Feature 3 — Offline NASA Question Explorer
Add a simple transparent **keyword/BM25-like search** of already verified NASA records, claims and citation chunks. Build with zero keys, and present:
- Example questions: `What happened in M3?`, `Which BASS-II measurements are missing?`, `Does ISS microgravity prove lunar fire safety?`, `What NASA evidence covers suppression vs detection?`
- Return original source-linked observations plus explicit uncertainty and `no supported answer` when unavailable.
- If generative Gemini is used, require linkable IDs, post-generation validation of any quoted numbers/units, and an explicit fallback/abstention state; no invented report page numbers.
- Add tests that unknown/fictitious questions do not return made-up numbers.

### Feature 4 — Judging-first guided walkthrough
Integrate a concise 5–6-step route beginning with an authentic NASA measurement, moving through the M3 counterexample, provenance, research relevance, gap map, and hypothetical digital-twin limitation. The first-screen CTA should work on mobile (360–394px) and desktop.
- Reinforce differentiator: `NASA measurement -> source locator -> validated comparison -> bounded interpretation -> next research question`.
- Include `data completeness`, `qualitative NASA insights`, `zero-key availability` and `why this matters for future research` without overpromising NASA operational use.

## Workstream 2: expanded NASA PSI coverage (only when genuine resources accessible, no fake fallbacks)

Candidate official sources:
- NASA BASS-II TM https://ntrs.nasa.gov/citations/20210011385
- FLEX PSI-69 v5 DOI 10.60555/mbq8-0451, CC0: https://psi.nasa.gov/physci/repo/data/investigations/PSI-69
- SAFFIRE-I PSI-98 v4 DOI 10.60555/0t15-1z43, CC0: https://psi.nasa.gov/physci/repo/data/investigations/PSI-98
- PSI portal and DOI advice https://psi.nasa.gov/physci/repo
- Challenge Resource eligibility source https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ (click `Resources` after the user is logged in, if needed)
- NASA report-level context `OCHMO-TB-008`, when actually relevant and source-reported.

Use selective, bounded official downloads only. Do **not** attempt to download terabytes, train large language models, rely on an undocumented PSI REST API, or confuse NASA's OSDR API with PSI.
- If source files downloadable, ingest one small, high-information FLEX source table first; retain original as immutable artifact (within reasonable repository file limits), SHA-256, DOI, version, retrieval date, original column names/units, row count and transforms. Include a reproducible script and cross-check rows. Do not silently reframe 31 verified FLEX experiments as 274 or 2,917 just because another repo reports them.
- If a Saffire-I real timeseries is genuinely obtainable, add a tiny one-stream explorer with source time axis, sensor unit, missingness and original timestamp; keep separate clocks/cabin and experiment channel streams. If not obtainable, expose a meaningful cited source record only, **not fabricated samples**.
- Add only verified NASA investigation metadata in a separate `METADATA_ONLY` view. An investigation metadata count cannot be merged into the "measured experiments" KPI.
- Generate `NASA_DATA_MANIFEST.md` (source URL, source ID, DOI, filename, version, size, hash, extraction notes, code mapping, license, retrieval date, status, caveat) and unit tests on its counts.

## Workstream 3: independently differentiated value and high-quality presentation

1. **AegisμG Scientific Reliability Scorecard** (NOT "fire-risk score"): number of source-observed measurements, metadata-only sources, derived values, missing fields, source-exact coverage and unsupported inferential claims flagged. Each denominator and method visible.
2. Improve the UX using *our own* code. Take only interface ideas from published repositories:
   - IGNIS LAB (WingManOO7/ignis-lab): observed-envelope abstention and confidence display.
   - FlameSight (TheCodersRish/flamesight): readable ranking explanations and input assumptions.
   - Fire Evidence Explorer (desanv01/fire-evidence-explorer-spaceapps-2026): original source field inspector and excellent short demo.
   - FlameScope (karanmhsp/flamescope-space-apps-2026): version/hash manifest, distinct sensor clocks.
   - FlameGuard (harshita713lab/NASA-Hackathon-flameguard): passage-level evidence, search transparency.
   - MissionGuard (bianca-andreica/missionguard): visual separation between NASA observations and synthetic telemetry.
   - PROMETHEUS (masudurrahman-ds/prometheus-microgravity): evidence/derived/inferred claim taxonomy.
   Public competitor URLs are for research only; don't import their source without licensing review.
3. Create a **presentation-ready, maximum 7-slide** deck in `submission/` with authentic screenshots/charts produced from the working AegisμG app (no stock NASA logos or fabricated AI imagery). Include per-slide citations and legible large text:
   1. AegisμG / team / exact challenge / independent prototype.
   2. Research problem and NASA relevance.
   3. Source: NASA BASS-II 20 tests / 43 segments / 39 numbers / 4 nulls.
   4. Scientific example: M3 exception, no causal claim.
   5. Evidence traceability, source integrity, applicability gap.
   6. Deterministic research ranking and explicitly hypothetical 0D tool.
   7. Impact, limitations, reproducibility, links and AI disclosure.
   Produce a real **PDF or a hosted slide deck export** if local rendering tools are present and verified; otherwise create accessible standalone slides with print CSS plus explicit instructions for exporting to PDF. Also write a **short narration <=30 sec**; do not claim a video exists unless actually recorded and public.
4. Create ready-to-paste NASA fields: high-level summary, project details, NASA resource/DOI citations, external sources, tech stack, human/AI division of work, caveats, link checklist. Update `SUBMISSION.md` and `FINAL_SPACEAPPS_2026_SUBMISSION_PACK.md` to match measured reality, not hopes.
5. Add a live-deployment smoke checklist: unauthenticated homepage, navigation, NASA link, Atlas source inspect, chart missingness, no-key question search, download, mobile UI, HTTP status, no secrets, slide/demo URL.

## Testable finish conditions and exit contract

Run all project checks again after changes. Any enhanced feature must have meaningful tests, accessibility labels, safe exports, data honesty, runtime no-key compatibility, and a clear observed/demo boundary. Do not introduce unneeded heavyweight ML dependencies before submission.

Add/update:
- `RELEASE_VERIFICATION_2026-11-15.md`: exact check commands, versions, pass/fail/block reason, final SHA; clearly mark tests that were NOT executed.
- `HACKATHON_DEVELOPMENT_DISCLOSURE.md`: timeline and pre-start clarification request, never rewrite commit history.
- `NASA_DATA_MANIFEST.md`: true ingested source status, no unsupported counts.
- `JUDGING_READINESS_CHECKLIST.md`: eligibility, exact challenge, public app, public 7-slide deck/30s demo, NASA resource listing, original work/AI disclosure, final Submit for Judging confirmation; all unknown boxes explicitly UNKNOWN, not DONE.
- `submission/` short presentation artifact and notes.
- Feature code/tests only as justified and validated.

When code passes, create local commits with descriptive messages on the feature branch; push branch and open a PR **only if remote credentials/tools are already authorized and available**, with validation record. Do not force-push, delete other branches, overwrite private repositories, merge to main without review, autonomously accept legal terms, or falsely confirm event submission. Do not delete or change old commits in order to hide the pre-start work.

**Final output MUST provide:**
1. Exact changed files, SHA/branch, what truly runs (not aspirational feature list).
2. Baseline and post-change lint/test/build results with actual counts and any CI runner blocker.
3. NASA original sources downloaded vs metadata-only, DOI, numbers/row source validity, what remains unverified.
4. Real deployment URL + incognito check if verified; else `UNVERIFIED` with minimum owner action.
5. Real slide/video URL if verified; else `UNVERIFIED` with minimum owner action.
6. Competition eligibility issue including timestamp and the pending official GO guidance.
7. Official submission state `NOT CONFIRMED` unless actual Space Apps platform acknowledgement is visible.
8. A short top-three owner checklist to submit by the deadline.

Make the best work possible, but **do not claim a win, certified fire safety, 100% prediction accuracy, or completion of actions not observed.**
