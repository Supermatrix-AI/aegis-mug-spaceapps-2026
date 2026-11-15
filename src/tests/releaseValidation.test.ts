import { describe, expect, it } from 'vitest';
import { INITIAL_EXPERIMENT_RECORDS } from '../data/nasaCatalog.ts';
import { BASS2_SEGMENTS } from '../data/bass2Table51.ts';
import {
  ApplicationContextSchema,
  ExperimentRecordSchema,
} from '../schemas/scientific.ts';
import {
  MISSION_RESEARCH_BRIEFINGS,
  buildScientificBriefings,
  exportBass2SegmentsCsv,
  exportScientificBriefingMarkdown,
} from '../utils/bass2Insights.ts';
import {
  DEFAULT_OXYGEN_SCENARIO,
  computeScenarioDiagnostics,
} from '../utils/digitalTwin.ts';
import { generateDeterministicSynthesis } from '../utils/scoring.ts';

describe('AegisμG Phase 5 Release & Scientific Briefing Validation', () => {
  it('1. Builds Q1–Q3 Aegis Scientific Briefings with 6-stage DIWA evidence chains and M3 counterexample', () => {
    const briefings = buildScientificBriefings(INITIAL_EXPERIMENT_RECORDS);
    expect(briefings).toHaveLength(3);

    const q1 = briefings.find((b) => b.id === 'Q1_AIRFLOW_TREND')!;
    expect(q1.conclusion.toLowerCase()).toContain('no');
    expect(q1.observations.some((o) => o.includes('0.029') && o.includes('0.024'))).toBe(true);
    expect(q1.patternSummary).toContain('12 of 13');
    expect(q1.evidenceChain.map((s) => s.stage)).toEqual([
      'SOURCE',
      'EXPERIMENT',
      'MEASUREMENT',
      'CLAIM',
      'INTERPRETATION',
      'RECOMMENDATION',
    ]);

    for (const briefing of briefings) {
      for (const step of briefing.evidenceChain) {
        if (step.stage === 'CLAIM' || step.stage === 'INTERPRETATION') {
          expect(step.origin).toBe('AEGIS_COMPUTED');
          expect(step.url).toBeNull();
        } else if (step.stage === 'RECOMMENDATION') {
          expect(step.origin).toBe('RESEARCH_FOLLOWUP');
        } else {
          expect(step.origin).toBe('NASA_SOURCE');
          expect(step.url).toBeTruthy();
        }
      }
    }

    const q2 = briefings.find((b) => b.id === 'Q2_PARTIAL_GRAVITY')!;
    expect(q2.conclusion).toContain('0.165 g');
    expect(q2.conclusion).toContain('0.38 g');

    const q3 = briefings.find((b) => b.id === 'Q3_SPACECRAFT_MATERIALS')!;
    expect(q3.observations.some((o) => o.includes('BASS-II'))).toBe(true);
    expect(q3.observations.some((o) => o.includes('Saffire-I'))).toBe(true);
  });

  it('2. Provides complete Mission-Relevance Research Briefings for all 4 target habitats', () => {
    expect(MISSION_RESEARCH_BRIEFINGS.map((m) => m.context)).toEqual([
      'ISS_HABITAT',
      'PRESSURIZED_ROVER',
      'LUNAR_HABITAT',
      'MARTIAN_HABITAT',
    ]);
    for (const profile of MISSION_RESEARCH_BRIEFINGS) {
      expect(profile.nonTransferableAssumptions.length).toBeGreaterThan(20);
      expect(profile.missingValidationData.length).toBeGreaterThan(20);
      expect(profile.proposedResearchPriorities.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('3. Exports auditable Scientific Briefing Markdown with source links, computed-claim labels, and disclaimers', () => {
    const briefings = buildScientificBriefings(INITIAL_EXPERIMENT_RECORDS);
    const md = exportScientificBriefingMarkdown(briefings, INITIAL_EXPERIMENT_RECORDS);
    expect(md).toContain('# AegisμG — Interactive Scientific Briefing Report');
    expect(md).toContain('NASA/TM-20210011385');
    expect(md).toContain('M3: 10 cm/s -> 0.029 mm/s; 20 cm/s -> 0.024 mm/s');
    expect(md).toContain('AegisμG computed (not authored by NASA)');
    expect(md).toContain('unofficial research prototype');
  });

  it('4. Computes ideal-gas conservation diagnostics and monotonic 0.5×/1.0×/2.0× sensitivity', () => {
    const diag = computeScenarioDiagnostics(DEFAULT_OXYGEN_SCENARIO);
    expect(diag.nGasMol).toBeGreaterThan(10);
    expect(diag.nGasMol).toBeLessThan(11);
    expect(diag.initialOxygenMol).toBeCloseTo(diag.nGasMol * 0.21, 2);
    expect(diag.steadyStateOxygenPercent).not.toBeNull();
    expect(diag.sensitivity).toHaveLength(3);
    expect(diag.sensitivity[0].finalOxygenPercent).toBeGreaterThanOrEqual(
      diag.sensitivity[1].finalOxygenPercent
    );
    expect(diag.sensitivity[1].finalOxygenPercent).toBeGreaterThanOrEqual(
      diag.sensitivity[2].finalOxygenPercent
    );

    const sealedDiag = computeScenarioDiagnostics({
      ...DEFAULT_OXYGEN_SCENARIO,
      ventilationLpm: 0,
    });
    expect(sealedDiag.steadyStateOxygenPercent).toBeNull();
    expect(sealedDiag.residenceTimeMinutes).toBeNull();
  });

  it('5. Produces deterministic zero-key synthesis with explicit partial-gravity gaps', () => {
    const issSynth = generateDeterministicSynthesis(INITIAL_EXPERIMENT_RECORDS, 'ISS_HABITAT');
    expect(issSynth.groundedSummary).toContain('Deterministic non-AI synthesis');
    expect(issSynth.methodologicalSimilarities.length).toBeGreaterThanOrEqual(1);

    const marsSynth = generateDeterministicSynthesis(INITIAL_EXPERIMENT_RECORDS, 'MARTIAN_HABITAT');
    expect(marsSynth.evidenceGaps.some((g) => g.includes('0.38 g'))).toBe(true);
  });

  it('6. Enforces Zod schemas for application contexts and airflow unit pairing', () => {
    expect(ApplicationContextSchema.safeParse('LUNAR_HABITAT').success).toBe(true);
    expect(ApplicationContextSchema.safeParse('ORBITAL_HOTEL').success).toBe(false);

    const missingAirflowUnit = ExperimentRecordSchema.safeParse({
      ...INITIAL_EXPERIMENT_RECORDS[0],
      airflowVelocity: 10,
      airflowUnit: '',
    });
    expect(missingAirflowUnit.success).toBe(false);
  });

  it('7. Neutralizes CSV formula injection characters when exporting Table 5.1 segments', () => {
    const tampered = [
      {
        ...BASS2_SEGMENTS[0],
        citationLocator: '=HYPERLINK("http://bad.example")',
      },
    ];
    const csv = exportBass2SegmentsCsv(tampered);
    expect(csv).toContain(`"'=HYPERLINK`);
  });
});
