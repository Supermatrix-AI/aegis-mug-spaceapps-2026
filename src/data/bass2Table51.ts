/**
 * Source-matched NASA BASS-II Table 5.1 — complete 20-test PMMA matrix.
 * NASA/TM-20210011385, printed page 57, Section 5.
 *
 * SOURCE_REPORTED values, manually transcribed from the source table.
 * IMPORTANT: A test may have multiple sequential velocities/spread values.
 * Those segment observations are NOT independent test runs.
 * Only start/end oxygen was reported in Table 5.1, NOT oxygen per segment.
 * "Not tracked" is preserved as null for M6 and M12.
 */

export const BASS2_TABLE51_URL = 'https://ntrs.nasa.gov/citations/20210011385';
export const BASS2_TABLE51_DOCUMENT = 'NASA/TM-20210011385';
export const BASS2_TABLE51_LOCATOR = 'Table 5.1, printed p. 57';

export interface Bass2Test {
  id: string;
  thicknessMm: number;
  widthCm: number;
  burningSides: 1 | 2;
  velocitiesCmPerSecond: number[];
  spreadRatesMmPerSecond: (number | null)[];
  burnMinutes: number;
  initialOxygenVolPercent: number;
  finalOxygenVolPercent: number;
}

export interface Bass2Segment {
  id: string;
  testId: string;
  segmentNumber: number;
  velocityCmPerSecond: number;
  spreadRateMmPerSecond: number | null;
  thicknessMm: number;
  widthCm: number;
  burningSides: 1 | 2;
  burnMinutes: number;
  initialOxygenVolPercent: number;
  finalOxygenVolPercent: number;
  oxygenAtSegmentVolPercent: null;
  sourceId: 'SRC-NTRS-20210011385';
  sourceUrl: string;
  citationLocator: string;
  originType: 'SOURCE_REPORTED';
  verificationStatus: 'SOURCE_MATCHED';
}

export const BASS2_TESTS: ReadonlyArray<Bass2Test> = [
  { id: 'M1', thicknessMm: 1, widthCm: 2.2, burningSides: 1, velocitiesCmPerSecond: [9], spreadRatesMmPerSecond: [0.071], burnMinutes: 6.4, initialOxygenVolPercent: 22.2, finalOxygenVolPercent: 21.9 },
  { id: 'M2', thicknessMm: 3, widthCm: 2.2, burningSides: 1, velocitiesCmPerSecond: [20, 15], spreadRatesMmPerSecond: [0.052, 0.033], burnMinutes: 22.9, initialOxygenVolPercent: 22.2, finalOxygenVolPercent: 21.2 },
  { id: 'M3', thicknessMm: 5, widthCm: 2.2, burningSides: 1, velocitiesCmPerSecond: [10, 20], spreadRatesMmPerSecond: [0.029, 0.024], burnMinutes: 20.1, initialOxygenVolPercent: 20.8, finalOxygenVolPercent: 19.7 },
  { id: 'M4', thicknessMm: 5, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [5, 3], spreadRatesMmPerSecond: [0.045, 0.033], burnMinutes: 19.8, initialOxygenVolPercent: 21.8, finalOxygenVolPercent: 19.8 },
  { id: 'M5', thicknessMm: 3, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [10], spreadRatesMmPerSecond: [0.071], burnMinutes: 27.2, initialOxygenVolPercent: 22.2, finalOxygenVolPercent: 19.0 },
  { id: 'M6', thicknessMm: 1, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [10, 8], spreadRatesMmPerSecond: [null, null], burnMinutes: 16.8, initialOxygenVolPercent: 21.8, finalOxygenVolPercent: 20.7 },
  { id: 'M7', thicknessMm: 1, widthCm: 1.2, burningSides: 2, velocitiesCmPerSecond: [10, 6, 5, 3], spreadRatesMmPerSecond: [0.106, 0.099, 0.083, 0.07], burnMinutes: 18.4, initialOxygenVolPercent: 18.9, finalOxygenVolPercent: 18.4 },
  { id: 'M8', thicknessMm: 2, widthCm: 1.2, burningSides: 2, velocitiesCmPerSecond: [10, 6, 5], spreadRatesMmPerSecond: [0.057, 0.056, 0.04], burnMinutes: 25.2, initialOxygenVolPercent: 19.1, finalOxygenVolPercent: 18.2 },
  { id: 'M9', thicknessMm: 3, widthCm: 1.2, burningSides: 2, velocitiesCmPerSecond: [14], spreadRatesMmPerSecond: [0.025], burnMinutes: 16.8, initialOxygenVolPercent: 18.0, finalOxygenVolPercent: 17.6 },
  { id: 'M10', thicknessMm: 4, widthCm: 1.2, burningSides: 2, velocitiesCmPerSecond: [15, 10], spreadRatesMmPerSecond: [0.0373, 0.03], burnMinutes: 30.5, initialOxygenVolPercent: 20.1, finalOxygenVolPercent: 18.6 },
  { id: 'M11', thicknessMm: 5, widthCm: 1.2, burningSides: 2, velocitiesCmPerSecond: [21, 15, 13], spreadRatesMmPerSecond: [0.048, 0.028, 0.022], burnMinutes: 28.5, initialOxygenVolPercent: 20.0, finalOxygenVolPercent: 18.5 },
  { id: 'M12', thicknessMm: 2, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [12, 10], spreadRatesMmPerSecond: [null, null], burnMinutes: 16.2, initialOxygenVolPercent: 21.7, finalOxygenVolPercent: 20.4 },
  { id: 'M13', thicknessMm: 4, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [6, 5, 4], spreadRatesMmPerSecond: [0.047, 0.035, 0.033], burnMinutes: 20.5, initialOxygenVolPercent: 20.8, finalOxygenVolPercent: 19.0 },
  { id: 'M14', thicknessMm: 2, widthCm: 2.2, burningSides: 1, velocitiesCmPerSecond: [15, 14, 10], spreadRatesMmPerSecond: [0.0624, 0.055, 0.0353], burnMinutes: 15.4, initialOxygenVolPercent: 22.2, finalOxygenVolPercent: 21.6 },
  { id: 'M15', thicknessMm: 4, widthCm: 2.2, burningSides: 1, velocitiesCmPerSecond: [20], spreadRatesMmPerSecond: [0.045], burnMinutes: 22.0, initialOxygenVolPercent: 21.0, finalOxygenVolPercent: 20.0 },
  { id: 'M16', thicknessMm: 1, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [5, 3, 2], spreadRatesMmPerSecond: [0.144, 0.1309, 0.1062], burnMinutes: 8.4, initialOxygenVolPercent: 19.2, finalOxygenVolPercent: 18.7 },
  { id: 'M17', thicknessMm: 2, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [5, 4, 3], spreadRatesMmPerSecond: [0.053, 0.042, 0.026], burnMinutes: 30.7, initialOxygenVolPercent: 18.8, finalOxygenVolPercent: 17.1 },
  { id: 'M18', thicknessMm: 3, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [10, 8], spreadRatesMmPerSecond: [0.026, 0.013], burnMinutes: 25.5, initialOxygenVolPercent: 17.9, finalOxygenVolPercent: 16.8 },
  { id: 'M19', thicknessMm: 4, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [10, 6], spreadRatesMmPerSecond: [0.027, 0.0159], burnMinutes: 25.7, initialOxygenVolPercent: 19.0, finalOxygenVolPercent: 17.4 },
  { id: 'M20', thicknessMm: 5, widthCm: 2.2, burningSides: 2, velocitiesCmPerSecond: [10], spreadRatesMmPerSecond: [0.012], burnMinutes: 16.5, initialOxygenVolPercent: 18.0, finalOxygenVolPercent: 17.4 },
];

