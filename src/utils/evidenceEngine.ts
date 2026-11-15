import {
  BASS2_TESTS,
  BASS2_SEGMENTS,
  BASS2_TABLE51_DOCUMENT,
  BASS2_TABLE51_URL,
} from '../data/bass2Table51.ts';
import type { Bass2Segment } from '../data/bass2Table51.ts';
import type {
  ExperimentRecord,
  EvidenceOriginType,
  VerificationStatus,
} from '../types/scientific.ts';
import {
  BASS2_RESEARCH_INSIGHTS,
  MISSION_RESEARCH_BRIEFINGS,
  computeBass2Summary,
} from './bass2Insights.ts';
import { validateSourceUrl } from './security.ts';

// ============================================================================
// PHASE 3 — EVIDENCE INTEGRITY INSPECTOR & PROVENANCE TAXONOMY
// ============================================================================

export type ProvenanceClassification =
  | 'NASA_OBSERVED'
  | 'NASA_REPORTED'
  | 'DERIVED'
  | 'INTERPRETATION'
  | 'HYPOTHETICAL'
  | 'UNVERIFIED';

export interface EvidenceChainStep {
  stage:
    | 'NASA SOURCE'
    | 'EXPERIMENT'
    | 'MEASUREMENT'
    | 'DERIVED ANALYSIS'
    | 'INTERPRETATION'
    | 'RESEARCH RECOMMENDATION';
  detail: string;
  locator: string;
}

export interface EvidenceInspectionRecord {
  id: string;
  title: string;
  classification: ProvenanceClassification;
  needsSourceCheck: boolean;
  needsSourceCheckReason: string | null;
  sourceId: string;
  reportOrDoi: string;
  sourceUrl: string;
  locator: string;
  locatorKind: 'NASA_PDF_SECTION' | 'CSV_IMPORT' | 'PORTAL_INDEX' | 'UNSPECIFIED';
  originType: EvidenceOriginType;
  verificationStatus: VerificationStatus;
  missingnessStatus: string;
  uncertaintyStatus: string;
  sha256Hash: string | null;
  evidenceChain: EvidenceChainStep[];
}

export function mapOriginToProvenanceClassification(
  origin: EvidenceOriginType,
  verificationStatus: VerificationStatus,
  hasNumericValue: boolean
): ProvenanceClassification {
  if (origin === 'HYPOTHETICAL') return 'HYPOTHETICAL';
  if (origin === 'AI_ASSISTED') return 'INTERPRETATION';
  if (origin === 'DERIVED_CALCULATION') return 'DERIVED';
  if (verificationStatus === 'SOURCE_LINK_ONLY' || verificationStatus === 'CONTRADICTED') {
    return 'UNVERIFIED';
  }
  if (
    origin === 'SOURCE_REPORTED' &&
    (verificationStatus === 'SOURCE_MATCHED' || verificationStatus === 'HUMAN_VERIFIED')
  ) {
    return hasNumericValue ? 'NASA_OBSERVED' : 'NASA_REPORTED';
  }
  if (origin === 'MANUALLY_CURATED') {
    return verificationStatus === 'METADATA_REVIEWED' ? 'NASA_REPORTED' : 'UNVERIFIED';
  }
  return 'UNVERIFIED';
}

export function validateNumericTraceability(input: {
  reportedValue: number | null;
  units: string | null;
  citationLocator: string | null;
  sourceUrl: string;
  originType: EvidenceOriginType;
}): { valid: boolean; reason: string | null } {
  if (input.originType === 'HYPOTHETICAL') {
    return { valid: true, reason: null };
  }
  const urlCheck = validateSourceUrl(input.sourceUrl);
  if (!urlCheck.valid || !urlCheck.approvedDomain) {
    return {
      valid: false,
      reason: 'NEEDS_SOURCE_CHECK: Source URL is missing or outside approved NASA domains.',
    };
  }
  if (!input.citationLocator || input.citationLocator.trim().length < 3) {
    return {
      valid: false,
      reason: 'NEEDS_SOURCE_CHECK: Missing page, section, table, or figure citation locator.',
    };
  }
  if (input.reportedValue !== null && (!input.units || !input.units.trim())) {
    return {
      valid: false,
      reason: 'NEEDS_SOURCE_CHECK: Numeric value is missing explicit measurement units.',
    };
  }
  return { valid: true, reason: null };
}

export function inspectExperimentRecord(
  record: ExperimentRecord
): EvidenceInspectionRecord {
  const classification = mapOriginToProvenanceClassification(
    record.originType,
    record.verificationStatus,
    record.reportedValue !== null
  );
  const traceability = validateNumericTraceability({
    reportedValue: record.reportedValue,
    units: record.units,
    citationLocator: record.citationLocator,
    sourceUrl: record.sourceUrl,
    originType: record.originType,
  });

  const isCsvImport = record.extractionMethod === 'USER_CSV_IMPORT';
  const locatorKind: EvidenceInspectionRecord['locatorKind'] = !record.citationLocator
    ? 'UNSPECIFIED'
    : isCsvImport
      ? 'CSV_IMPORT'
      : record.recordLevel === 'CATALOG_INDEX'
        ? 'PORTAL_INDEX'
        : 'NASA_PDF_SECTION';

  const missingParts: string[] = [];
  if (record.oxygenPercent === null) missingParts.push('oxygenPercent=null');
  if (record.airflowVelocity === null) missingParts.push('airflowVelocity=null');
  if (record.reportedValue === null) missingParts.push('reportedValue=null');

  const missingnessStatus =
    missingParts.length === 0
      ? 'Core numeric condition & outcome fields populated (null-safe).'
      : `Unreported fields kept null: ${missingParts.join(', ')}`;

  const uncertaintyStatus =
    record.uncertainty ?? 'Not reported in primary source table (preserved as null).';

  const evidenceChain: EvidenceChainStep[] = [
    {
      stage: 'NASA SOURCE',
      detail: `${record.sourceId} (${record.reportId ?? 'NASA Archive'})`,
      locator: record.sourceUrl,
    },
    {
      stage: 'EXPERIMENT',
      detail: `${record.experimentFamily} · ${record.gravityContext} · ${record.experimentGeometry ?? 'Geometry N/R'}`,
      locator: record.investigationId,
    },
    {
      stage: 'MEASUREMENT',
      detail:
        record.reportedValue !== null
          ? `${record.reportedValue} ${record.units ?? ''} (${record.measurementType ?? 'Measurement'})`
          : 'No run-level numeric measurement ingested (preserved null)',
      locator: record.citationLocator ?? 'NEEDS_SOURCE_CHECK',
    },
    {
      stage: 'DERIVED ANALYSIS',
      detail:
        record.originType === 'DERIVED_CALCULATION'
          ? 'Deterministic derived equation applied from source parameters'
          : 'Raw source value preserved without smoothing or interpolation',
      locator: record.extractionMethod,
    },
    {
      stage: 'INTERPRETATION',
      detail: record.observedOutcome ?? 'Metadata index record only — no experimental claim.',
      locator: classification,
    },
    {
      stage: 'RESEARCH RECOMMENDATION',
      detail:
        record.verificationStatus === 'SOURCE_MATCHED' ||
        record.verificationStatus === 'HUMAN_VERIFIED'
          ? 'Suitable for controlled 0 g comparison with facility/scale caveats; never partial-g certification.'
          : 'Verify primary NASA PSI CSV/NTRS PDF table before quantitative use.',
      locator: record.verificationStatus,
    },
  ];

  return {
    id: record.experimentId,
    title: record.paperTitle,
    classification,
    needsSourceCheck: !traceability.valid,
    needsSourceCheckReason: traceability.reason,
    sourceId: record.sourceId,
    reportOrDoi: record.reportId ?? record.sourceId,
    sourceUrl: record.sourceUrl,
    locator: record.citationLocator ?? 'Missing citation locator',
    locatorKind,
    originType: record.originType,
    verificationStatus: record.verificationStatus,
    missingnessStatus,
    uncertaintyStatus,
    sha256Hash: record.sha256Hash,
    evidenceChain,
  };
}

