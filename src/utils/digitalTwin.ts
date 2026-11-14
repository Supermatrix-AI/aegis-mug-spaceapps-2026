export type ScenarioGravity =
  | 'MICROGRAVITY_0G'
  | 'LUNAR_0_165G'
  | 'MARTIAN_0_38G'
  | 'EARTH_1G';

export interface OxygenScenario {
  volumeM3: number;
  pressureKPa: number;
  temperatureC: number;
  initialOxygenPercent: number;
  inletOxygenPercent: number;
  ventilationLpm: number;
  oxygenConsumptionMgPerSecond: number;
  durationMinutes: number;
  stepSeconds: number;
  gravity: ScenarioGravity;
}

export interface OxygenPoint {
  timeMinutes: number;
  oxygenPercent: number;
}

export interface OxygenSimulation {
  points: OxygenPoint[];
  initialOxygenPercent: number;
  finalOxygenPercent: number;
  assumedHeatReleaseW: number;
  depleted: boolean;
  warning: string;
  modelId: 'AEGIS_0D_OXYGEN_BALANCE_V1';
}

const R = 8.31446261815324; // J/(mol K)
const O2_KG_PER_MOL = 0.031998;
const HEAT_PER_KG_O2 = 13_100_000; // 13.1 kJ/g O2 (Huggett convention)

export const DEFAULT_OXYGEN_SCENARIO: OxygenScenario = {
  volumeM3: 0.25,
  pressureKPa: 101.325,
  temperatureC: 25,
  initialOxygenPercent: 21,
  inletOxygenPercent: 21,
  ventilationLpm: 20,
  oxygenConsumptionMgPerSecond: 1,
  durationMinutes: 20,
  stepSeconds: 10,
  gravity: 'MICROGRAVITY_0G',
};

function validNumber(x: number, min: number, max: number): boolean {
  return Number.isFinite(x) && x >= min && x <= max;
}

export function validateOxygenScenario(s: OxygenScenario): string[] {
  const errors: string[] = [];
  if (!validNumber(s.volumeM3, 0.01, 1000)) errors.push('Volume must be 0.01–1000 m³.');
  if (!validNumber(s.pressureKPa, 10, 200)) errors.push('Pressure must be 10–200 kPa.');
  if (!validNumber(s.temperatureC, -50, 100)) errors.push('Temperature must be −50 to 100 °C.');
  if (!validNumber(s.initialOxygenPercent, 0, 100)) errors.push('Initial oxygen must be 0–100%.');
  if (!validNumber(s.inletOxygenPercent, 0, 100)) errors.push('Inlet oxygen must be 0–100%.');
  if (!validNumber(s.ventilationLpm, 0, 10000)) errors.push('Ventilation must be 0–10000 L/min.');
  if (!validNumber(s.oxygenConsumptionMgPerSecond, 0, 10000)) errors.push('Prescribed oxygen uptake must be 0–10000 mg/s.');
  if (!validNumber(s.durationMinutes, 1, 180)) errors.push('Duration must be 1–180 min.');
  if (!validNumber(s.stepSeconds, 1, 60)) errors.push('Output step must be 1–60 s.');
  if (!['MICROGRAVITY_0G', 'LUNAR_0_165G', 'MARTIAN_0_38G', 'EARTH_1G'].includes(s.gravity)) errors.push('Unknown gravity label.');
  return errors;
}

/**
 * dx/dt = (Q/V)*(x_in-x) - nO2dot / nGas,
 * nGas = (P*V)/(R*T), nO2dot = mO2dot/M_O2.
 * Closed-form integration of this linear equation avoids Euler instability.
 * No assumption about how gravity changes flame spread, ignition, or uptake.
 */
export function simulateOxygenScenario(s: OxygenScenario): OxygenSimulation {
  const errors = validateOxygenScenario(s);
  if (errors.length) throw new Error(errors.join(' '));
  const pressurePa = s.pressureKPa * 1000;
  const temperatureK = s.temperatureC + 273.15;
  const nGasMol = pressurePa * s.volumeM3 / (R * temperatureK);
  const flowM3PerSecond = s.ventilationLpm / 60000;
  const lambda = flowM3PerSecond / s.volumeM3;
  const oxygenSinkMolPerSecond = (s.oxygenConsumptionMgPerSecond * 1e-6) / O2_KG_PER_MOL;
  const sinkFractionPerSecond = oxygenSinkMolPerSecond / nGasMol;
  const inletFraction = s.inletOxygenPercent / 100;
  const durationSeconds = s.durationMinutes * 60;
  let oxygenFraction = s.initialOxygenPercent / 100;
  let depleted = false;
  let t = 0;
  const points: OxygenPoint[] = [{ timeMinutes: 0, oxygenPercent: s.initialOxygenPercent }];
  while (t < durationSeconds) {
    const dt = Math.min(s.stepSeconds, durationSeconds - t);
    let next = 0;
    if (lambda === 0) {
      next = oxygenFraction - sinkFractionPerSecond * dt;
    } else {
      const equilibrium = inletFraction - sinkFractionPerSecond / lambda;
      next = equilibrium + (oxygenFraction - equilibrium) * Math.exp(-lambda * dt);
    }
    if (next < 0) depleted = true;
    oxygenFraction = Math.max(0, Math.min(1, next));
    t += dt;
    points.push({
      timeMinutes: Number((t / 60).toFixed(5)),
      oxygenPercent: Number((oxygenFraction * 100).toFixed(6)),
    });
  }
  return {
    points,
    initialOxygenPercent: s.initialOxygenPercent,
    finalOxygenPercent: Number((oxygenFraction * 100).toFixed(6)),
    assumedHeatReleaseW: Number((s.oxygenConsumptionMgPerSecond * 1e-6 * HEAT_PER_KG_O2).toFixed(6)),
    depleted,
    warning: depleted
      ? 'Model reached zero O2. Continuing a fixed oxygen-consumption rate is physically invalid beyond depletion; do not interpret later points as combustion predictions.'
      : 'Hypothetical fixed-rate, well-mixed gas-balance calculation. This model is uncalibrated; heat release is a calorimetry conversion, not a predicted flame or hazard. Gravity label has no numerical effect.',
    modelId: 'AEGIS_0D_OXYGEN_BALANCE_V1',
  };
}

