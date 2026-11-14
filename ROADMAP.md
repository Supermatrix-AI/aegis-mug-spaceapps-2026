# AegisμG — Release & Research Roadmap

## Verified Release State (2026-11-13 / 2026-11-14 UTC)

- **Public GitHub repository:** `https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026`
- **`main` branch baseline:** React 19 UI, Node/Express server (`server.ts`), NASA BASS-II full-text findings & 7 single-condition test runs (`NASA/TM-20210011385`), 8 NASA source citations, Zod + unit-aware validation, 11 baseline Vitest tests, documentation.
- **Reconciled Digital Twin V1 (`feature/aegis-digital-twin-v1`, PR #1):** 8th dashboard screen (`DigitalTwin.tsx`), zero-dimensional oxygen mass-balance model (`AEGIS_0D_OXYGEN_BALANCE_V1`), Table 5.1 constant-rate illustrative replay, `NOT-NASA-DATA` CSV export, 7 unit tests (`18` total tests across `scientific.test.ts` and `digitalTwin.test.ts`), `.github/workflows/ci.yml`, `DIGITAL_TWIN_METHOD.md`, and `ROADMAP.md` reconciled in the AI Studio workspace.

## Remaining Release Gates (Must Be Verified by User)

1. **Merge & Push on GitHub:** Sync the reconciled workspace changes (including `NOT-NASA-DATA` CSV header refinement, 8-screen links, and updated docs) to `feature/aegis-digital-twin-v1` and merge PR #1 into `main` on `Supermatrix-AI/aegis-mug-spaceapps-2026`.
2. **GitHub Actions Runner Check:** Note that earlier PR #1 check runs concluded `failure` in 2 seconds with 0 executed steps before runner startup (likely GitHub account Actions quota/permissions); verify repo Actions settings if automated remote CI is desired, while local `npm run lint`, `npm run test`, and `npm run build` pass.
3. **Manual Browser Walkthrough (`390px` mobile & `1440px` desktop):** Visually inspect all 8 sections, including both Digital Twin Recharts plots and CSV downloads, in a live desktop/mobile browser.
4. **Public Deployment Verification Without Auth/Key:** Confirm the published public deployment URL loads cleanly in a private/incognito window with no Google/AI Studio login wall and operates without `GEMINI_API_KEY`.
5. **NASA Space Apps Portal Submission:** Verify team eligibility, upload the `≤ 30s` video or `7-slide` presentation, verify AI disclosure fields, paste the public repo URL and public deployment URL, and confirm final submission receipt.

## Future Research Roadmap (Beyond Hackathon Prototype)

- NASA PSI raw video and time-series ingestion with licensing/permission checks.
- Calibration of a reduced-order combustion model using NASA data, with held-out validation and quantified uncertainty.
- Physics-informed surrogate, cross-domain comparisons, and CFD only with published validation and vetted geometries.
- Collaborative human peer-review signoff workflows with persistent backend storage.

**Safety:** AegisμG is an independent research prototype. Its ranking is evidence relevance, not fire hazard; its digital twin is hypothetical and not validated for operational or life-safety use.
