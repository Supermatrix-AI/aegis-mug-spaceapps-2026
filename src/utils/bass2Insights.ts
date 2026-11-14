import {
  BASS2_TESTS,
  BASS2_SEGMENTS,
  BASS2_TABLE51_DOCUMENT,
  BASS2_TABLE51_LOCATOR,
  BASS2_TABLE51_URL,
} from '../data/bass2Table51.ts';
import type { Bass2Test, Bass2Segment } from '../data/bass2Table51.ts';
import type { ApplicationContext, ExperimentRecord } from '../types/scientific.ts';
import { rankExperimentsForContext } from './scoring.ts';

export interface WithinTestTrend {
  testId: string;
  status: 'ALIGNED' | 'NONALIGNED' | 'INSUFFICIENT';
  measuredSegments: number;
  note: string;
}

export interface Bass2AtlasSummary {
  sampleTests: number;
  reportedVelocityConditions: number;
  numericSpreadObservations: number;
  noTrackedRateSegments: number;
  multiConditionTests: number;
  assessableMultiConditionTests: number;
  alignedWithinTest: number;
  nonalignedWithinTest: number;
  testWithMissingRates: string[];
  trends: WithinTestTrend[];
}

export function trendForTest(t: Bass2Test): WithinTestTrend {
  const observations = t.velocitiesCmPerSecond
    .map((velocity, idx) => ({ velocity, spread: t.spreadRatesMmPerSecond[idx] }))
    .filter((x): x is { velocity: number; spread: number } => x.spread !== null);
  const uniqueVelocities = new Set(observations.map((x) => x.velocity));
  if (observations.length < 2 || uniqueVelocities.size < 2) {
    return {
      testId: t.id,
      status: 'INSUFFICIENT',
      measuredSegments: observations.length,
      note: 'Fewer than two numeric measurements at distinct airflow velocities.',
    };
  }
  let mismatches = 0;
  for (let i = 0; i < observations.length; i++) {
    for (let j = i + 1; j < observations.length; j++) {
      const a = observations[i];
      const b = observations[j];
      if (a.velocity === b.velocity) continue;
      if ((a.velocity - b.velocity) * (a.spread - b.spread) < -1e-9) mismatches++;
    }
  }
  return {
    testId: t.id,
    status: mismatches ? 'NONALIGNED' : 'ALIGNED',
    measuredSegments: observations.length,
    note: mismatches
      ? 'At least one reported velocity/spread pair differs from a positive monotonic direction; review experimental context.'
      : 'Reported spread rates are nondecreasing with airflow across this test’s available pairs. Oxygen changed during the test, so causation is not established.',
  };
}

export function computeBass2Summary(
  tests: ReadonlyArray<Bass2Test> = BASS2_TESTS
): Bass2AtlasSummary {
  const trends = tests.map(trendForTest);
  const reportedVelocityConditions = tests.reduce(
    (n, t) => n + t.velocitiesCmPerSecond.length,
    0
  );
  const numericSpreadObservations = tests.reduce(
    (n, t) => n + t.spreadRatesMmPerSecond.filter((v) => v !== null).length,
    0
  );
  return {
    sampleTests: tests.length,
    reportedVelocityConditions,
    numericSpreadObservations,
    noTrackedRateSegments: reportedVelocityConditions - numericSpreadObservations,
    multiConditionTests: tests.filter((t) => t.velocitiesCmPerSecond.length > 1).length,
    assessableMultiConditionTests: trends.filter((x) => x.status !== 'INSUFFICIENT').length,
    alignedWithinTest: trends.filter((x) => x.status === 'ALIGNED').length,
    nonalignedWithinTest: trends.filter((x) => x.status === 'NONALIGNED').length,
    testWithMissingRates: tests
      .filter((t) => t.spreadRatesMmPerSecond.some((x) => x === null))
      .map((t) => t.id),
    trends,
  };
}