/**
 * Visual replay of a NASA-reported spread-rate value as a straight line only.
 * Constant-rate continuation is a MATHEMATICAL ILLUSTRATION, not a measured
 * spatial trajectory, burn-front history, or prediction.
 */
export function replayConstantRate(reportedSpreadMmPerSec: number, minutes = 5) {
  if (!Number.isFinite(reportedSpreadMmPerSec) || reportedSpreadMmPerSec < 0 ||
      !Number.isFinite(minutes) || minutes < 0 || minutes > 30) {
    throw new Error('Require finite nonnegative reported spread rate and 0–30 minutes.');
  }
  const points: Array<{timeMinutes:number; illustrativeDistanceMm:number}> = [];
  for (let i = 0; i <= 30; i++) {
    const timeMinutes = (minutes * i) / 30;
    points.push({
      timeMinutes: Number(timeMinutes.toFixed(4)),
      illustrativeDistanceMm: Number((reportedSpreadMmPerSec * timeMinutes * 60).toFixed(6)),
    });
  }
  return points;
}

export interface ScenarioDiagnostics {
  nGasMol: number;
  initialOxygenMol: number;
  steadyStateOxygenPercent: number | null;
  residenceTimeMinutes: number | null;
  sensitivity: Array<{
    multiplierLabel: '0.5× sink' | '1.0× baseline' | '2.0× sink';
    consumptionMgPerSecond: number;
    finalOxygenPercent: number;
    assumedHeatReleaseW: number;
    depleted: boolean;
  }>;
}

export function computeScenarioDiagnostics(s: OxygenScenario): ScenarioDiagnostics {
  const pressurePa = s.pressureKPa * 1000;
  const temperatureK = s.temperatureC + 273.15;
  const nGasMol = (pressurePa * s.volumeM3) / (R * temperatureK);
  const initialOxygenMol = nGasMol * (s.initialOxygenPercent / 100);
  const flowM3PerSecond = s.ventilationLpm / 60000;
  const lambda = flowM3PerSecond / s.volumeM3;
  const oxygenSinkMolPerSecond = (s.oxygenConsumptionMgPerSecond * 1e-6) / O2_KG_PER_MOL;
  const sinkFractionPerSecond = oxygenSinkMolPerSecond / nGasMol;

  const steadyStateOxygenPercent =
    lambda > 0
      ? Number((Math.max(0, s.inletOxygenPercent / 100 - sinkFractionPerSecond / lambda) * 100).toFixed(4))
      : null;

  const residenceTimeMinutes =
    lambda > 0 ? Number((1 / lambda / 60).toFixed(2)) : null;

  const multipliers: Array<{ label: '0.5× sink' | '1.0× baseline' | '2.0× sink'; factor: number }> = [
    { label: '0.5× sink', factor: 0.5 },
    { label: '1.0× baseline', factor: 1 },
    { label: '2.0× sink', factor: 2 },
  ];

  const sensitivity = multipliers.map(({ label, factor }) => {
    const scaledRate = Math.min(10000, Number((s.oxygenConsumptionMgPerSecond * factor).toFixed(6)));
    const sim = simulateOxygenScenario({
      ...s,
      oxygenConsumptionMgPerSecond: scaledRate,
    });
    return {
      multiplierLabel: label,
      consumptionMgPerSecond: scaledRate,
      finalOxygenPercent: sim.finalOxygenPercent,
      assumedHeatReleaseW: sim.assumedHeatReleaseW,
      depleted: sim.depleted,
    };
  });

  return {
    nGasMol: Number(nGasMol.toFixed(4)),
    initialOxygenMol: Number(initialOxygenMol.toFixed(4)),
    steadyStateOxygenPercent,
    residenceTimeMinutes,
    sensitivity,
  };
}

