import { describe, expect, it } from 'vitest';
import {
  DEFAULT_OXYGEN_SCENARIO,
  replayConstantRate,
  simulateOxygenScenario,
  validateOxygenScenario,
} from '../utils/digitalTwin.ts';

describe('AegisμG exploratory digital twin — honest 0D mass balance', () => {
  it('preserves constant oxygen when no sink and equal inlet composition', () => {
    const s = { ...DEFAULT_OXYGEN_SCENARIO, oxygenConsumptionMgPerSecond: 0 };
    const result = simulateOxygenScenario(s);
    expect(result.finalOxygenPercent).toBeCloseTo(s.initialOxygenPercent, 6);
    expect(result.assumedHeatReleaseW).toBe(0);
    expect(result.depleted).toBe(false);
  });

  it('depletes oxygen at a known closed-volume mass-balance rate', () => {
    const s = { ...DEFAULT_OXYGEN_SCENARIO, ventilationLpm: 0, oxygenConsumptionMgPerSecond: 1 };
    const result = simulateOxygenScenario(s);
    expect(result.finalOxygenPercent).toBeLessThan(s.initialOxygenPercent);
    expect(result.assumedHeatReleaseW).toBeCloseTo(13.1, 6);
  });

  it('approaches inlet oxygen under ventilation with no sink', () => {
    const s = { ...DEFAULT_OXYGEN_SCENARIO, initialOxygenPercent: 10, inletOxygenPercent: 21, oxygenConsumptionMgPerSecond: 0, durationMinutes: 60 };
    const result = simulateOxygenScenario(s);
    expect(result.finalOxygenPercent).toBeGreaterThan(10);
    expect(result.finalOxygenPercent).toBeLessThanOrEqual(21);
  });

  it('clamps oxygen and warns when prescribed uptake is unsustainable', () => {
    const s = { ...DEFAULT_OXYGEN_SCENARIO, ventilationLpm: 0, oxygenConsumptionMgPerSecond: 10000, durationMinutes: 30 };
    const result = simulateOxygenScenario(s);
    expect(result.finalOxygenPercent).toBe(0);
    expect(result.depleted).toBe(true);
    expect(result.warning).toContain('physically invalid');
  });

  it('rejects invalid oxygen, time, gravity, and volumes', () => {
    expect(validateOxygenScenario({ ...DEFAULT_OXYGEN_SCENARIO, initialOxygenPercent: 105 })).not.toEqual([]);
    expect(validateOxygenScenario({ ...DEFAULT_OXYGEN_SCENARIO, volumeM3: 0 })).not.toEqual([]);
    expect(validateOxygenScenario({ ...DEFAULT_OXYGEN_SCENARIO, durationMinutes: -1 })).not.toEqual([]);
    expect(() => simulateOxygenScenario({ ...DEFAULT_OXYGEN_SCENARIO, temperatureC: 500 })).toThrow();
  });

  it('does not claim a partial-gravity adjustment', () => {
    const earth = simulateOxygenScenario({ ...DEFAULT_OXYGEN_SCENARIO, gravity: 'EARTH_1G' });
    const moon = simulateOxygenScenario({ ...DEFAULT_OXYGEN_SCENARIO, gravity: 'LUNAR_0_165G' });
    expect(moon.points).toEqual(earth.points);
    expect(moon.warning).toContain('Gravity label has no numerical effect');
  });

  it('linearly replays a reported spread rate without inventing observations', () => {
    const pts = replayConstantRate(0.071, 5);
    expect(pts[0].illustrativeDistanceMm).toBe(0);
    expect(pts[30].illustrativeDistanceMm).toBeCloseTo(21.3, 5);
    expect(() => replayConstantRate(-1, 5)).toThrow();
  });
});
