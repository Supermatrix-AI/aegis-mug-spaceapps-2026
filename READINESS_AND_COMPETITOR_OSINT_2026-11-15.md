# AegisμG — Submission Readiness and Public Competitor OSINT
**Date:** 15 November 2026 (UAE) | **Team:** SPECULATRON AI | **Challenge:** Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data.

**Evidence rule:** Public competitor figures are **repository author claims**, not third-party validated scientific measurements or verified hackathon scores. Treat GitHub discovery as a sample of indexed public entries, not an exhaustive inventory of all 2026 Space Apps teams. No judgment result can be inferred.

## Executive verdict: submission-critical blockers

| Area | Evidence and current state | Risk / owner |
|---|---|---|
| Registered event and team membership | Past communication confirms an Abu Dhabi Local Event registration; not live-verified today in the NASA portal. Local teams may have 1–6 participants; Universal must have 2–6 for global judging. | **HIGH** — Team Owner must inspect live member and challenge tabs. |
| Official challenge | NASA 2026 page: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ | Title is **SI-Powered**. Some older documents say AI-Powered. Normalize title after checking official live portal. |
| Challenge-listed NASA resource | BASS-II primary NASA TM and PSI-25 sources in repo. The current official challenge's **Resources tab could not be opened** with public search tooling. GO Team says at least one NASA resource from challenge Resources is needed for Global Awards. | **HIGH** — check actual Resources tab and cite selected eligible NASA source. |
| Code access | Public repo https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026 ; main contains 9 app navigation screens and Atlas code. | **GOOD**, but production functionality not re-tested in this audit. |
| Release tests | Latest GitHub Actions run 43669448020: **failure**, job had **0 steps**, completed in ~2 sec; consistent with a pre-runner scheduling/permission/quota issue, not proof that Vitest failed. Previous local RELEASE_AUDIT.md reported 34/34 passing tests; not independently rerun. | **HIGH** — run npm install, npm run lint, npm test, npm run build on final revision and save actual logs; inspect Actions account controls. |
| PR #2 | Open, GitHub API reported mergeable=false; main already contains Atlas, guided demo and more recent app code. | **HIGH** — do not blindly merge stale PR. Compare changed files and preserve latest code. |
| Live app | Current SUBMISSION.md shows PUBLIC DEPLOYMENT PENDING, prior Cloud Run link 404 / dev Google auth; no verified unauthenticated active application link. | **CRITICAL** — publish publicly and test independently/incognito. |
| Short demo | Demo script and 7-slide outline documented, but no confirmed public 30-second video or 7-slide deck link for AegisμG. | **CRITICAL** — produce public demo, ensure accessible no login. |
| Project submitted | No confirmed official Space Apps Project tab submission, originality checks or Submit for Judging receipt. | **CRITICAL** — Team Owner must explicitly submit and verify status by Sunday 15 November 2026, 11:59 PM applicable timezone. |
| Pre-hackathon development timing | Main commit 55bb69b34167 at 2026-11-14 04:06:12 UTC (=08:06 UAE); further project commits 04:17 and 04:44 UTC (=08:17 and 08:44 UAE). UAE event start 09:00 14 Nov. Official GO Team warns challenge-specific development before the event may disqualify entries. | **CRITICAL ELIGIBILITY RISK** — never rewrite history to conceal work; seek GO Team / Local Lead guidance, disclose provenance honestly. |
| AI disclosure and licensing | Files AI_DISCLOSURE.md, LICENSE, SOURCES.md, METHODOLOGY.md present. | Verify actual dependencies, assets, AI tools, NASA media attribution and original work. |

## Public competitor projects researched (capabilities as documented, not independently revalidated)