function csvCell(value: string | number | null): string {
  if (value === null) return '""';
  const text = String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/**
 * A traceable, non-synthetic CSV extraction of NASA Table 5.1.
 * Segment O2 is BLANK because it was not published in Table 5.1.
 */
export function exportBass2SegmentsCsv(
  segments: ReadonlyArray<Bass2Segment> = BASS2_SEGMENTS
): string {
  const header = [
    'test_id',
    'segment_id',
    'velocity_cm_per_s',
    'spread_rate_mm_per_s',
    'thickness_mm',
    'width_cm',
    'burning_sides',
    'test_burn_minutes',
    'test_initial_oxygen_vol_percent',
    'test_final_oxygen_vol_percent',
    'oxygen_during_segment_NOT_REPORTED',
    'source_report',
    'source_locator',
    'source_url',
    'origin_type',
    'verification_status',
  ];
  const lines = segments.map((x) =>
    [
      x.testId,
      x.id,
      x.velocityCmPerSecond,
      x.spreadRateMmPerSecond,
      x.thicknessMm,
      x.widthCm,
      x.burningSides,
      x.burnMinutes,
      x.initialOxygenVolPercent,
      x.finalOxygenVolPercent,
      x.oxygenAtSegmentVolPercent,
      BASS2_TABLE51_DOCUMENT,
      x.citationLocator,
      x.sourceUrl,
      x.originType,
      x.verificationStatus,
    ]
      .map((cell) => csvCell(cell))
      .join(',')
  );
  return [header.map(csvCell).join(','), ...lines].join('\n');
}

/** Static NASA-report finding summaries with exact traceable locators. */
export const BASS2_RESEARCH_INSIGHTS = [
  {
    id: 'INSIGHT-BASS2-FLOW',
    title: 'Airflow and flame spread are related, but not isolated',
    statement:
      'NASA describes generally faster opposed-flow spread for higher flow velocity and thinner flat PMMA samples. This table includes stepwise airflow adjustments as oxygen also changed.',
    citation: 'NASA/TM-20210011385 Section 5.6, pp. 61–62; Table 5.1, p. 57',
    limitation:
      'This is a reported experimental trend, not an experimentally isolated causal coefficient.',
  },
  {
    id: 'INSIGHT-BASS2-O2',
    title: 'Oxygen measurements are not segment-level data',
    statement:
      'Only initial and final oxygen were available for each run in this section; the report describes interpolating oxygen within tests as an assumption.',
    citation: 'NASA/TM-20210011385 Section 5.4, p. 60',
    limitation:
      'Never assign a precise measured oxygen percentage to individual velocity segments.',
  },
  {
    id: 'INSIGHT-BASS2-MODEL',
    title: 'Model-to-measurement gaps are themselves useful evidence',
    statement:
      'The report states that its contemporaneous FDS calculations predicted higher flame-spread rates than the experimental observations.',
    citation: 'NASA/TM-20210011385 Sections 5.5–5.7, pp. 60–63',
    limitation:
      'This qualitative report finding does not establish a numerical prediction error for our app; no model-prediction time series has been ingested.',
  },
] as const;

export const BASS2_INSIGHT_SAFETY =
  'Associations from a small, related experimental series are descriptive. Do not infer an oxygen threshold, flame-extinction boundary, physical hazard ranking, or Moon/Mars fire behavior from these records alone.';

export const BASS2_EVIDENCE_SOURCE = {
  reportId: BASS2_TABLE51_DOCUMENT,
  locator: BASS2_TABLE51_LOCATOR,
  url: BASS2_TABLE51_URL,
};

// ============================================================================
// AEGIS SCIENTIFIC BRIEFING & MISSION-RELEVANCE RESEARCH BRIEFINGS
// ============================================================================

export type BriefingQuestionId = 'Q1_AIRFLOW_TREND' | 'Q2_PARTIAL_GRAVITY' | 'Q3_SPACECRAFT_MATERIALS';

export interface ScientificBriefingResponse {
  id: BriefingQuestionId;
  question: string;
  shortTitle: string;
  observations: string[];
  patternSummary: string;
  contradictionsOrExceptions: string[];
  confoundersAndMissingData: string[];
  conclusion: string;
  remainingUncertainty: string;
  evidenceChain: Array<{
    stage: 'SOURCE' | 'EXPERIMENT' | 'MEASUREMENT' | 'CLAIM' | 'INTERPRETATION' | 'RECOMMENDATION';
    detail: string;
    locator: string;
    url: string;
  }>;
  safetyBoundary: string;
}

export function buildScientificBriefings(
  records: ExperimentRecord[]
): ScientificBriefingResponse[] {
  const summary = computeBass2Summary();
  const m3 = BASS2_TESTS.find((t) => t.id === 'M3');
  const rankedMaterials = rankExperimentsForContext(records, 'ISS_HABITAT').slice(0, 4);
  const topIdsText = rankedMaterials
    .map(
      (r) =>
        `${r.record.experimentId} (relevance=${r.breakdown.overallRelevanceIndex}, completeness=${Math.round(r.breakdown.completenessScore * 100)}%)`
    )
    .join('; ');

  return [
    {
      id: 'Q1_AIRFLOW_TREND',
      shortTitle: 'Q1 · Airflow & Flame Spread (M3 Exception)',
      question:
        "Does increasing airflow always increase flame-spread rate in NASA's BASS-II experiments?",
      observations: [
        `NASA/TM-20210011385 Table 5.1 (p. 57) records ${summary.sampleTests} flat cast black PMMA test samples (M1–M20) spanning ${summary.reportedVelocityConditions} opposed-flow velocity segments, with ${summary.numericSpreadObservations} numeric spread rates and ${summary.noTrackedRateSegments} untracked segments (${summary.testWithMissingRates.join(', ')}).`,
        `Among the ${summary.assessableMultiConditionTests} multi-velocity tests with >=2 distinct tracked velocities, ${summary.alignedWithinTest} show nondecreasing spread rate with higher airflow (e.g., M16: 0.1062 -> 0.1309 -> 0.144 mm/s as velocity increased 2 -> 3 -> 5 cm/s).`,
        m3
          ? `Counterexample M3 (${m3.thicknessMm} mm thick, ${m3.widthCm} cm wide, ${m3.burningSides}-sided): at ${m3.velocitiesCmPerSecond[0]} cm/s spread was ${m3.spreadRatesMmPerSecond[0]} mm/s; at ${m3.velocitiesCmPerSecond[1]} cm/s spread was ${m3.spreadRatesMmPerSecond[1]} mm/s.`
          : 'M3 shows lower spread rate at 20 cm/s than at 10 cm/s.',
      ],
      patternSummary: `Descriptive within-test directional check: ${summary.alignedWithinTest} of ${summary.assessableMultiConditionTests} assessable multi-velocity tests align monotonically upward; ${summary.nonalignedWithinTest} (${m3?.id ?? 'M3'}) does not.`,
      contradictionsOrExceptions: [
        'Test M3 exhibits a lower reported spread rate at 20 cm/s (0.024 mm/s) than at 10 cm/s (0.029 mm/s).',
        'Section 5.5–5.7 (pp. 60–63) also documents that contemporaneous FDS simulations overpredicted spread rates relative to observed BASS-II PMMA measurements.',
      ],
      confoundersAndMissingData: [
        'Chamber O2 dropped across every stepped burn (in M3, 20.8 vol% initial -> 19.7 vol% final over 20.1 min), and Table 5.1 does not tabulate per-segment O2.',
        'Repeated velocity steps on a single sample are dependent sequential observations, not 39 independent fire trials.',
        'Table 5.1 omits per-run error bounds (uncertainty = null).',
      ],
      conclusion:
        'No — higher airflow does not universally yield faster reported flame spread across all Table 5.1 test segments, and even the 12/13 directional alignment is confounded by changing chamber oxygen, sample thickness, and sequential preheating.',
      remainingUncertainty:
        'Isolating a pure velocity coefficient requires time-resolved O2 concentration, heat-loss history, and uncertainty intervals from primary NASA PSI telemetry.',
      evidenceChain: [
        {
          stage: 'SOURCE',
          detail: 'NASA/TM-20210011385 (BASS-II Summary Report, Oct 2021)',
          locator: 'SRC-NTRS-20210011385',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'EXPERIMENT',
          detail: '20 PMMA runs M1–M20 in 7.6×7.6×17 cm MSG duct (focus: M3, 5 mm, 1-sided)',
          locator: 'Sec. 1.1 & Table 5.1, pp. 3, 57',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'MEASUREMENT',
          detail: 'M3: 10 cm/s -> 0.029 mm/s; 20 cm/s -> 0.024 mm/s (O2 20.8% -> 19.7%)',
          locator: 'Table 5.1 (M3), printed p. 57',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'CLAIM',
          detail: '12/13 multi-velocity tests align monotonically upward; 1 exception (M3).',
          locator: 'bass2Insights.ts (computed deterministically)',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'INTERPRETATION',
          detail: 'Directional alignment cannot isolate flow causation while O2 and preheating vary.',
          locator: 'Sec. 5.4 & 5.6, pp. 60–62',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'RECOMMENDATION',
          detail: 'Ingest time-resolved PSI-25 O2 & flame-front video before calibrating reduced-order velocity curves.',
          locator: 'PSI-25 Investigation Portal',
          url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
        },
      ],
      safetyBoundary:
        'Descriptive research triage only. Does not establish an extinction boundary, ventilation safety limit, or material flight qualification.',
    },
    {
      id: 'Q2_PARTIAL_GRAVITY',
      shortTitle: 'Q2 · ISS 0 g vs Moon (0.165 g) & Mars (0.38 g)',
      question:
        'Can ISS microgravity combustion experiments directly predict fire safety on the Moon or Mars?',
      observations: [
        'BASS-II (NASA/TM-20210011385) and Saffire-I (PSI-98) were conducted in ~0 g microgravity (ISS Microgravity Science Glovebox and Cygnus spacecraft), where buoyancy-driven natural convection is negligible.',
        'At 0.165 g (Lunar) and 0.38 g (Martian), weak buoyant flow re-emerges and interacts with forced habitat ventilation, altering plume geometry, heat feedback, and smoke stratification.',
        'No empirical Lunar or Martian partial-gravity combustion test data exist in the active NASA catalog.',
      ],
      patternSummary:
        'Zero empirical partial-gravity matches in workspace; 0 g data provide lower-bound buoyant flow baseline context only.',
      contradictionsOrExceptions: [
        'In BASS-II Sec. 1.4–1.5, under-ventilated microgravity burning already yielded Φ_global = 1.3 and elevated CO/CO2 (370–550 ppm per 1% CO2); partial-gravity mixing changes gas residence time and cannot be assumed identical.',
      ],
      confoundersAndMissingData: [
        'Missing partial-gravity flame-spread, limiting oxygen index (LOI), and upward/concurrent vs opposed-flow transition measurements at 0.165 g and 0.38 g.',
        'No gravity-scaling correction factor is implemented in SPECULATRON or Digital Twin V1 (gravity selector changes UI context label only).',
      ],
      conclusion:
        'No — 0 g ISS and Cygnus experiments cannot directly validate or predict combustion behavior or material fire safety in 0.165 g lunar or 0.38 g Martian environments.',
      remainingUncertainty:
        'Critical gap requires dedicated partial-gravity drop/centrifuge/flight datasets (with exploration atmospheres such as 34% O2 / 56.5 kPa) before calibrating any predictive model.',
      evidenceChain: [
        {
          stage: 'SOURCE',
          detail: 'NASA/TM-20210011385 & OCHMO-TB-008 Fire Protection Technical Brief',
          locator: 'SRC-NTRS-20210011385 / SRC-NASA-OCHMO-TB-008',
          url: 'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-008-fire-protection.pdf',
        },
        {
          stage: 'EXPERIMENT',
          detail: 'ISS MSG 0 g duct (BASS-II) and Cygnus 0 g large duct (Saffire-I)',
          locator: 'INV-BASS-II & INV-SAFFIRE-I',
          url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-98',
        },
        {
          stage: 'MEASUREMENT',
          detail: 'BASS-II Φ_global = 1.3; 0 partial-gravity numeric runs in catalog',
          locator: 'Sec. 1.5, pp. 10–11',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'CLAIM',
          detail: 'Partial-gravity buoyant transition is unmeasured in bundled 0 g records.',
          locator: 'METHODOLOGY.md Sec. 3',
          url: 'https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-008-fire-protection.pdf',
        },
        {
          stage: 'INTERPRETATION',
          detail: 'AegisμG explicitly bars fabricated gravity multipliers; relevance scores penalize 0 g -> Moon/Mars alignment.',
          locator: 'scoring.ts (S_env = 0.55 for 0 g on Moon/Mars)',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'RECOMMENDATION',
          detail: 'Design partial-gravity (0.165 g / 0.38 g) benchmark tests at target exploration cabin pressure/O2 before habitat material qualification.',
          locator: 'ROADMAP.md',
          url: 'https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/',
        },
      ],
      safetyBoundary:
        'Never extrapolate ISS 0 g relevance scores or exploratory 0D oxygen curves to Lunar or Martian spacecraft safety certifications.',
    },
    {
      id: 'Q3_SPACECRAFT_MATERIALS',
      shortTitle: 'Q3 · Most Useful Evidence for Spacecraft Materials Research',
      question:
        'Which NASA combustion evidence would be most useful when researching spacecraft materials?',
      observations: [
        `Top deterministic ISS research relevance rankings in active workspace: ${topIdsText || 'BASS-II NTRS report & Table 5.1 runs'}.`,
        'BASS-II (NASA/TM-20210011385) provides quantitative PMMA (1–5 mm, Table 5.1) and SIBAL cotton-fiberglass fabric (Table 7.1) observations plus Huggett calorimetry (13.1 kJ/g O2) and CO/CO2 yields.',
        'Saffire-I (PSI-98) provides large-scale spacecraft duct context beyond small MSG glovebox wall-loss regimes, while OCHMO-TB-008 supplies programmatic fire protection context.',
      ],
      patternSummary:
        'BASS-II provides the highest extracted parameter completeness (spread rate, flow, O2 start/end, thickness, sides), while Saffire-I and FLEX/ACME supply essential scale and fuel-phase diversity.',
      contradictionsOrExceptions: [
        'Small MSG duct tests (7.6×7.6 cm, BASS-II) cannot be directly equated to large-scale open/ducted habitats (Saffire-I) without accounting for wall heat losses and O2 depletion.',
        'Table 7.1 flags GMT45-T1/T2 O2 readings as potentially inaccurate (footnote b), and steady spread rates are plotted only in Fig. 7.4.',
      ],
      confoundersAndMissingData: [
        'Bundled catalog entries for FLEX, FLEX-2, SAME, ACME, and raw PSI-25/PSI-98 sensor streams have reportedValue = null until researchers import downloadable PSI CSV archives.',
        'Per-run measurement error bars are not tabulated in Table 5.1 or Table 7.1.',
      ],
      conclusion:
        'Combine BASS-II Table 5.1/7.1 source-matched records for small-scale solid-material parametric insight with imported Saffire-I (PSI-98) telemetry for large-scale ventilation realism—while keeping missing PSI values explicitly uninterpolated.',
      remainingUncertainty:
        'Raw time-resolved PSI CSV telemetry (radiometry, thermocouple, gas-analyzer uncertainty) is the highest-value next dataset for material screening research.',
      evidenceChain: [
        {
          stage: 'SOURCE',
          detail: 'NTRS 20210011385 + NASA PSI-25 + NASA PSI-98 + OCHMO-TB-008',
          locator: 'SOURCES.md (8 verified URLs)',
          url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-25',
        },
        {
          stage: 'EXPERIMENT',
          detail: 'BASS-II PMMA & SIBAL runs + Saffire-I Cygnus duct + OCHMO guidance',
          locator: '16 catalog records + 20 Table 5.1 tests',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'MEASUREMENT',
          detail: 'PMMA spread 0.012–0.144 mm/s; HRR <100 W typical; CO 370–550 ppm/% CO2',
          locator: 'Sec. 1.4–1.5 & Table 5.1, pp. 7–11, 57',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'CLAIM',
          detail: 'Completeness-gated ranking prioritizes BASS-II records solely due to verified parameter density, not higher material risk.',
          locator: 'scoring.ts (R formula)',
          url: BASS2_TABLE51_URL,
        },
        {
          stage: 'INTERPRETATION',
          detail: 'Scale (MSG vs Cygnus) and missing PSI telemetry prevent direct cross-facility equivalence.',
          locator: 'comparator.ts compatibility warnings',
          url: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-98',
        },
        {
          stage: 'RECOMMENDATION',
          detail: 'Download PSI-25 and PSI-98 CSV packages into Section C (Data Import) to promote unextracted catalog entries.',
          locator: 'Data Import & Validation Module',
          url: 'https://psi.nasa.gov/physci/repo/',
        },
      ],
      safetyBoundary:
        'Research triage ranking only; spacecraft flight material acceptance requires official NASA-STD-6001 / program qualification testing.',
    },
  ];
}

export interface MissionBriefingProfile {
  context: ApplicationContext;
  title: string;
  gravityLabel: string;
  relevantStudies: string;
  measuredVariables: string;
  preliminaryContext: string;
  nonTransferableAssumptions: string;
  missingValidationData: string;
  proposedResearchPriorities: string[];
}

export const MISSION_RESEARCH_BRIEFINGS: ReadonlyArray<MissionBriefingProfile> = [
  {
    context: 'ISS_HABITAT',
    title: 'ISS / Spacecraft Habitat',
    gravityLabel: '0 g continuous microgravity (~21% O2, 101.3 kPa)',
    relevantStudies: 'BASS-II (NASA/TM-20210011385), BASS, Saffire-I (PSI-98), FLEX/FLEX-2, SAME, ACME, OCHMO-TB-008',
    measuredVariables: 'Opposed/concurrent flame spread (mm/s), burn time (min), start/end O2 (vol%), duct flow velocity (cm/s), CO/CO2 stoichiometry & smoke aerosol metadata',
    preliminaryContext: 'Demonstrates persistent low-velocity opposed-flow spread at depressed O2 (e.g., M20 at 18.0% O2), under-ventilated CO yield (Φ_global = 1.3), and scale differences between MSG duct and Cygnus Saffire-I.',
    nonTransferableAssumptions: 'Small 7.6×7.6 cm MSG duct heat losses and closed-glovebox O2 depletion cannot represent open multi-rack ISS modules without flow/scale modeling.',
    missingValidationData: 'Per-segment O2 in BASS-II Table 5.1, tabulated error bars, and raw PSI-25/PSI-98 time-series telemetry.',
    proposedResearchPriorities: [
      'Ingest time-resolved PSI-25 & PSI-98 gas-analyzer and camera-tracking CSV bundles.',
      'Quantify low-velocity (<10 cm/s) spread uncertainty and CO/CO2 sensor saturation limits.',
    ],
  },
  {
    context: 'PRESSURIZED_ROVER',
    title: 'Pressurized Lunar Rover',
    gravityLabel: '0.165 g surface operations + elevated O2 / reduced pressure exploration atmospheres',
    relevantStudies: 'BASS-II (O2 sensitivity context), Saffire-I (enclosed-volume ventilation), OCHMO-TB-008',
    measuredVariables: '0 g O2-enriched/depleted solid combustion (16.4–22.2% O2 at ambient pressure in BASS-II); no rover exploration atmosphere (~34% O2 / 56.5 kPa) runs ingested',
    preliminaryContext: 'Highlights sensitivity of combustion products and heat release (<100 W typical in BASS-II) to fresh-gas vs recirculated ventilation and compartment volume.',
    nonTransferableAssumptions: '0 g CSTR O2 depletion at 101.3 kPa does not transfer directly to partial-gravity, reduced-pressure, elevated-O2 rover cabins.',
    missingValidationData: 'Combined 0.165 g + elevated-O2/reduced-pressure flammability limits and tight-enclosure CO buildup rates.',
    proposedResearchPriorities: [
      'Prioritize combined elevated-O2 / reduced-pressure flammability studies and cabin CO toxicity time-series.',
      'Separate fresh-gas exchange from internal avionics recirculation in experimental test matrices.',
    ],
  },
  {
    context: 'LUNAR_HABITAT',
    title: 'Lunar Habitat',
    gravityLabel: '0.165 g partial gravity (unmeasured in bundled 0 g catalog)',
    relevantStudies: 'BASS-II, Saffire-I, FLEX, OCHMO-TB-008 (baseline 0 g context only)',
    measuredVariables: '0 g solid PMMA/SIBAL flame spread and duct calorimetry only; 0 empirical 0.165 g measurements present',
    preliminaryContext: 'Identifies key variables controlling solid-material flame spread (material thickness 1–5 mm, one- vs two-sided geometry, airflow, O2 concentration).',
    nonTransferableAssumptions: 'Absence of buoyancy in 0 g omits weak Rayleigh-driven natural convection and upward plume acceleration expected at 0.165 g.',
    missingValidationData: 'Empirical 0.165 g ignition, flame-spread, and smoke stratification datasets across orientation angles.',
    proposedResearchPriorities: [
      'Acquire partial-gravity (0.165 g) experimental data on thin/thick spacecraft polymers.',
      'Evaluate upward vs downward vs horizontal spread transitions under weak buoyancy.',
    ],
  },
  {
    context: 'MARTIAN_HABITAT',
    title: 'Martian Habitat',
    gravityLabel: '0.38 g partial gravity (unmeasured in bundled 0 g catalog)',
    relevantStudies: 'BASS-II, Saffire-I, ACME, OCHMO-TB-008 (baseline 0 g context only)',
    measuredVariables: '0 g solid & gaseous combustion baselines only; 0 empirical 0.38 g measurements present',
    preliminaryContext: 'Establishes importance of multi-parameter tracking (CO, CO2, soot/aerosol SAME context, wall heat loss) and explicit uncertainty reporting.',
    nonTransferableAssumptions: 'At 0.38 g, buoyant plumes approach stronger mixed-convection regimes between 0 g and 1 g; 0 g rules cannot be extrapolated.',
    missingValidationData: '0.38 g mixed-convection flame spread, extinguishing airflow thresholds, and smoke-detector response characterization.',
    proposedResearchPriorities: [
      'Quantify mixed-convection (0.38 g buoyant + forced ventilation) spread regimes via dedicated tests.',
      'Benchmark combustion sensor placement (smoke aerosol vs CO) under partial-gravity stratification.',
    ],
  },
];

export function exportScientificBriefingMarkdown(
  briefings: ReadonlyArray<ScientificBriefingResponse>,
  records: ExperimentRecord[]
): string {
  const summary = computeBass2Summary();
  const lines: string[] = [
    '# AegisμG — Interactive Scientific Briefing Report',
    '',
    `- **Generated:** ${new Date().toISOString()}`,
    '- **Team / Prototype:** SPECULATRON AI · AegisμG (Independent, unofficial research prototype)',
    `- **Primary NASA Source:** NASA/TM-20210011385 (${BASS2_TABLE51_URL})`,
    `- **Catalog & Atlas Coverage:** ${records.length} core catalog records; ${summary.sampleTests} BASS-II Table 5.1 tests (${summary.reportedVelocityConditions} velocity segments, ${summary.numericSpreadObservations} numeric spread rates, ${summary.noTrackedRateSegments} untracked null rates).`,
    '- **Disclaimer:** Research triage & provenance audit only. Not NASA endorsement, fire risk forecast, or material certification.',
    '',
  ];

  for (const b of briefings) {
    lines.push(`## ${b.shortTitle}`);
    lines.push(`**Question:** ${b.question}`);
    lines.push('');
    lines.push(`**Pattern Summary:** ${b.patternSummary}`);
    lines.push('');
    lines.push('### NASA Observations');
    for (const o of b.observations) lines.push(`- ${o}`);
    lines.push('');
    lines.push('### Exceptions & Contradictions');
    for (const c of b.contradictionsOrExceptions) lines.push(`- ${c}`);
    lines.push('');
    lines.push('### Confounders & Missing Data');
    for (const m of b.confoundersAndMissingData) lines.push(`- ${m}`);
    lines.push('');
    lines.push(`**Scientific Conclusion:** ${b.conclusion}`);
    lines.push(`**Remaining Uncertainty:** ${b.remainingUncertainty}`);
    lines.push(`**Safety Boundary:** ${b.safetyBoundary}`);
    lines.push('');
    lines.push('### Traceable Evidence Chain (SOURCE → RECOMMENDATION)');
    for (const step of b.evidenceChain) {
      lines.push(`- **${step.stage}:** ${step.detail} (\`${step.locator}\`) — ${step.url}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