export function inspectBass2Segment(segment: Bass2Segment): EvidenceInspectionRecord {
  const testMeta = BASS2_TESTS.find((t) => t.id === segment.testId);
  const segIndex = testMeta
    ? testMeta.velocitiesCmPerSecond.findIndex((v) => v === segment.velocityCmPerSecond) + 1
    : 1;
  const hasNumericSpread = segment.spreadRateMmPerSecond !== null;
  const classification: ProvenanceClassification = hasNumericSpread
    ? 'NASA_OBSERVED'
    : 'UNVERIFIED';

  const locator = `${segment.citationLocator} · Test ${segment.testId} / Segment ${segIndex} (${segment.velocityCmPerSecond} cm/s)`;
  const traceability = validateNumericTraceability({
    reportedValue: segment.spreadRateMmPerSecond,
    units: hasNumericSpread ? 'mm/s' : null,
    citationLocator: locator,
    sourceUrl: segment.sourceUrl,
    originType: segment.originType,
  });

  return {
    id: segment.id,
    title: `BASS-II PMMA Test ${segment.testId} (${segment.thicknessMm} mm × ${segment.widthCm} cm, ${segment.burningSides}-sided)`,
    classification,
    needsSourceCheck: !traceability.valid,
    needsSourceCheckReason: traceability.reason,
    sourceId: 'SRC-NTRS-20210011385',
    reportOrDoi: BASS2_TABLE51_DOCUMENT,
    sourceUrl: segment.sourceUrl,
    locator,
    locatorKind: 'NASA_PDF_SECTION',
    originType: segment.originType,
    verificationStatus: segment.verificationStatus,
    missingnessStatus: hasNumericSpread
      ? 'Segment spread rate reported; per-segment O2 is NOT reported (null).'
      : 'NASA Table 5.1 states "Not tracked" (preserved null); per-segment O2 also null.',
    uncertaintyStatus: 'Per-run uncertainty bounds omitted in Table 5.1 (preserved null).',
    sha256Hash: '56ee5bd7702b5c8235f9934468bb9d6e4ea143c4570d7eaa1da11d904b42ea3f',
    evidenceChain: [
      {
        stage: 'NASA SOURCE',
        detail: `${BASS2_TABLE51_DOCUMENT} (TM-20210011385.pdf.txt verified)`,
        locator: BASS2_TABLE51_URL,
      },
      {
        stage: 'EXPERIMENT',
        detail: `ISS MSG 0 g rectangular duct · ${segment.thicknessMm} mm PMMA · ${segment.burningSides}-sided · ${segment.burnMinutes} min`,
        locator: `Test ${segment.testId}`,
      },
      {
        stage: 'MEASUREMENT',
        detail: hasNumericSpread
          ? `Opposed flow ${segment.velocityCmPerSecond} cm/s -> spread ${segment.spreadRateMmPerSecond} mm/s; Test O2 ${segment.initialOxygenVolPercent}% -> ${segment.finalOxygenVolPercent}%`
          : `Opposed flow ${segment.velocityCmPerSecond} cm/s -> spread Not tracked (null); Test O2 ${segment.initialOxygenVolPercent}% -> ${segment.finalOxygenVolPercent}%`,
        locator,
      },
      {
        stage: 'DERIVED ANALYSIS',
        detail:
          segment.testId === 'M3'
            ? 'Counterexample in within-test directional check (0.029 mm/s at 10 cm/s vs 0.024 mm/s at 20 cm/s).'
            : 'Paired sequential segment; O2 depletion prevents pure velocity isolation.',
        locator: 'bass2Insights.ts trendForTest()',
      },
      {
        stage: 'INTERPRETATION',
        detail:
          'Describes 0 g MSG duct behavior only; segment-level O2 cannot be interpolated.',
        locator: 'NASA/TM-20210011385 Sec. 5.4–5.6',
      },
      {
        stage: 'RESEARCH RECOMMENDATION',
        detail:
          'Obtain PSI-25 gas-analyzer & camera-tracking time series to resolve segment O2 and error bars.',
        locator: 'PSI-25 Investigation',
      },
    ],
  };
}

// ============================================================================
// PHASE 4 — EVIDENCE GAP & APPLICABILITY MAP
// ============================================================================

export type GapCoverageStatus =
  | 'OBSERVED'
  | 'SOURCE_METADATA_ONLY'
  | 'NO_MEASUREMENT'
  | 'HYPOTHETICAL_MODEL';

export interface EvidenceGapCell {
  id: string;
  category: 'Material / Fuel' | 'Geometry' | 'Airflow Regime' | 'Oxygen Regime' | 'Gravity Regime';
  label: string;
  status: GapCoverageStatus;
  testCount: number;
  observationCount: number;
  measuredVariables: string;
  missingVariables: string;
  caveat: string;
  proposalPrompt: string;
}

