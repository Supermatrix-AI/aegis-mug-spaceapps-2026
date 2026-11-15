import { describe, expect, it } from 'vitest';
import { BASS2_SEGMENTS } from '../data/bass2Table51.ts';
import { INITIAL_EXPERIMENT_RECORDS } from '../data/nasaCatalog.ts';
import {
  answerResearchQuestion,
  buildEvidenceGapMap,
  computeReliabilityScorecard,
  exportGapMapCsv,
  inspectBass2Segment,
  inspectExperimentRecord,
  SUGGESTED_EXPLORER_QUESTIONS,
  validateNumericTraceability,
} from '../utils/evidenceEngine.ts';

describe('AegisμG Evidence Integrity, Gap Map, Question Explorer & Scorecard', () => {
  it('1. Maps record & segment provenance accurately and flags NEEDS_SOURCE_CHECK when ungrounded', () => {
    const m1 = INITIAL_EXPERIMENT_RECORDS.find((r) => r.experimentId === 'EXP-BASS2-M1')!;
    const inspectedM1 = inspectExperimentRecord(m1);
    expect(inspectedM1.classification).toBe('NASA_OBSERVED');
    expect(inspectedM1.needsSourceCheck).toBe(false);
    expect(inspectedM1.evidenceChain.map((s) => s.stage)).toEqual([
      'NASA SOURCE',
      'EXPERIMENT',
      'MEASUREMENT',
      'DERIVED ANALYSIS',
      'INTERPRETATION',
      'RESEARCH RECOMMENDATION',
    ]);

    const derivedSummary = INITIAL_EXPERIMENT_RECORDS.find(
      (r) => r.experimentId === 'EXP-BASS-II-NTRS-2021'
    )!;
    expect(inspectExperimentRecord(derivedSummary).classification).toBe('DERIVED');

    // Table 5.1 M3 segment is NASA_OBSERVED; M6 segment (Not tracked) is UNVERIFIED with null preserved
    const m3Seg = BASS2_SEGMENTS.find((s) => s.id === 'M3-S1')!;
    const m6Seg = BASS2_SEGMENTS.find((s) => s.id === 'M6-S1')!;
    expect(inspectBass2Segment(m3Seg).classification).toBe('NASA_OBSERVED');
    expect(inspectBass2Segment(m6Seg).classification).toBe('UNVERIFIED');

    // Reject numeric claim missing locator or approved domain
    const missingLoc = validateNumericTraceability({
      reportedValue: 0.05,
      units: 'mm/s',
      citationLocator: null,
      sourceUrl: 'https://ntrs.nasa.gov/citations/20210011385',
      originType: 'SOURCE_REPORTED',
    });
    expect(missingLoc.valid).toBe(false);
    expect(missingLoc.reason).toContain('NEEDS_SOURCE_CHECK');

    const badDomain = validateNumericTraceability({
      reportedValue: 0.05,
      units: 'mm/s',
      citationLocator: 'Table 5.1, p. 57',
      sourceUrl: 'https://unverified.example.org/data',
      originType: 'SOURCE_REPORTED',
    });
    expect(badDomain.valid).toBe(false);
  });

  it('2. Builds Evidence Gap & Applicability Map with zero fabricated partial-gravity or PSI counts', () => {
    const gaps = buildEvidenceGapMap(INITIAL_EXPERIMENT_RECORDS);
    const pmma = gaps.find((g) => g.id === 'GAP-MAT-PMMA')!;
    expect(pmma.status).toBe('OBSERVED');
    expect(pmma.testCount).toBe(20);
    expect(pmma.observationCount).toBe(39);

    const flex = gaps.find((g) => g.id === 'GAP-MAT-FLEX')!;
    expect(flex.status).toBe('SOURCE_METADATA_ONLY');
    expect(flex.observationCount).toBe(0);

    const segO2 = gaps.find((g) => g.id === 'GAP-O2-SEGMENT')!;
    const lunar = gaps.find((g) => g.id === 'GAP-GRAV-LUNAR')!;
    const mars = gaps.find((g) => g.id === 'GAP-GRAV-MARTIAN')!;
    expect(segO2.status).toBe('NO_MEASUREMENT');
    expect(lunar.status).toBe('NO_MEASUREMENT');
    expect(mars.status).toBe('NO_MEASUREMENT');

    const twin = gaps.find((g) => g.id === 'GAP-MODEL-TWIN')!;
    expect(twin.status).toBe('HYPOTHETICAL_MODEL');

    const csv = exportGapMapCsv(gaps);
    expect(csv).toContain('NO_MEASUREMENT');
    expect(csv).toContain('GAP-GRAV-LUNAR');
  });

  it('3. Answers Q1–Q8 deterministically offline with verified NASA citations', () => {
    expect(SUGGESTED_EXPLORER_QUESTIONS).toHaveLength(8);
    for (const q of SUGGESTED_EXPLORER_QUESTIONS) {
      const res = answerResearchQuestion(q.question, INITIAL_EXPERIMENT_RECORDS);
      expect(res.status, `Failed to answer ${q.id}`).toBe('GROUNDED');
      expect(res.citationUrl).toBeTruthy();
      expect(res.verifiedObservation.length).toBeGreaterThan(20);
      expect(res.importantLimitations.length).toBeGreaterThan(20);
    }

    const m3Ans = answerResearchQuestion('What happened in BASS-II test M3?', INITIAL_EXPERIMENT_RECORDS);
    expect(m3Ans.verifiedObservation).toContain('0.029');
    expect(m3Ans.verifiedObservation).toContain('0.024');
  });

  it('4. Strictly abstains on unsupported predictions, safety certifications, or non-existent tests', () => {
    const queries = [
      'What is the critical oxygen concentration for a lunar habitat at 0.165 g?',
      'What is the exact flame spread rate on the Moon at 0.165 g?',
      'Certify PMMA safe for Martian habitats',
      'What did Apollo 99 combustion chamber measure?',
    ];
    for (const q of queries) {
      const res = answerResearchQuestion(q, INITIAL_EXPERIMENT_RECORDS);
      expect(res.status).toBe('INSUFFICIENT_EVIDENCE');
      expect(res.answerText).toBe('Insufficient verified NASA evidence for this conclusion.');
      expect(res.experimentId).toBeNull();
    }
  });

  it('5. Computes transparent Scientific Reliability Scorecard with explicit denominators and NOT VALIDATED status', () => {
    const score = computeReliabilityScorecard(INITIAL_EXPERIMENT_RECORDS, 8);
    expect(score.sourceDocumentsCount).toBe(8);
    expect(score.measuredObservationsCount).toBeGreaterThanOrEqual(39);
    expect(score.metadataOnlyCount).toBeGreaterThanOrEqual(7);
    expect(score.missingValuesCount).toBeGreaterThanOrEqual(67);
    expect(score.citationCoveragePct).toBe(100);
    expect(score.methodologyNotes.modelValidationStatus).toBe('NOT VALIDATED');
  });
});