export const BASS2_SEGMENTS: ReadonlyArray<Bass2Segment> = BASS2_TESTS.flatMap((test) =>
  test.velocitiesCmPerSecond.map((velocity, index) => ({
    id: `${test.id}-S${index + 1}`,
    testId: test.id,
    segmentNumber: index + 1,
    velocityCmPerSecond: velocity,
    spreadRateMmPerSecond: test.spreadRatesMmPerSecond[index] ?? null,
    thicknessMm: test.thicknessMm,
    widthCm: test.widthCm,
    burningSides: test.burningSides,
    burnMinutes: test.burnMinutes,
    initialOxygenVolPercent: test.initialOxygenVolPercent,
    finalOxygenVolPercent: test.finalOxygenVolPercent,
    oxygenAtSegmentVolPercent: null,
    sourceId: 'SRC-NTRS-20210011385' as const,
    sourceUrl: BASS2_TABLE51_URL,
    citationLocator: `${BASS2_TABLE51_LOCATOR} (${test.id})`,
    originType: 'SOURCE_REPORTED' as const,
    verificationStatus: 'SOURCE_MATCHED' as const,
  }))
);

/** Report an error if a manually curated source row loses alignment. */
export function validateBass2Table(): string[] {
  const errors: string[] = [];
  if (BASS2_TESTS.length !== 20) errors.push('Expected exactly 20 source test rows.');
  const ids = new Set<string>();
  for (const t of BASS2_TESTS) {
    if (ids.has(t.id)) errors.push(`Duplicate source test ${t.id}`);
    ids.add(t.id);
    if (t.velocitiesCmPerSecond.length !== t.spreadRatesMmPerSecond.length) {
      errors.push(`Velocity/rate pair alignment failed for ${t.id}`);
    }
    if (t.initialOxygenVolPercent < t.finalOxygenVolPercent) {
      errors.push(`Unexpected oxygen increase in ${t.id}`);
    }
    if (t.spreadRatesMmPerSecond.some((x) => x !== null && (!Number.isFinite(x) || x < 0))) {
      errors.push(`Invalid spread measurement in ${t.id}`);
    }
  }
  return errors;
}

/** Only the test-initial and test-final oxygen values are available. */
export const BASS2_TABLE51_LIMITATION =
  'Table 5.1 provides oxygen only at the beginning and end of each test, not at each airflow segment. ' +
  'Within-run oxygen and other experimental conditions can change; segment comparisons are descriptive, NOT controlled causal estimates. ' +
  'Multiple segments from one sample must not be counted as independent test runs.';