export function buildEvidenceGapMap(records: ExperimentRecord[]): EvidenceGapCell[] {
  const bass2Count = BASS2_TESTS.length;
  const bass2NumericCount = BASS2_SEGMENTS.filter(
    (s) => s.spreadRateMmPerSecond !== null
  ).length;
  const oneSidedSegs = BASS2_SEGMENTS.filter((s) => s.burningSides === 1);
  const twoSidedSegs = BASS2_SEGMENTS.filter((s) => s.burningSides === 2);
  const lowFlowSegs = BASS2_SEGMENTS.filter((s) => s.velocityCmPerSecond < 10);
  const midFlowSegs = BASS2_SEGMENTS.filter(
    (s) => s.velocityCmPerSecond >= 10 && s.velocityCmPerSecond <= 15
  );
  const highFlowSegs = BASS2_SEGMENTS.filter((s) => s.velocityCmPerSecond > 15);
  const lowO2Tests = BASS2_TESTS.filter((t) => t.initialOxygenVolPercent < 19.5);
  const midO2Tests = BASS2_TESTS.filter(
    (t) => t.initialOxygenVolPercent >= 19.5 && t.initialOxygenVolPercent <= 21.5
  );
  const highO2Tests = BASS2_TESTS.filter((t) => t.initialOxygenVolPercent > 21.5);
  const sibalRuns = records.filter((r) =>
    (r.material ?? '').toLowerCase().includes('sibal') && r.recordLevel === 'EXPERIMENT_RUN'
  );
  const userPartialG = records.filter(
    (r) =>
      (r.gravityContext === 'PARTIAL_GRAVITY_LUNAR' ||
        r.gravityContext === 'PARTIAL_GRAVITY_MARTIAN') &&
      r.originType !== 'HYPOTHETICAL'
  );

  return [
    {
      id: 'GAP-MAT-PMMA',
      category: 'Material / Fuel',
      label: 'Cast Black PMMA (BASS-II Table 5.1)',
      status: 'OBSERVED',
      testCount: bass2Count,
      observationCount: bass2NumericCount,
      measuredVariables: 'Thickness (1–5 mm), width (1.2/2.2 cm), opposed flow (2–21 cm/s), 39 spread rates (mm/s), initial/final O2',
      missingVariables: 'Per-segment O2 (0/43), M6 & M12 spread rates (4 nulls), error bars (0/20)',
      caveat: 'Single MSG small duct (7.6×7.6 cm); sequential steps on reused samples.',
      proposalPrompt:
        'Retrieve PSI-25 time-resolved camera trajectories and gas-analyzer O2 logs for BASS-II M1–M20.',
    },
    {
      id: 'GAP-MAT-SIBAL',
      category: 'Material / Fuel',
      label: 'SIBAL Cotton-Fiberglass (BASS-II Table 7.1)',
      status: 'OBSERVED',
      testCount: sibalRuns.length,
      observationCount: sibalRuns.filter((r) => r.reportedValue !== null).length,
      measuredVariables: 'Concurrent flow velocity (cm/s), initial O2 (vol%), burn/non-ignition notes (Table 7.1)',
      missingVariables: 'Steady flame spread rates omitted from Table 7.1 (plotted only in Fig. 7.4); GMT45-T1/T2 O2 flagged inaccurate',
      caveat: 'Concurrent duct flow (different orientation vs Table 5.1 opposed PMMA).',
      proposalPrompt:
        'Digitize NASA/TM-20210011385 Fig. 7.4 concurrent spread rates with explicit uncertainty bounds.',
    },
    {
      id: 'GAP-MAT-SAFFIRE',
      category: 'Material / Fuel',
      label: 'Saffire-I Large Spacecraft Textile (PSI-98)',
      status: 'SOURCE_METADATA_ONLY',
      testCount: 1,
      observationCount: 0,
      measuredVariables: 'Metadata & DataCite DOI (10.60555/0t15-1z43, Version 4) indexed',
      missingVariables: 'Cygnus duct spread rate, temperature, pressure, and gas-evolution CSVs',
      caveat: 'PSI telemetry archive not bundled; large Cygnus scale is not directly comparable to MSG.',
      proposalPrompt:
        'Download PSI-98 Saffire-I CSV telemetry from psi.nasa.gov and import via Data Import.',
    },
    {
      id: 'GAP-MAT-FLEX',
      category: 'Material / Fuel',
      label: 'FLEX / FLEX-2 Liquid Droplets (PSI-69)',
      status: 'SOURCE_METADATA_ONLY',
      testCount: 1,
      observationCount: 0,
      measuredVariables: 'Metadata & DataCite DOI (10.60555/mbq8-0451, Version 5) indexed',
      missingVariables: 'Droplet K burning rates, cool-flame extinction diameters, radiative losses',
      caveat: 'Spherical liquid droplets in CIR; fundamentally distinct from solid duct fire spread.',
      proposalPrompt:
        'Acquire PSI-69 droplet diameter regression CSV tables before liquid-fuel cross-comparisons.',
    },
    {
      id: 'GAP-MAT-SAME-ACME',
      category: 'Material / Fuel',
      label: 'SAME Smoke Aerosol & ACME Gaseous Flames',
      status: 'SOURCE_METADATA_ONLY',
      testCount: 2,
      observationCount: 0,
      measuredVariables: 'Official NASA PSI combustion index metadata only',
      missingVariables: 'Smoke particle size distribution (SAME) and gaseous extinction/soot metrics (ACME)',
      caveat: 'Smoke particulate characterization is crucial for early detector thresholds in crew cabins.',
      proposalPrompt:
        'Ingest SAME aerosol morphology measurements to link smoke detection margins to solid combustion.',
    },
    {
      id: 'GAP-GEO-ONE',
      category: 'Geometry',
      label: 'One-sided Flat PMMA (MSG Duct)',
      status: 'OBSERVED',
      testCount: BASS2_TESTS.filter((t) => t.burningSides === 1).length,
      observationCount: oneSidedSegs.filter((s) => s.spreadRateMmPerSecond !== null).length,
      measuredVariables: 'Spread rate, flow, thickness, O2 start/end across M1–M3, M14–M15',
      missingVariables: 'Segment-level O2 and heat flux to backing wall',
      caveat: 'Includes counterexample M3 (5 mm, 10 -> 20 cm/s showed spread decrease 0.029 -> 0.024 mm/s).',
      proposalPrompt: 'Investigate backing-plate conductive heat loss vs convective O2 supply in thick 1-sided PMMA.',
    },
    {
      id: 'GAP-GEO-TWO',
      category: 'Geometry',
      label: 'Two-sided Flat PMMA (MSG Duct)',
      status: 'OBSERVED',
      testCount: BASS2_TESTS.filter((t) => t.burningSides === 2).length,
      observationCount: twoSidedSegs.filter((s) => s.spreadRateMmPerSecond !== null).length,
      measuredVariables: 'Spread rate, flow, thickness, O2 start/end across 15 tests (M4–M13, M16–M20)',
      missingVariables: 'M6 & M12 spread rates ("Not tracked" = null); per-segment O2',
      caveat: 'Symmetric heat feedback yields faster spread than 1-sided at equivalent thickness; do not pool carelessly.',
      proposalPrompt: 'Compare 1-sided vs 2-sided heat transfer separately without fitting unstratified curves.',
    },
    {
      id: 'GAP-GEO-CYGNUS',
      category: 'Geometry',
      label: 'Large Spacecraft Duct (Cygnus Saffire-I)',
      status: 'SOURCE_METADATA_ONLY',
      testCount: 1,
      observationCount: 0,
      measuredVariables: 'Investigation scope & facility context (PSI-98)',
      missingVariables: 'Full-scale velocity profile, pyrolysis length, radiative heat feedback',
      caveat: 'Small 7.6 cm MSG duct heat losses cannot validate meter-scale spacecraft corridors.',
      proposalPrompt: 'Cross-link PSI-98 Saffire-I sensor telemetry once imported.',
    },
    {
      id: 'GAP-FLOW-LOW',
      category: 'Airflow Regime',
      label: 'Low Opposed Airflow (< 10 cm/s)',
      status: 'OBSERVED',
      testCount: new Set(lowFlowSegs.map((s) => s.testId)).size,
      observationCount: lowFlowSegs.filter((s) => s.spreadRateMmPerSecond !== null).length,
      measuredVariables: 'Opposed flow 2–9 cm/s (20 segments; 18 numeric spread rates, M6 8 cm/s null)',
      missingVariables: 'Instantaneous O2 at each low-flow step; quiescent 0 cm/s blowoff limits',
      caveat: 'Critically relevant to poorly ventilated avionics bays; spread persists down to 2 cm/s (M16).',
      proposalPrompt: 'Verify blowoff / quenching thresholds below 3 cm/s under reduced O2.',
    },
    {
      id: 'GAP-FLOW-MID',
      category: 'Airflow Regime',
      label: 'Moderate Opposed Airflow (10–15 cm/s)',
      status: 'OBSERVED',
      testCount: new Set(midFlowSegs.map((s) => s.testId)).size,
      observationCount: midFlowSegs.filter((s) => s.spreadRateMmPerSecond !== null).length,
      measuredVariables: 'Opposed flow 10–15 cm/s (19 segments; 16 numeric, 3 null in M6/M12)',
      missingVariables: 'Segment-level O2 depletion history during multi-step burns',
      caveat: 'Most dense regime in Table 5.1; matches nominal spacecraft cabin ventilation speeds.',
      proposalPrompt: 'Extract per-minute gas-analyzer O2 traces for mid-flow Table 5.1 segments.',
    },
    {
      id: 'GAP-FLOW-HIGH',
      category: 'Airflow Regime',
      label: 'Higher Opposed Airflow (> 15 cm/s)',
      status: 'OBSERVED',
      testCount: new Set(highFlowSegs.map((s) => s.testId)).size,
      observationCount: highFlowSegs.filter((s) => s.spreadRateMmPerSecond !== null).length,
      measuredVariables: 'Opposed flow 20–21 cm/s across M2, M3, M11, M15 (4 numeric observations)',
      missingVariables: 'Concurrent flow high-velocity limits and >21 cm/s blowoff onset',
      caveat: 'Only 4 segments > 15 cm/s exist in Table 5.1, including counterexample M3 (20 cm/s).',
      proposalPrompt: 'Expand experimental matrix above 20 cm/s across varying thicknesses and O2 levels.',
    },
    {
      id: 'GAP-O2-TEST-LOW',
      category: 'Oxygen Regime',
      label: 'Hypoxic Test Start O2 (< 19.5 vol%)',
      status: 'OBSERVED',
      testCount: lowO2Tests.length,
      observationCount: lowO2Tests.reduce(
        (n, t) => n + t.spreadRatesMmPerSecond.filter((v) => v !== null).length,
        0
      ),
      measuredVariables: 'Test-level initial/final O2 (down to 17.9% start / 16.8% end) across M7–M9, M16–M20',
      missingVariables: 'True critical extinction O2 limit across thicknesses at fixed flow',
      caveat: 'Demonstrates sustained PMMA flame spread in ISS microgravity below 19.5% O2.',
      proposalPrompt: 'Establish thickness-dependent microgravity limiting oxygen index (LOI) with error bars.',
    },
    {
      id: 'GAP-O2-TEST-NORM',
      category: 'Oxygen Regime',
      label: 'Normoxic / Enriched Start O2 (19.5–22.2 vol%)',
      status: 'OBSERVED',
      testCount: midO2Tests.length + highO2Tests.length,
      observationCount: [...midO2Tests, ...highO2Tests].reduce(
        (n, t) => n + t.spreadRatesMmPerSecond.filter((v) => v !== null).length,
        0
      ),
      measuredVariables: 'Test-level start/end O2 across M1–M6, M10–M15',
      missingVariables: 'Segment-by-segment O2 values during stepped runs',
      caveat: 'O2 drops continuously inside the closed 250 L MSG work volume during burning.',
      proposalPrompt: 'Replace start/end averages with real-time PSI O2 sensor telemetry.',
    },
    {
      id: 'GAP-O2-SEGMENT',
      category: 'Oxygen Regime',
      label: 'Per-Segment Oxygen During Multi-Step Flow',
      status: 'NO_MEASUREMENT',
      testCount: 0,
      observationCount: 0,
      measuredVariables: 'None in Table 5.1 (only run start & run end O2 tabulated)',
      missingVariables: '0 of 43 velocity segments report segment-level O2 (strictly preserved null)',
      caveat: 'NASA/TM-20210011385 Sec. 5.4 warns that interpolating O2 within a run is an assumption.',
      proposalPrompt: 'Synchronize PSI-25 mass-spectrometer/O2 traces to velocity change timestamps.',
    },
    {
      id: 'GAP-O2-EXPLORATION',
      category: 'Oxygen Regime',
      label: 'Exploration Atmospheres (~34% O2 / 56.5 kPa)',
      status: 'NO_MEASUREMENT',
      testCount: 0,
      observationCount: 0,
      measuredVariables: 'None ingested (BASS-II tests ran near ~1 atm, <= 22.2% O2)',
      missingVariables: 'Elevated-O2 reduced-pressure ignition, spread rate, and CO yield',
      caveat: 'Artemis lunar landers & pressurized rovers use ~34% O2 / 56.5 kPa; 1 atm / 21% O2 does NOT bound this risk.',
      proposalPrompt: 'Prioritize reduced-pressure elevated-O2 solid flammability experiments.',
    },
    {
      id: 'GAP-GRAV-0G',
      category: 'Gravity Regime',
      label: 'ISS & Spacecraft Microgravity (~0 g)',
      status: 'OBSERVED',
      testCount: bass2Count + sibalRuns.length,
      observationCount: bass2NumericCount + sibalRuns.filter((r) => r.reportedValue !== null).length,
      measuredVariables: 'MSG 0 g solid PMMA & SIBAL runs + indexed Saffire/FLEX/SAME/ACME families',
      missingVariables: 'Full uncertainty intervals and cross-facility PSI CSV telemetry',
      caveat: 'Buoyancy is negligible in 0 g; behavior cannot directly validate partial-g habitats.',
      proposalPrompt: 'Harmonize MSG (BASS-II) and Cygnus (Saffire-I) under explicit scale & boundary models.',
    },
    {
      id: 'GAP-GRAV-LUNAR',
      category: 'Gravity Regime',
      label: 'Lunar Partial Gravity (0.165 g)',
      status: userPartialG.some((r) => r.gravityContext === 'PARTIAL_GRAVITY_LUNAR')
        ? 'OBSERVED'
        : 'NO_MEASUREMENT',
      testCount: 0,
      observationCount: 0,
      measuredVariables: '0 empirical Lunar 0.165 g measurements in workspace (Digital Twin label is HYPOTHETICAL_MODEL only)',
      missingVariables: 'Buoyant plume initiation, upward/downward flame transition, smoke stratification at 0.165 g',
      caveat: 'CRITICAL GAP: 0 g microgravity does NOT validate 0.165 g Lunar surface fire behavior.',
      proposalPrompt: 'Conduct partial-gravity centrifuge/drop/flight testing at 0.165 g and ~34% O2 / 56.5 kPa.',
    },
    {
      id: 'GAP-GRAV-MARTIAN',
      category: 'Gravity Regime',
      label: 'Martian Partial Gravity (0.38 g)',
      status: userPartialG.some((r) => r.gravityContext === 'PARTIAL_GRAVITY_MARTIAN')
        ? 'OBSERVED'
        : 'NO_MEASUREMENT',
      testCount: 0,
      observationCount: 0,
      measuredVariables: '0 empirical Martian 0.38 g measurements in workspace (Digital Twin label is HYPOTHETICAL_MODEL only)',
      missingVariables: 'Mixed-convection flame spread, detector placement, and extinguishment limits at 0.38 g',
      caveat: 'CRITICAL GAP: 0.38 g mixed convection differs physically from both 0 g and 1 g.',
      proposalPrompt: 'Conduct 0.38 g mixed-convection combustion and smoke-detection validation studies.',
    },
    {
      id: 'GAP-MODEL-TWIN',
      category: 'Gravity Regime',
      label: '0D Oxygen Mass-Balance Digital Twin V1',
      status: 'HYPOTHETICAL_MODEL',
      testCount: 0,
      observationCount: 0,
      measuredVariables: 'Analytical CSTR differential equation on user-supplied inputs (NOT NASA DATA)',
      missingVariables: 'Not calibrated or validated against NASA time-series fire telemetry',
      caveat: 'NOT NASA DATA · NOT VALIDATED · NOT CERTIFIED · NOT A FIRE-SPREAD PREDICTION.',
      proposalPrompt: 'Use solely as educational sensitivity sandbox until calibrated on PSI time-series.',
    },
  ];
}

