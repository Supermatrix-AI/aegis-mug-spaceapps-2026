# AegisμG — November 14–15, 2026 Delivery Checklist

## Verified assets
- Public repository: https://github.com/Supermatrix-AI/aegis-mug-spaceapps-2026
- Initial source in main: React UI, Node/Express server, NASA BASS-II catalog, scientific validation, baseline Vitest suite, docs.
- In-review digital-twin extension: zero-dimensional exploratory O2-balance model and source-value replay, tests, docs.

## Remaining release gates (must be verified, not assumed)
1. Merge digital-twin pull request only after GitHub Actions typecheck/tests/build succeed.
2. Pull the merged commit back into Google AI Studio; compare workspace and remote SHA. Back up AI Studio ZIP before resolving conflicts.
3. Perform manual mobile (390px) and desktop (1440px) visual checks on all eight sections, including twin charts and CSV export.
4. Run a production deployment on an authorized host, check URL in a private/incognito window without authentication and without an API key.
5. Confirm NASA Table 5.1 / 7.1 source claims against originals; preserve uncertainty as null when unknown.
6. Verify NASA Space Apps local event team eligibility, required submission fields and demo format in the current official portal.
7. Record short demo using actual working application, complete AI-use disclosure, publish public project URL and public GitHub URL on team submission page, submit and verify confirmation before the deadline.

## Future research, not a weekend completion claim
- NASA PSI raw video and time-series ingestion with licensing/permission checks.
- Calibration of a reduced-order combustion model using NASA data; held-out validation and quantified uncertainty.
- Physics-informed surrogate, cross-domain comparisons and CFD only with published validation.
- Collaboration workflow, reproducible artifact builds, persistent backend and scientific reviewer sign-off.

**Safety:** AegisμG is an independent research prototype. Its ranking is evidence relevance, not fire hazard; its digital twin is hypothetical and not validated for operational or life-safety use.
