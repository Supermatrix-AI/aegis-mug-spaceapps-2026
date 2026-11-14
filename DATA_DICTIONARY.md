# AegisμG Data Dictionary

All fields are validated at ingestion and export boundaries using TypeScript interfaces (`src/types/scientific.ts`) and Zod schemas (`src/schemas/scientific.ts`). Unreported values remain `null` and are rendered as `"Not reported / Not verified"`.

| Field Name | Type | Nullable | Allowed Values / Constraints | Scientific Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `experimentId` | `string` | No | Non-empty unique identifier | Primary key for an experiment or catalog entry |
| `sourceId` | `string` | No | References `SourceDocument.sourceId` | Links record to an authoritative source citation |
| `investigationId` | `string` | No | References `Investigation.investigationId` | Groups records under a NASA investigation (e.g., `INV-BASS-II`) |
| `experimentFamily` | `string` | No | e.g., `BASS-II`, `Saffire`, `FLEX`, `SAME`, `ACME` | Program family classification |
| `recordLevel` | `enum` | Yes | `REPORT_SUMMARY`, `EXPERIMENT_RUN`, `DERIVED_ANALYSIS`, `CATALOG_INDEX` | Distinguishes report-level summaries from single test runs |
| `paperTitle` | `string` | No | 1–300 characters | Exact title of NASA report, PSI dataset, or paper |
| `institution` | `string` | No | 1–200 characters | Responsible research center (e.g., NASA Glenn Research Center) |
| `sourceUrl` | `string` | No | Valid `https://` URL | Original NASA/NTRS/PSI/SpaceApps citation link |
| `reportId` | `string` | Yes | e.g., `NTRS-20210011385`, `PSI-25` | Official report or PSI accession identifier |
| `material` | `string` | Yes | Sanitized text | Specific fuel or test sample material |
| `fuelType` | `string` | Yes | e.g., `Solid fuel`, `Liquid droplet`, `Gaseous fuel` | Phase/fuel classification for comparability gating |
| `gravityContext` | `enum` | No | `MICROGRAVITY_ISS`, `MICROGRAVITY_SPACECRAFT`, `MICROGRAVITY_DROP_TOWER`, `PARTIAL_GRAVITY_LUNAR`, `PARTIAL_GRAVITY_MARTIAN`, `NORMAL_GRAVITY_1G`, `UNSPECIFIED` | Gravitational acceleration regime |
| `oxygenPercent` | `number` | Yes | `0` to `100` (finite) | Ambient oxygen volume concentration (%) |
| `airflowVelocity` | `number` | Yes | `>= 0` (finite) | Forced convective airflow velocity |
| `airflowUnit` | `string` | Yes | Required if `airflowVelocity` is non-null (e.g., `cm/s`, `m/s`) | Preserved velocity unit |
| `experimentGeometry` | `string` | Yes | Sanitized text | Duct, chamber, or sample geometry |
| `measurementType` | `string` | Yes | Sanitized text | Measured combustion phenomenon or instrument output |
| `observedOutcome` | `string` | Yes | Max 1500 characters | Qualitative or documented experimental finding |
| `reportedValue` | `number` | Yes | Finite number | Primary extracted numeric measurement |
| `units` | `string` | Yes | Required if `reportedValue` is non-null | Exact preserved physical unit of `reportedValue` |
| `uncertainty` | `string` | Yes | e.g., `±0.2 mm/s` | Reported measurement uncertainty / error bar |
| `citationLocator` | `string` | Yes | e.g., `Table 2, Page 14` | Exact page, table, or figure reference |
| `originalExcerptShort` | `string` | Yes | Max 400 characters | Short verbatim locator excerpt when verified |
| `extractionMethod` | `enum` | No | `OFFICIAL_METADATA_INDEX`, `MANUAL_CURATION`, `USER_CSV_IMPORT`, `USER_JSON_IMPORT`, `API_STRUCTURED_EXTRACT` | How the record entered AegisμG |
| `verificationStatus` | `enum` | No | `SOURCE_LINK_ONLY`, `METADATA_REVIEWED`, `SOURCE_MATCHED`, `HUMAN_VERIFIED`, `CONTRADICTED` | DIWA evidence verification tier |
| `originType` | `enum` | No | `SOURCE_REPORTED`, `MANUALLY_CURATED`, `DERIVED_CALCULATION`, `AI_ASSISTED`, `HYPOTHETICAL` | Provenance classification |
| `retrievalDate` | `string` | No | ISO date (`YYYY-MM-DD`) | Date source metadata or data was retrieved |
| `sha256Hash` | `string` | Yes | 64-char hex digest | Byte-level file consistency digest (does not prove scientific correctness) |
| `notes` | `string` | Yes | Max 1500 characters | Verification rationale, caveats, or limitations |