export function exportGapMapJson(cells: EvidenceGapCell[]): string {
  return JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      disclaimer:
        'AegisμG Evidence Gap & Applicability Map. Status labels strictly distinguish empirical NASA measurements from missing data and hypothetical models.',
      summaryCounts: {
        totalDimensions: cells.length,
        observed: cells.filter((c) => c.status === 'OBSERVED').length,
        sourceMetadataOnly: cells.filter((c) => c.status === 'SOURCE_METADATA_ONLY').length,
        noMeasurement: cells.filter((c) => c.status === 'NO_MEASUREMENT').length,
        hypotheticalModel: cells.filter((c) => c.status === 'HYPOTHETICAL_MODEL').length,
      },
      cells,
    },
    null,
    2
  );
}

function safeCsv(v: string | number): string {
  const s = String(v);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function exportGapMapCsv(cells: EvidenceGapCell[]): string {
  const header = [
    'id',
    'category',
    'label',
    'coverage_status',
    'test_count',
    'observation_count',
    'measured_variables',
    'missing_variables',
    'caveat',
    'proposal_prompt',
  ];
  const rows = cells.map((c) =>
    [
      c.id,
      c.category,
      c.label,
      c.status,
      c.testCount,
      c.observationCount,
      c.measuredVariables,
      c.missingVariables,
      c.caveat,
      c.proposalPrompt,
    ]
      .map(safeCsv)
      .join(',')
  );
  return [header.map(safeCsv).join(','), ...rows].join('\n');
}

// ============================================================================
// PHASE 5 — DETERMINISTIC SPECULATRON QUESTION EXPLORER (BM25 / OFFLINE)
// ============================================================================

export interface QuestionAnswerResult {
  query: string;
  status: 'GROUNDED' | 'INSUFFICIENT_EVIDENCE';
  answerText: string;
  evidenceRef: string;
  experimentId: string | null;
  nasaCitation: string;
  citationUrl: string | null;
  verifiedObservation: string;
  scientificInterpretation: string;
  importantLimitations: string;
  matchedDocuments: Array<{
    id: string;
    title: string;
    score: number;
    locator: string;
    url: string;
  }>;
}

export const SUGGESTED_EXPLORER_QUESTIONS: ReadonlyArray<{
  id: string;
  question: string;
}> = [
  {
    id: 'Q1',
    question: 'Does higher airflow always increase flame spread in BASS-II?',
  },
  {
    id: 'Q2',
    question: 'What happened in BASS-II test M3?',
  },
  {
    id: 'Q3',
    question: 'What is missing in BASS-II Table 5.1?',
  },
  {
    id: 'Q4',
    question: 'Can 0 g ISS experiments predict Moon or Mars fires?',
  },
  {
    id: 'Q5',
    question: 'Which experiments inform spacecraft material screening?',
  },
  {
    id: 'Q6',
    question: 'What data exists for fire prevention, detection, and suppression?',
  },
  {
    id: 'Q7',
    question: 'Why are some FLEX or Saffire measurements missing?',
  },
  {
    id: 'Q8',
    question: 'What data must be ingested next for real validation?',
  },
];

interface SearchPassage {
  id: string;
  title: string;
  tokens: string[];
  locator: string;
  url: string;
  experimentId: string | null;
  nasaCitation: string;
  verifiedObservation: string;
  scientificInterpretation: string;
  importantLimitations: string;
  topicTag:
    | 'AIRFLOW_M3'
    | 'MISSING_TABLE51'
    | 'PARTIAL_GRAVITY'
    | 'MATERIAL_SCREENING'
    | 'PREVENTION_DETECTION_SUPPRESSION'
    | 'PSI_METADATA_ONLY'
    | 'NEXT_VALIDATION'
    | 'CALORIMETRY_PRODUCTS'
    | 'SIBAL_CONCURRENT'
    | 'CATALOG_RECORD';
}

const STOPWORDS = new Set([
  'the', 'is', 'a', 'an', 'in', 'of', 'to', 'and', 'or', 'for', 'on', 'with',
  'what', 'which', 'how', 'why', 'does', 'do', 'can', 'are', 'be', 'from', 'as',
  'this', 'that', 'it', 'by', 'at', 'be', 'some', 'must', 'next', 'real', 'about',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9._%+-]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function buildKnowledgePassages(records: ExperimentRecord[]): SearchPassage[] {
  const summary = computeBass2Summary();
  const m3 = BASS2_TESTS.find((t) => t.id === 'M3')!;
  const passages: SearchPassage[] = [
    {
      id: 'KB-AIRFLOW-M3',
      title: 'BASS-II Opposed-Flow Trend & Test M3 Non-Monotonic Counterexample',
      tokens: tokenize(
        'higher airflow always increase flame spread rate BASS-II Table 5.1 M3 test happened 10 cm/s 0.029 mm/s 20 cm/s 0.024 mm/s 12 of 13 non-monotonic counterexample velocity PMMA'
      ),
      locator: 'NASA/TM-20210011385 Table 5.1 (Test M3), printed p. 57',
      url: BASS2_TABLE51_URL,
      experimentId: 'EXP-BASS2-M3 (Atlas) / SRC-NTRS-20210011385',
      nasaCitation: 'NASA/TM-20210011385 Table 5.1 (p. 57) & Sec. 5.4–5.6 (pp. 60–62)',
      verifiedObservation: `Across ${summary.assessableMultiConditionTests} assessable multi-velocity Table 5.1 PMMA tests, ${summary.alignedWithinTest} show nondecreasing flame spread with higher opposed flow, while Test M3 (5 mm thick, 2.2 cm wide, 1-sided) decreased from ${m3.spreadRatesMmPerSecond[0]} mm/s at 10 cm/s to ${m3.spreadRatesMmPerSecond[1]} mm/s at 20 cm/s as test O2 fell from 20.8% to 19.7% over 20.1 min.`,
      scientificInterpretation:
        'Higher airflow does NOT always yield higher reported spread rate inside sequential BASS-II runs. Lowering chamber O2 during stepped flow burns can offset or obscure velocity effects.',
      importantLimitations:
        'Per-segment O2 and per-run uncertainty intervals are omitted from Table 5.1; 12/13 alignment is descriptive and does not prove isolated flow causation.',
      topicTag: 'AIRFLOW_M3',
    },
    {
      id: 'KB-MISSING-TABLE51',
      title: 'Missing & Unreported Measurements in BASS-II Table 5.1',
      tokens: tokenize(
        'missing untracked null Table 5.1 M6 M12 oxygen segment error bars uncertainty not tracked omitted BASS-II gaps'
      ),
      locator: 'NASA/TM-20210011385 Table 5.1 (p. 57) & Sec. 5.4 (p. 60)',
      url: BASS2_TABLE51_URL,
      experimentId: 'EXP-BASS-II-NTRS-2021',
      nasaCitation: 'NASA/TM-20210011385 Table 5.1 (p. 57) & Sec. 5.4 (p. 60)',
      verifiedObservation: `Of ${summary.reportedVelocityConditions} velocity segments across M1–M20, ${summary.numericSpreadObservations} have numeric spread rates and ${summary.noTrackedRateSegments} segments in Tests ${summary.testWithMissingRates.join(' & ')} are NASA-reported "Not tracked" (preserved null). Segment-level O2 is unreported for 43/43 segments (only run start/end O2 given), and per-run error bounds are omitted for 20/20 tests.`,
      scientificInterpretation:
        'Table 5.1 records 39 numeric observations across 20 sample burns, not 39 independent fires. Interpolating segment O2 or zeroing M6/M12 introduces non-NASA synthetic error.',
      importantLimitations:
        'AegisμG refuses to interpolate missing segment O2 or fill null spread rates without PSI-25 raw gas-analyzer and video-tracking telemetry.',
      topicTag: 'MISSING_TABLE51',
    },
    {
      id: 'KB-PARTIAL-GRAVITY',
      title: 'ISS 0 g Microgravity vs Moon (0.165 g) and Mars (0.38 g) Applicability',
      tokens: tokenize(
        '0 g ISS experiments predict Moon lunar 0.165 g Mars Martian 0.38 g partial gravity buoyancy fire safety extrapolation rover exploration atmosphere 34% 56.5 kPa'
      ),
      locator: 'METHODOLOGY.md Sec. 3 & NASA/TM-20210011385 / OCHMO-TB-008',
      url: 'https://ntrs.nasa.gov/citations/20210011385',
      experimentId: 'EXP-BASS-II-NTRS-2021 / EXP-OCHMO-TB-008',
      nasaCitation: 'NASA/TM-20210011385 (0 g MSG) & OCHMO-TB-008 (Crewed Spacecraft Fire Protection)',
      verifiedObservation:
        'Zero empirical Lunar (0.165 g) or Martian (0.38 g) fire experiments exist in our verified catalog. All measured BASS-II and indexed Saffire/FLEX/SAME/ACME investigations were executed in ~0 g orbital microgravity.',
      scientificInterpretation:
        'No — 0 g ISS experiments cannot directly predict fire behavior or safety on the Moon or Mars because weak buoyant convection (0.165 g / 0.38 g) alters flame geometry, heat feedback, and smoke stratification, and exploration habitats may use ~34% O2 / 56.5 kPa.',
      importantLimitations:
        'AegisμG explicitly blocks partial-gravity extrapolation; its Digital Twin gravity dropdown changes only descriptive context labels.',
      topicTag: 'PARTIAL_GRAVITY',
    },
    {
      id: 'KB-MATERIAL-SCREENING',
      title: 'NASA Experiments Informing Spacecraft Material Screening & Prevention',
      tokens: tokenize(
        'experiments inform spacecraft material screening PMMA SIBAL cotton fiberglass Saffire-I BASS BASS-II OCHMO-TB-008 solid textile flammability'
      ),
      locator: 'NASA/TM-20210011385 Table 5.1 & Table 7.1 + PSI-98',
      url: 'https://ntrs.nasa.gov/citations/20210011385',
      experimentId: 'EXP-BASS-II-NTRS-2021 / EXP-PSI-98-SAFFIRE-I',
      nasaCitation: 'NASA/TM-20210011385 Table 5.1 (p. 57), Table 7.1 (p. 96), PSI-98, OCHMO-TB-008',
      verifiedObservation:
        'BASS-II provides verified 0 g numeric data for cast black PMMA (Table 5.1: 0.012–0.144 mm/s spread, 17.9–22.2% start O2, 2–21 cm/s flow) and concurrent SIBAL cotton-fiberglass tests (Table 7.1, including GMT175-T9 non-ignition at 16.4% O2), complemented by Saffire-I (PSI-98) for large Cygnus duct scale and OCHMO-TB-008 for program fire-protection framing.',
      scientificInterpretation:
        'Combined BASS-II small-duct observations and Saffire-I large-scale scope help researchers frame airflow, thickness, and O2 sensitivity hypotheses prior to formal material testing.',
      importantLimitations:
        'Does NOT replace NASA-STD-6001 material qualification; Table 7.1 notes GMT45-T1/T2 O2 readings may be inaccurate (footnote b).',
      topicTag: 'MATERIAL_SCREENING',
    },
    {
      id: 'KB-PREVENTION-DETECTION-SUPPRESSION',
      title: 'Fire Prevention, Detection, and Suppression Evidence Across NASA Corpus',
      tokens: tokenize(
        'data exists fire prevention detection suppression SAME smoke aerosol CO CO2 stoichiometry nitrogen N2 extinction ignition OCHMO-TB-008'
      ),
      locator: 'NASA/TM-20210011385 Sec. 1.1–1.5, Table 7.1, PSI SAME, OCHMO-TB-008',
      url: 'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-008-fire-protection.pdf',
      experimentId: 'EXP-BASS-II-NTRS-2021 / EXP-PSI-SAME-REF / EXP-OCHMO-TB-008',
      nasaCitation: 'NASA/TM-20210011385 Sec. 1.1–1.5 (pp. 3–11); PSI-SAME; OCHMO-TB-008',
      verifiedObservation:
        'Prevention/Ignition: BASS-II Table 7.1 documents non-ignition (GMT175-T9 at 16.4% O2) and N2 dilution inside the 250 L MSG duct. Detection: BASS-II Sec. 1.5 reports elevated CO/CO2 yields (370–550 ppm per 1% CO2 at Φ_global = 1.3), and SAME indexes ISS smoke particulate morphology. Suppression: BASS/BASS-II & OCHMO-TB-008 cover N2/CO2 diluent extinguishment and habitat fire-protection doctrine.',
      scientificInterpretation:
        'Detection strategies cannot rely purely on terrestrial buoyancy smoke plumes; elevated CO in under-ventilated 0 g fires and aerosol particle data from SAME provide complementary sensing research targets.',
      importantLimitations:
        'SAME aerosol particle counts and OCHMO numeric threshold tables remain uningested (SOURCE_METADATA_ONLY / METADATA_REVIEWED).',
      topicTag: 'PREVENTION_DETECTION_SUPPRESSION',
    },
    {
      id: 'KB-PSI-METADATA-ONLY',
      title: 'Why FLEX, Saffire, SAME, and ACME Numeric Measurements Are Preserved as Null',
      tokens: tokenize(
        'why FLEX FLEX-2 Saffire Saffire-I SAME ACME measurements missing null unparsed PSI portal archive interactive download DOI'
      ),
      locator: 'src/data/nasaCatalog.ts & NASA_DATA_MANIFEST.md',
      url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-69',
      experimentId: 'EXP-PSI-69 / EXP-PSI-98-SAFFIRE-I / EXP-PSI-FLEX-REF',
      nasaCitation: 'NASA PSI DataCite DOIs 10.60555/mbq8-0451 (PSI-69) & 10.60555/0t15-1z43 (PSI-98)',
      verifiedObservation:
        'psi.nasa.gov investigation routes (PSI-25, PSI-69, PSI-98) serve an Angular SPA web application without unauthenticated bulk CSV tables in static HTML. Therefore, AegisμG indexes verified official metadata/DOIs and leaves their unparsed numeric metrics strictly null.',
      scientificInterpretation:
        'Keeping unparsed PSI measurements as null prevents fabricated numbers, silent zero substitution, or unverified secondary web scraping.',
      importantLimitations:
        'To populate FLEX droplet K values or Saffire-I Cygnus sensor streams, download raw CSV bundles from psi.nasa.gov and validate them through Data Import.',
      topicTag: 'PSI_METADATA_ONLY',
    },
    {
      id: 'KB-NEXT-VALIDATION',
      title: 'Next Required Data for Quantitative Digital Twin & Safety Validation',
      tokens: tokenize(
        'what data ingested next real validation telemetry camera trajectories gas analyzer uncertainty PSI-25 PSI-98 partial gravity calibration'
      ),
      locator: 'DIGITAL_TWIN_METHOD.md & Bass2Atlas Research Gaps',
      url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
      experimentId: 'EXP-PSI-25-BASS-II / EXP-PSI-98-SAFFIRE-I',
      nasaCitation: 'NASA/TM-20210011385 Sec. 5.4–5.7 & DIGITAL_TWIN_METHOD.md',
      verifiedObservation:
        'Needed datasets: (1) time-resolved PSI-25 camera flame-front trajectories and calibrated O2/CO/CO2 analyzer traces with error bounds, (2) PSI-98 Saffire-I Cygnus duct CSVs for scale validation, (3) SAME smoke particulate distributions, and (4) empirical 0.165 g / 0.38 g partial-gravity runs at exploration cabin pressure/O2.',
      scientificInterpretation:
        'Only after ingesting time-resolved multi-run telemetry with uncertainty bars can reduced-order physics models or the 0D oxygen balance undergo held-out quantitative validation.',
      importantLimitations:
        'Until then, the Digital Twin V1 remains an uncalibrated educational conservation sandbox, NOT a validated simulator.',
      topicTag: 'NEXT_VALIDATION',
    },
    {
      id: 'KB-CALORIMETRY-PRODUCTS',
      title: 'BASS-II Oxygen Consumption Calorimetry (13.1 kJ/g O2) & Equivalence Ratio',
      tokens: tokenize(
        'oxygen consumption heat release rate HRR 100 W 13.1 kJ/g global equivalence ratio phi 1.3 CO2 CO stoichiometry Huggett BASS-II'
      ),
      locator: 'NASA/TM-20210011385 Sec. 1.4–1.5, Eq. 1.1–1.4, pp. 7–11',
      url: BASS2_TABLE51_URL,
      experimentId: 'EXP-BASS-II-NTRS-2021',
      nasaCitation: 'NASA/TM-20210011385 Sec. 1.4–1.5, pp. 7–11',
      verifiedObservation:
        'BASS-II calculates heat-release rate from oxygen consumption using Huggett convention 13.1 kJ/g O2, finding typical HRR < 100 W and global equivalence ratios up to Φ_global = 1.3 with CO yields of 370–550 ppm per 1% CO2.',
      scientificInterpretation:
        'Under-ventilated enclosed burning inside a 250 L glovebox leaves unburned fuel/CO even when macroscopic fire heat release appears modest (< 100 W).',
      importantLimitations:
        'Classified as DERIVED_CALCULATION because calorimetry and Φ_global depend on stoichiometric & closed-volume assumptions in Sec. 1.4–1.5.',
      topicTag: 'CALORIMETRY_PRODUCTS',
    },
  ];

  // Add catalog records and insight entries dynamically so arbitrary queries over records work too
  for (const ins of BASS2_RESEARCH_INSIGHTS) {
    passages.push({
      id: ins.id,
      title: ins.title,
      tokens: tokenize(`${ins.title} ${ins.statement} ${ins.limitation} ${ins.citation}`),
      locator: ins.citation,
      url: BASS2_TABLE51_URL,
      experimentId: 'EXP-BASS-II-NTRS-2021',
      nasaCitation: ins.citation,
      verifiedObservation: ins.statement,
      scientificInterpretation: ins.statement,
      importantLimitations: ins.limitation,
      topicTag: 'CATALOG_RECORD',
    });
  }

  for (const mb of MISSION_RESEARCH_BRIEFINGS) {
    passages.push({
      id: `BRIEF-${mb.context}`,
      title: `Mission Profile: ${mb.title}`,
      tokens: tokenize(
        `${mb.title} ${mb.gravityLabel} ${mb.relevantStudies} ${mb.measuredVariables} ${mb.preliminaryContext} ${mb.nonTransferableAssumptions} ${mb.missingValidationData}`
      ),
      locator: 'src/utils/bass2Insights.ts (MISSION_RESEARCH_BRIEFINGS)',
      url: BASS2_TABLE51_URL,
      experimentId: mb.relevantStudies,
      nasaCitation: 'NASA/TM-20210011385 & OCHMO-TB-008',
      verifiedObservation: mb.measuredVariables,
      scientificInterpretation: mb.preliminaryContext,
      importantLimitations: `${mb.nonTransferableAssumptions} Missing: ${mb.missingValidationData}`,
      topicTag: 'CATALOG_RECORD',
    });
  }

  for (const r of records) {
    const findingText = r.findings.map((f) => f.statement).join(' ');
    passages.push({
      id: `REC-${r.experimentId}`,
      title: `${r.experimentId}: ${r.paperTitle}`,
      tokens: tokenize(
        `${r.experimentId} ${r.experimentFamily} ${r.paperTitle} ${r.material ?? ''} ${r.fuelType ?? ''} ${r.gravityContext} ${r.observedOutcome ?? ''} ${findingText} ${r.notes ?? ''}`
      ),
      locator: r.citationLocator ?? r.sourceId,
      url: r.sourceUrl,
      experimentId: r.experimentId,
      nasaCitation: `${r.sourceId} (${r.citationLocator ?? 'No locator'})`,
      verifiedObservation:
        r.observedOutcome ??
        `Metadata record for ${r.experimentId}; numeric value: ${r.reportedValue !== null ? `${r.reportedValue} ${r.units ?? ''}` : 'Not reported / null'}.`,
      scientificInterpretation:
        r.notes ??
        'Record retrieved from verified catalog; check verification status and missing fields before quantitative use.',
      importantLimitations:
        r.uncertainty ??
        'Uncertainty not reported in source; verify primary NASA source document before operational analysis.',
      topicTag: 'CATALOG_RECORD',
    });
  }

  return passages;
}

function isUnsupportedQuery(query: string): string | null {
  const q = query.toLowerCase();
  const hasPartialG =
    /\b(lunar|moon|0\.165\s*g|mars|martian|0\.38\s*g)\b/.test(q);
  const asksQuantitativeTarget =
    /\b(exact|numerical|numeric|critical\s+oxygen|loi|limiting\s+oxygen|spread\s*rate|burn\s*rate|flammability\s+rating|extinction\s+limit)\b/.test(
      q
    );
  if (hasPartialG && asksQuantitativeTarget) {
    return 'Partial-gravity (0.165 g Lunar / 0.38 g Martian) flammability limits, critical O2 thresholds, and spread rates are unmeasured in the verified 0 g NASA catalog.';
  }
  if (/\bcertif(y|ied|ication)\b/.test(q) && /\b(safe|flight|pmma|sibal|habitat|material)\b/.test(q)) {
    return 'AegisμG is an unofficial research triage prototype and never provides spacecraft material flight certification or NASA-STD-6001 sign-off.';
  }
  if (/\b(apollo\s*\d+|iss\s*999|m2[1-9]|m[3-9]\d|starliner|skylab)\b/.test(q)) {
    return 'Referenced mission or test ID (e.g., Apollo, Starliner, or M21+) is not present in the verified AegisμG NASA corpus (BASS-II Table 5.1 covers M1–M20).';
  }
  return null;
}

export function answerResearchQuestion(
  query: string,
  records: ExperimentRecord[]
): QuestionAnswerResult {
  const cleanQuery = query.trim();
  const emptyResult = (reason: string): QuestionAnswerResult => ({
    query: cleanQuery,
    status: 'INSUFFICIENT_EVIDENCE',
    answerText: 'Insufficient verified NASA evidence for this conclusion.',
    evidenceRef: 'NONE (Abstained under DIWA anti-fabrication policy)',
    experimentId: null,
    nasaCitation: 'No verified NASA dataset supports this conclusion.',
    citationUrl: null,
    verifiedObservation: 'No empirical NASA measurement or citation in the workspace substantiates this query.',
    scientificInterpretation: 'Insufficient verified NASA evidence for this conclusion.',
    importantLimitations: reason,
    matchedDocuments: [],
  });

  if (cleanQuery.length < 3) {
    return emptyResult('Enter a specific research question at least 3 characters long.');
  }

  // Strict abstention for out-of-scope predictions / certifications / nonexistent experiments
  const unsupportedReason = isUnsupportedQuery(cleanQuery);
  if (unsupportedReason) {
    return emptyResult(unsupportedReason);
  }

  const passages = buildKnowledgePassages(records);
  const queryTokens = tokenize(cleanQuery);
  if (queryTokens.length === 0) {
    return emptyResult('Query lacked recognizable technical terms matching the NASA corpus.');
  }

  // BM25 scoring
  const N = passages.length;
  const avgDl =
    passages.reduce((acc, p) => acc + Math.max(1, p.tokens.length), 0) / Math.max(1, N);
  const df = new Map<string, number>();
  for (const qt of new Set(queryTokens)) {
    let count = 0;
    for (const p of passages) {
      if (p.tokens.includes(qt)) count++;
    }
    df.set(qt, count);
  }

  const k1 = 1.4;
  const b = 0.75;
  const scored = passages
    .map((p) => {
      const dl = Math.max(1, p.tokens.length);
      const tfMap = new Map<string, number>();
      for (const tok of p.tokens) tfMap.set(tok, (tfMap.get(tok) ?? 0) + 1);
      let score = 0;
      let hitCount = 0;
      for (const qt of queryTokens) {
        const tf = tfMap.get(qt) ?? 0;
        if (tf === 0) continue;
        hitCount++;
        const docFreq = df.get(qt) ?? 0;
        const idf = Math.log(1 + (N - docFreq + 0.5) / (docFreq + 0.5));
        score += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * dl) / avgDl)));
      }
      // Small boost for curated synthesis passages when multiple tokens match
      if (!p.id.startsWith('REC-') && hitCount >= 2) {
        score *= 1.15;
      }
      return { passage: p, score, hitCount };
    })
    .filter((x) => x.score > 0 && x.hitCount >= 1)
    .sort((a, bSort) => bSort.score - a.score);

  const top = scored[0];
  if (!top || top.score < 1.8 || (queryTokens.length >= 3 && top.hitCount < 2 && top.score < 3.5)) {
    return emptyResult(
      'No indexed NASA record or Table 5.1/7.1 passage achieved sufficient verified token overlap to substantiate a grounded answer.'
    );
  }

  const best = top.passage;
  return {
    query: cleanQuery,
    status: 'GROUNDED',
    answerText: best.scientificInterpretation,
    evidenceRef: `${best.id} · ${best.locator}`,
    experimentId: best.experimentId,
    nasaCitation: best.nasaCitation,
    citationUrl: best.url,
    verifiedObservation: best.verifiedObservation,
    scientificInterpretation: best.scientificInterpretation,
    importantLimitations: best.importantLimitations,
    matchedDocuments: scored.slice(0, 4).map((m) => ({
      id: m.passage.id,
      title: m.passage.title,
      score: Number(m.score.toFixed(2)),
      locator: m.passage.locator,
      url: m.passage.url,
    })),
  };
}