| Project / public URL | Distinct capability claimed | AegisμG gap or ethically reusable design principle |
|---|---|---|
| IGNIS LAB https://github.com/WingManOO7/ignis-lab | 274 FLEX droplet burns; 24 PSI investigation metadata; source-calibrated extinction/burning-rate model with reported grouped CV, abstention outside training range, NASA source retrieval, 3D exploration. | Add measured-coverage maps and **evidence-based abstention**; never claim a calibrated model unless reproduced and independently checked. |
| FlameSight https://github.com/TheCodersRish/flamesight | Reports 24 investigations and 2,917 normalized records, reproducible NASA PSI import, slider-adjustable relevance rankings and nearest-test evidence. | Expand honest source coverage; expose rankings and nearby *analog* tests without claiming operational fire risk. Verify any data counts before repeating. |
| Fire Evidence Explorer https://github.com/desanv01/fire-evidence-explorer-spaceapps-2026 | 31 NASA FLEX runs, exact original CSV row/column inspector, hosted demo, short 29.8s video, optional bounded LLM proposals. | Implement precise source-cell/locator inspection for dataset records and ship an immediately accessible demo. |
| FlameScope https://github.com/karanmhsp/flamescope-space-apps-2026 | Saffire-I PSI-98 and FLEX PSI-69 time series, unit/clock separation, rolling-MAD candidate outlier screen, DOI/file version/SHA manifests. | Introduce traceable real timeseries when available, preserve independent clock bases, add file-level manifests. |
| FlameGuard https://github.com/harshita713lab/NASA-Hackathon-flameguard | Source-grounded RAG console, ISS/Apollo/Mir archives, passage-level evidence ledger, retrieval telemetry, optional Pinecone/Groq. | Introduce an **offline grounded query index** over verified AegisμG claims; prioritize evidence quality over vector-store dependencies. |
| MissionGuard https://github.com/bianca-andreica/missionguard | Real Saffire-III PSI-100 telemetry kept separate from explicitly synthetic mission-monitoring visuals; anomalies and Gemini assistant. | Improve visual storytelling with clear NASA MEASURED vs HYPOTHETICAL vs DEMONSTRATION labels. |
| PROMETHEUS https://github.com/masudurrahman-ds/prometheus-microgravity | Claim classification NASA OBSERVED / NASA REPORTED / DERIVED / MODEL INFERRED and validator design. | Expand DIWA to classify every claim by evidence state. |
| Flame-in-Freefall https://github.com/Interminh/flame-in-freefall | Documents microgravity flow points, source anchors, a reduced-physics model with cluster bootstrap and limitations. | Add observed regime boundaries and proper unit/test-level dependence notes; avoid unvalidated gravity interpolation. |
| FLARENEXUS https://github.com/KhalidHasan03/Flame-in-Freefall | Polished visual interactive mission/fire lab, but README openly declares synthetic demonstration data. | Presentation improvements only, do not replace authentic NASA data with synthetic figures. |

**Do not copy competitors' protected code, unlicensed images, data tables without proper licensing or scientific claims that cannot be verified.** Re-implement independently using primary NASA sources, public concepts and compatible permissions.

## Verified public primary source shortlist

1. NASA BASS-II Summary Report **NASA/TM-20210011385** (2021); source URL: https://ntrs.nasa.gov/citations/20210011385 — 20 black PMMA tests from printed Table 5.1 as currently encoded in repo. Test M3 has 0.029 mm/s at 10 cm/s and 0.024 mm/s at 20 cm/s, but oxygen changes over the test. A descriptive exception, not causation.
2. **PSI-69 / FLEX Version 5**, DOI **10.60555/mbq8-0451**: https://psi.nasa.gov/physci/repo/data/investigations/PSI-69 — experimental source, CC0-1.0 on the NASA portal. Use only verified, re-downloaded original dataset tables, preserving source version, header, units and row.
3. **PSI-98 / SAFFIRE-I Version 4**, DOI **10.60555/0t15-1z43**: https://psi.nasa.gov/physci/repo/data/investigations/PSI-98 — original source/metadata, CC0-1.0. Avoid combining different sensor streams or timestamps without a justified synchronization method.
4. NASA PSI source portal: https://psi.nasa.gov/physci/repo — NASA states datasets must be cited using the source-specific persistent identifiers (DOIs); the NASA OSDR API is not automatically a PSI combustion API.
5. NASA 2026 challenge: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ — verify the **Resources** tab as the authority for eligibility.

## Proposed AegisμG differentiation (ranked by expected value, not a guaranteed outcome)

**P0:** Publish verified accessible app + accessible official short demo + NASA submission + eligibility disclosures.  
**P1:** Evidence Integrity Inspector with exact report-table locators or raw CSV field/row when actually available.  
**P1:** Evidence-Gap Map across material/airflow/oxygen/geometry, with observed envelope vs unmeasured (grey) and unsupported-extrapolation abstention.  
**P1:** Research Question Explorer retrieving source-linked verified statements only; no fabricated measurements.  
**P2:** Versioned NASA PSI dataset ingest for FLEX and Saffire, with manifest, DOI, SHA-256, unit transforms and run-level independent grouping.  
**P2:** Comparison/calibration report, missingness denominators, source-vs-derived-vs-inferred badges; 7-slide high-quality demo with an authentic M3 insight.  
**P3 (post-submission unless capacity):** Experimental model development and thorough out-of-sample validation; never overstate a predictive fire-risk capability.

## Official challenge and eligibility references

- Challenge + deadline: https://www.spaceappschallenge.org/2026/
- GO Team working-before-start clarification: https://github.com/nasa/spaceapps/discussions/1827
- Previous work clarification: https://github.com/nasa/spaceapps/discussions/1924
- Submission procedures: https://github.com/nasa/spaceapps/discussions/1973 and https://github.com/nasa/spaceapps/discussions/1991
- 2026 Abu Dhabi on-site schedule: https://nasaspaceapps.ae/abu-dhabi
- Official Project Submission Guide: https://www.spaceappschallenge.org/resources/project-submission-guide/
- Judging & Awards Guide: https://www.spaceappschallenge.org/resources/judging-awards-guide/

**Limits:** This OSINT cannot inspect all non-public Space Apps entries, private GitHub repositories, inaccessible NASA portal downloads or live submission accounts. Dataset sizes/accuracy reported by rivals are self-descriptions, not common-benchmark results.
