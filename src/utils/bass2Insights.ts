import {
  BASS2_TESTS, BASS2_SEGMENTS, BASS2_TABLE51_DOCUMENT, BASS2_TABLE51_LOCATOR,
  BASS2_TABLE51_URL,
} from '../data/bass2Table51.ts';
import type { Bass2Test, Bass2Segment } from '../data/bass2Table51.ts';

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
    .map((velocity, idx) => ({velocity, spread: t.spreadRatesMmPerSecond[idx]}))
    .filter((x): x is {velocity:number;spread:number} => x.spread !== null);
  const uniqueVelocities = new Set(observations.map(x=>x.velocity));
  if(observations.length < 2 || uniqueVelocities.size < 2) return {
    testId:t.id,status:'INSUFFICIENT',measuredSegments:observations.length,
    note:'Fewer than two numeric measurements at distinct airflow velocities.',
  };
  let mismatches = 0;
  let comparisons = 0;
  for(let i=0;i<observations.length;i++) for(let j=i+1;j<observations.length;j++) {
    const a=observations[i], b=observations[j];
    if(a.velocity === b.velocity) continue;
    comparisons++;
    if ((a.velocity - b.velocity) * (a.spread - b.spread) < -1e-9) mismatches++;
  }
  return {
    testId:t.id,
    status:mismatches?'NONALIGNED':'ALIGNED',
    measuredSegments:observations.length,
    note: mismatches
      ? 'At least one reported velocity/spread pair differs from a positive monotonic direction; review experimental context.'
      : 'Reported spread rates are nondecreasing with airflow across this test’s available pairs. Oxygen changed during the test, so causation is not established.',
  };
}

export function computeBass2Summary(tests: ReadonlyArray<Bass2Test> = BASS2_TESTS): Bass2AtlasSummary {
  const trends = tests.map(trendForTest);
  const reportedVelocityConditions = tests.reduce((n,t)=>n+t.velocitiesCmPerSecond.length,0);
  const numericSpreadObservations = tests.reduce((n,t)=>n+t.spreadRatesMmPerSecond.filter(v=>v!==null).length,0);
  return {
    sampleTests:tests.length,
    reportedVelocityConditions,
    numericSpreadObservations,
    noTrackedRateSegments:reportedVelocityConditions-numericSpreadObservations,
    multiConditionTests:tests.filter(t=>t.velocitiesCmPerSecond.length>1).length,
    assessableMultiConditionTests:trends.filter(x=>x.status!=='INSUFFICIENT').length,
    alignedWithinTest:trends.filter(x=>x.status==='ALIGNED').length,
    nonalignedWithinTest:trends.filter(x=>x.status==='NONALIGNED').length,
    testWithMissingRates:tests.filter(t=>t.spreadRatesMmPerSecond.some(x=>x===null)).map(t=>t.id),
    trends,
  };
}

function csvCell(value: string | number | null): string {
  if(value === null) return '';
  return '"' + String(value).replace(/"/g,'""') + '"';
}

/**
 * A traceable, non-synthetic CSV extraction of NASA Table 5.1.
 * Segment O2 is BLANK because it was not published in Table 5.1.
 */
export function exportBass2SegmentsCsv(segments: ReadonlyArray<Bass2Segment> = BASS2_SEGMENTS): string {
  const header = [
    'test_id','segment_id','velocity_cm_per_s','spread_rate_mm_per_s','thickness_mm',
    'width_cm','burning_sides','test_burn_minutes','test_initial_oxygen_vol_percent',
    'test_final_oxygen_vol_percent','oxygen_during_segment_NOT_REPORTED',
    'source_report','source_locator','source_url','origin_type','verification_status',
  ];
  const lines = segments.map(x => [
    x.testId,x.id,x.velocityCmPerSecond,x.spreadRateMmPerSecond,x.thicknessMm,
    x.widthCm,x.burningSides,x.burnMinutes,x.initialOxygenVolPercent,
    x.finalOxygenVolPercent,x.oxygenAtSegmentVolPercent,
    BASS2_TABLE51_DOCUMENT,x.citationLocator,x.sourceUrl,x.originType,x.verificationStatus,
  ].map(x=>csvCell(x)).join(','));
  return [header.map(csvCell).join(','),...lines].join('\n');
}

/** Static NASA-report finding summaries with exact traceable locators. */
export const BASS2_RESEARCH_INSIGHTS = [
  {
    id: 'INSIGHT-BASS2-FLOW',
    title: 'Airflow and flame spread are related, but not isolated',
    statement: 'NASA describes generally faster opposed-flow spread for higher flow velocity and thinner flat PMMA samples. This table includes stepwise airflow adjustments as oxygen also changed.',
    citation: 'NASA/TM-20210011385 Section 5.6, pp. 61–62; Table 5.1, p. 57',
    limitation: 'This is a reported experimental trend, not an experimentally isolated causal coefficient.',
  },
  {
    id: 'INSIGHT-BASS2-O2',
    title: 'Oxygen measurements are not segment-level data',
    statement: 'Only initial and final oxygen were available for each run in this section; the report describes interpolating oxygen within tests as an assumption.',
    citation: 'NASA/TM-20210011385 Section 5.4, p. 60',
    limitation: 'Never assign a precise measured oxygen percentage to individual velocity segments.',
  },
  {
    id: 'INSIGHT-BASS2-MODEL',
    title: 'Model-to-measurement gaps are themselves useful evidence',
    statement: 'The report states that its contemporaneous FDS calculations predicted higher flame-spread rates than the experimental observations.',
    citation: 'NASA/TM-20210011385 Sections 5.5–5.7, pp. 60–63',
    limitation: 'This qualitative report finding does not establish a numerical prediction error for our app; no model-prediction time series has been ingested.',
  },
] as const;

export const BASS2_INSIGHT_SAFETY =
 'Associations from a small, related experimental series are descriptive. Do not infer an oxygen threshold, flame-extinction boundary, physical hazard ranking, or Moon/Mars fire behavior from these records alone.';

export const BASS2_EVIDENCE_SOURCE = {
  reportId:BASS2_TABLE51_DOCUMENT,
  locator:BASS2_TABLE51_LOCATOR,
  url:BASS2_TABLE51_URL,
};