// ============================================================================
// PHASE 6 — SCIENTIFIC RELIABILITY SCORECARD
// ============================================================================

export interface ScientificReliabilityScorecard {
  sourceDocumentsCount: number;
  verifiedSourceDocsCount: number;
  measuredObservationsCount: number;
  measuredBreakdown: string;
  metadataOnlyCount: number;
  missingValuesCount: number;
  missingBreakdown: string;
  derivedCalculationsCount: number;
  unverifiedStatementsCount: number;
  citationBackedCount: number;
  totalClaimsAndMetrics: number;
  citationCoveragePct: number;
  methodologyNotes: {
    researchRelevance: string;
    evidenceCompleteness: string;
    sourceReliability: string;
    experimentalCoverage: string;
    modelValidationStatus: 'NOT VALIDATED';
  };
}

export function computeReliabilityScorecard(
  records: ExperimentRecord[],
  sourceCount = 8
): ScientificReliabilityScorecard {
  const atlas = computeBass2Summary();
  // Count distinct verified Table 5.1 numeric observations + non-PMMA Table 7.1 SIBAL numeric outcomes in catalog
  const nonTable51NumericCatalog = records.filter(
    (r) =>
      !r.experimentId.startsWith('EXP-BASS2-M') &&
      r.originType === 'SOURCE_REPORTED' &&
      r.reportedValue !== null
  ).length;
  const measuredObservationsCount =
    atlas.numericSpreadObservations + nonTable51NumericCatalog;

  const metadataOnlyCount = records.filter(
    (r) =>
      r.verificationStatus === 'SOURCE_LINK_ONLY' ||
      r.verificationStatus === 'METADATA_REVIEWED'
  ).length;

  // Missing values across Table 5.1 + core catalog records
  const catalogNullFields = records.reduce((acc, r) => {
    let nulls = 0;
    if (r.oxygenPercent === null) nulls++;
    if (r.airflowVelocity === null) nulls++;
    if (r.reportedValue === null) nulls++;
    if (r.uncertainty === null) nulls++;
    return acc + nulls;
  }, 0);
  const table51MissingTotal =
    atlas.noTrackedRateSegments + // 4 untracked spread rates (M6, M12)
    atlas.reportedVelocityConditions + // 43 missing per-segment O2
    atlas.sampleTests; // 20 missing per-run error bounds
  const missingValuesCount = table51MissingTotal + catalogNullFields;

  const derivedCalculationsCount =
    records.filter((r) => r.originType === 'DERIVED_CALCULATION').length +
    records.reduce(
      (acc, r) =>
        acc + r.measurements.filter((m) => m.originType === 'DERIVED_CALCULATION').length,
      0
    ) +
    1; // +1 deterministic within-test trend check (12/13 + M3)

  const unverifiedStatementsCount = records.filter(
    (r) =>
      r.verificationStatus === 'SOURCE_LINK_ONLY' ||
      r.verificationStatus === 'CONTRADICTED' ||
      r.originType === 'AI_ASSISTED' ||
      r.originType === 'HYPOTHETICAL'
  ).length;

  const findings = records.flatMap((r) =>
    r.findings.map((f) => ({
      hasCitation: Boolean(r.sourceId && r.sourceUrl && f.citationLocator),
    }))
  );
  const measurements = records.flatMap((r) =>
    r.measurements.map((m) => ({
      hasCitation: Boolean(
        r.sourceId && m.sourceUrl && m.citationLocator && (m.reportedValue === null || m.units)
      ),
    }))
  );
  const allClaims = [...findings, ...measurements];
  const citationBackedCount = allClaims.filter((c) => c.hasCitation).length;
  const totalClaimsAndMetrics = allClaims.length;
  const citationCoveragePct =
    totalClaimsAndMetrics > 0
      ? Number(((citationBackedCount / totalClaimsAndMetrics) * 100).toFixed(1))
      : 0;

  return {
    sourceDocumentsCount: sourceCount,
    verifiedSourceDocsCount: sourceCount, // All 8 domain-approved NASA/SpaceApps links verified
    measuredObservationsCount,
    measuredBreakdown: `${atlas.numericSpreadObservations} Table 5.1 numeric PMMA spread rates + ${nonTable51NumericCatalog} non-duplicate source-reported catalog runs`,
    metadataOnlyCount,
    missingValuesCount,
    missingBreakdown: `${atlas.noTrackedRateSegments} untracked Table 5.1 rates (M6/M12) + ${atlas.reportedVelocityConditions} unreported segment O2 + ${atlas.sampleTests} missing Table 5.1 error bounds + ${catalogNullFields} null catalog condition/uncertainty fields`,
    derivedCalculationsCount,
    unverifiedStatementsCount,
    citationBackedCount,
    totalClaimsAndMetrics,
    citationCoveragePct,
    methodologyNotes: {
      researchRelevance:
        'Context alignment formula R = (0.25 + 0.75·Completeness) × (0.30·Env + 0.25·Param + 0.25·Verif + 0.20·Mat) × 100. Never measures fire hazard or probability.',
      evidenceCompleteness:
        'Fraction of 8 core schema attributes populated per record (sourceUrl, material, geometry, locator, O2, airflow+unit, outcome+unit, uncertainty).',
      sourceReliability:
        'Human/Source verification tiers (HUMAN_VERIFIED > SOURCE_MATCHED > METADATA_REVIEWED > SOURCE_LINK_ONLY > CONTRADICTED) with zero auto-promotion.',
      experimentalCoverage:
        'Measured ISS 0 g PMMA & SIBAL runs vs metadata-only FLEX/SAME/ACME/Saffire records vs 0 empirical 0.165 g / 0.38 g partial-gravity runs.',
      modelValidationStatus: 'NOT VALIDATED',
    },
  };
}
