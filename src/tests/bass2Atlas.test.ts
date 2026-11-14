import { describe, expect, it } from 'vitest';
import { INITIAL_EXPERIMENT_RECORDS } from '../data/nasaCatalog.ts';
import {
 BASS2_TESTS,BASS2_SEGMENTS,validateBass2Table,BASS2_TABLE51_URL,
} from '../data/bass2Table51.ts';
import {
 computeBass2Summary,trendForTest,exportBass2SegmentsCsv,BASS2_RESEARCH_INSIGHTS,
} from '../utils/bass2Insights.ts';

describe('BASS-II NASA Table 5.1 evidence atlas', () => {
  it('contains exactly the 20 NASA test rows M1–M20, with aligned reported velocity arrays', () => {
    expect(validateBass2Table()).toEqual([]);
    expect(BASS2_TESTS.map(t=>t.id)).toEqual(
      Array.from({length:20},(_,i)=>'M'+(i+1))
    );
    expect(BASS2_TESTS.length).toBe(20);
  });

  it('preserves 43 velocity conditions but only 39 numeric spread-rate observations', () => {
    const s=computeBass2Summary();
    expect(s.sampleTests).toBe(20);
    expect(s.reportedVelocityConditions).toBe(43);
    expect(s.numericSpreadObservations).toBe(39);
    expect(s.noTrackedRateSegments).toBe(4);
    expect(s.testWithMissingRates).toEqual(['M6','M12']);
    expect(BASS2_SEGMENTS.length).toBe(43);
  });

  it('preserves NASA published M1, M5, M9, M15, M20 values already in core catalog', () => {
    for(const [id,expected] of [
      ['M1',0.071],['M5',0.071],['M9',0.025],
      ['M15',0.045],['M20',0.012]
    ] as const){
      const t=BASS2_TESTS.find(v=>v.id===id);
      expect(t?.spreadRatesMmPerSecond).toEqual([expected]);
    }
  });

  it('does not invent missing flame spread for the M6/M12 NASA "Not tracked" rows', () => {
    for(const id of ['M6','M12']){
      const t=BASS2_TESTS.find(t=>t.id===id)!;
      expect(t.spreadRatesMmPerSecond.every(v=>v===null)).toBe(true);
    }
  });

  it('never invents oxygen values for individual velocity segments', () => {
    for(const s of BASS2_SEGMENTS){
      expect(s.oxygenAtSegmentVolPercent).toBeNull();
      expect(s.sourceUrl).toBe(BASS2_TABLE51_URL);
      expect(s.citationLocator).toContain('Table 5.1');
      expect(s.verificationStatus).toBe('SOURCE_MATCHED');
    }
  });

  it('reports the M3 non-monotonic counterexample instead of forcing a universal trend', () => {
    const m3=trendForTest(BASS2_TESTS.find(x=>x.id==='M3')!);
    expect(m3.status).toBe('NONALIGNED');
    const summary=computeBass2Summary();
    expect(summary.assessableMultiConditionTests).toBe(13);
    expect(summary.alignedWithinTest).toBe(12);
    expect(summary.nonalignedWithinTest).toBe(1);
    expect(trendForTest(BASS2_TESTS.find(x=>x.id==='M6')!).status).toBe('INSUFFICIENT');
  });

  it('exports all segments with source locators and blank oxygen-at-segment fields', () => {
    const csv=exportBass2SegmentsCsv();
    expect(csv.split('\n')).toHaveLength(44);
    expect(csv).toContain('oxygen_during_segment_NOT_REPORTED');
    expect(csv).toContain('NASA/TM-20210011385');
    expect(csv).toContain('M20');
    expect(csv).toContain('SOURCE_REPORTED');
    expect(csv).toContain('SOURCE_MATCHED');
    expect(csv).toContain('""'); // explicit CSV empty field for unknown oxygen and missing rates
  });

  it('matches all five existing source-reported core PMMA runs without silently altering them', () => {
    for (const t of BASS2_TESTS.filter(t=>[1,5,9,15,20].includes(Number(t.id.slice(1))))) {
      const current=INITIAL_EXPERIMENT_RECORDS.find(r=>r.experimentId==='EXP-BASS2-'+t.id);
      expect(current, 'Core record missing for '+t.id).toBeDefined();
      expect(current?.oxygenPercent).toBe(t.initialOxygenVolPercent);
      expect(current?.airflowVelocity).toBe(t.velocitiesCmPerSecond[0]);
      expect(current?.reportedValue).toBe(t.spreadRatesMmPerSecond[0]);
      expect(current?.units).toBe('mm/s');
    }
  });

  it('cites report sections for each curated scientific takeaway', () => {
    expect(BASS2_RESEARCH_INSIGHTS).toHaveLength(3);
    expect(BASS2_RESEARCH_INSIGHTS.every(x=>x.citation.includes('NASA/TM-20210011385'))).toBe(true);
    expect(BASS2_RESEARCH_INSIGHTS.every(x=>x.limitation.length>40)).toBe(true);
  });
});
