# AegisμG — Release & Research Roadmap

## Verified Release State (2026-11-14 UTC)

- **Public GitHub repository:** `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026`
- **`main` branch baseline (`5f024bea6d`):** React 19 UI, Node/Express server (`server.ts`), NASA BASS-II full-text findings & core catalog (`8` sources, `8` investigations, `16` core records), Digital Twin V1 (`AEGIS_0D_OXYGEN_BALANCE_V1`), Zod + unit-aware validation, documentation.
- **Reconciled PR #2 (`feature/nasa-bass2-evidence-atlas`, `759a6fc9fd`) + Phase 5 Enhancements:** 9th dashboard screen (`Bass2Atlas.tsx`) with complete 20-test / 43-segment Table 5.1 transcription verified against `NASA/TM-20210011385` p. 57, interactive **AEGIS SCIENTIFIC BRIEFING** (Q1–Q3 + `.md` export), Mission-Relevance Research Briefings, 6-step **Start Scientific Demo** walkthrough, visual DIWA 6-Stage Evidence Assurance Chain, Digital Twin conservation & `0.5× / 1.0× / 2.0×` sensitivity diagnostics, and **34/34 passing Vitest tests** (`scientific.test.ts` 11, `digitalTwin.test.ts` 7, `bass2Atlas.test.ts` 9, `releaseValidation.test.ts` 7).

## Remaining Release Gates (Must Be Verified by User)

1. **Push & Merge to GitHub `main`:** Push the reconciled workspace changes to `Supermatrix-AI/aegis-mug-spaceapps-2026` and merge PR #2 into `main` (closing/superseding PR #1 since `main` already incorporates Digital Twin V1).
2. **GitHub Actions Runner Quota Note:** PR #2 run `43582082846` (job `132408756037`) failed in 1 second (`steps: []`) prior to runner container allocation—indicating an account/repository GitHub Actions runner quota or permissions block rather than a workflow YAML or test failure. Local `npm run lint`, `npm run test`, and `npm run build` pass.
3. **Manual Browser Walkthrough (`390px` mobile & `1440px` desktop):** Visually inspect all 9 sections, including the 6-step Start Scientific Demo flow, BASS-II Atlas charts/filters, and Digital Twin Recharts plots/CSV downloads in a live browser.
4. **Public Deployment Verification Without Auth/Key:** Confirm the published public deployment URL loads cleanly in a private/incognito window with no Google/AI Studio login wall and operates without `GEMINI_API_KEY`.
5. **NASA Space Apps Portal Submission:** Verify team eligibility, upload the `≤ 30s` video or `7-slide` presentation, verify AI disclosure fields, paste the public repo URL and public deployment URL, and confirm final submission receipt before November 15, 2026, 11:59 PM local event time.

## Future Research Roadmap (Beyond Hackathon Prototype)

- NASA PSI raw video and time-series ingestion with licensing/permission checks.
- Calibration of a reduced-order combustion model using NASA data, with held-out validation and quantified uncertainty.
- Physics-informed surrogate, cross-domain comparisons, and CFD only with published validation and vetted geometries.
- Collaborative human peer-review signoff workflows with persistent backend storage.

**Safety:** AegisμG is an independent research prototype. Its ranking is evidence relevance, not fire hazard; its digital twin is hypothetical and not validated for operational or life-safety use.
