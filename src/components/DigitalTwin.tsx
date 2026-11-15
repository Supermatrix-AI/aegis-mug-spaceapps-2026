import React, { useState } from 'react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, Download, RotateCcw, FlaskConical } from 'lucide-react';
import type { ExperimentRecord } from '../types/scientific.ts';
import { BASS2_TESTS } from '../data/bass2Table51.ts';
import {
  DEFAULT_OXYGEN_SCENARIO,
  computeScenarioDiagnostics,
  exportOxygenScenarioCsv,
  replayConstantRate,
  simulateOxygenScenario,
  validateOxygenScenario,
} from '../utils/digitalTwin.ts';
import type { OxygenScenario, OxygenSimulation, ScenarioDiagnostics, ScenarioGravity } from '../utils/digitalTwin.ts';
import { OriginTag, VerificationTag } from './ScientificLabels.tsx';

interface Props {
  records: ExperimentRecord[];
}

type NumericField = Exclude<keyof OxygenScenario, 'gravity'>;

const FIELDS: Array<{ key: NumericField; label: string; unit: string }> = [
  { key: 'volumeM3', label: 'Illustrative enclosure volume', unit: 'm³' },
  { key: 'pressureKPa', label: 'Pressure', unit: 'kPa' },
  { key: 'temperatureC', label: 'Gas temperature', unit: '°C' },
  { key: 'initialOxygenPercent', label: 'Initial oxygen', unit: 'vol%' },
  { key: 'inletOxygenPercent', label: 'Incoming gas oxygen', unit: 'vol%' },
  { key: 'ventilationLpm', label: 'Fresh-gas exchange', unit: 'L/min' },
  { key: 'oxygenConsumptionMgPerSecond', label: 'ASSUMED constant O2 consumption', unit: 'mg/s' },
  { key: 'durationMinutes', label: 'Scenario duration', unit: 'min' },
  { key: 'stepSeconds', label: 'Output interval', unit: 's' },
];

const GRAVITIES: Array<{ value: ScenarioGravity; label: string }> = [
  { value: 'MICROGRAVITY_0G', label: '0 g — ISS microgravity context' },
  { value: 'LUNAR_0_165G', label: '0.165 g — lunar context (NOT predicted)' },
  { value: 'MARTIAN_0_38G', label: '0.38 g — Martian context (NOT predicted)' },
  { value: 'EARTH_1G', label: '1 g — Earth context (NOT predicted)' },
];

function downloadScenarioCsv(
  scenario: OxygenScenario,
  simulation: OxygenSimulation,
  diagnostics: ScenarioDiagnostics | null
) {
  const lines = exportOxygenScenarioCsv(scenario, simulation, diagnostics);
  const blob = new Blob([lines], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aegis-exploratory-oxygen-balance-NOT-NASA-DATA.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const DigitalTwin: React.FC<Props> = ({ records }) => {
  const [scenario, setScenario] = useState<OxygenScenario>(DEFAULT_OXYGEN_SCENARIO);
  const [selectedId, setSelectedId] = useState('EXP-BASS2-M1');
  const [replayMinutes, setReplayMinutes] = useState(5);
  const [yAxisMode, setYAxisMode] = useState<'focused' | 'full'>('focused');
  const errors = validateOxygenScenario(scenario);
  const result = errors.length ? null : simulateOxygenScenario(scenario);
  const diagnostics = errors.length ? null : computeScenarioDiagnostics(scenario);

  const sourceRuns = records.filter((r) =>
    r.recordLevel === 'EXPERIMENT_RUN' &&
    r.originType === 'SOURCE_REPORTED' &&
    (r.verificationStatus === 'SOURCE_MATCHED' || r.verificationStatus === 'HUMAN_VERIFIED') &&
    r.experimentId.startsWith('EXP-BASS2-M') &&
    r.reportedValue !== null &&
    r.units === 'mm/s'
  );
  const selected = sourceRuns.find((r) => r.experimentId === selectedId) || sourceRuns[0] || null;
  const selectedBass2Id = selected ? selected.experimentId.replace('EXP-BASS2-', '') : null;
  const selectedTestMeta = selectedBass2Id
    ? BASS2_TESTS.find((t) => t.id === selectedBass2Id) ?? null
    : null;
  const replay = selected?.reportedValue != null
    ? replayConstantRate(selected.reportedValue, replayMinutes)
    : [];

  let yDomain: [number, number] = [0, 100];
  if (result && yAxisMode === 'focused') {
    const vals = result.points.map((p) => p.oxygenPercent);
    const minY = Math.min(...vals);
    const maxY = Math.max(...vals);
    const span = Math.max(0.2, maxY - minY);
    const pad = Math.max(0.05, span * 0.15);
    yDomain = [
      Math.max(0, Number((minY - pad).toFixed(2))),
      Math.min(100, Number((maxY + pad).toFixed(2))),
    ];
  }

  const updateNumber = (key: NumericField, value: string) => {
    setScenario((prev) => ({ ...prev, [key]: value === '' ? NaN : Number(value) }));
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="text-xs font-mono text-teal-400">SPECULATRON AI · AegisμG LAB</div>
        <h1 className="text-2xl font-semibold text-slate-50 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-amber-400 shrink-0" />
          <span>Digital Twin Sandbox</span>
        </h1>
        <p className="text-sm text-slate-400">
          Two separate, transparent views: NASA reported-value replay and a user-configured oxygen
          mass-balance scenario. Neither is a validated spacecraft fire simulation.
        </p>
      </header>

      <section className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-4 flex gap-3 text-xs text-amber-100">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300" />
        <div className="space-y-1.5">
          <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
            <span className="rounded border border-rose-500/50 bg-rose-950/40 px-2 py-0.5 text-rose-200">NOT NASA DATA</span>
            <span className="rounded border border-rose-500/50 bg-rose-950/40 px-2 py-0.5 text-rose-200">NOT VALIDATED</span>
            <span className="rounded border border-rose-500/50 bg-rose-950/40 px-2 py-0.5 text-rose-200">NOT CERTIFIED</span>
            <span className="rounded border border-rose-500/50 bg-rose-950/40 px-2 py-0.5 text-rose-200">NOT A FIRE-SPREAD PREDICTION</span>
          </div>
          <p className="leading-relaxed">
            Section B is a zero-dimensional, constant-temperature, constant-pressure, perfectly mixed
            oxygen inventory calculation. No ignition, buoyancy, flame transport, radiation,
            heat-transfer, CFD, smoke toxicity, human safety or suppression dynamics are modeled.
            Gravity selection changes the context label only. Do not use output to establish a fire
            probability, safe oxygen concentration or material qualification.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400">
              NASA MEASURED RATE · NASA/TM-20210011385 Table 5.1 · CALCULATED d = v × t (NOT NASA TIME-SERIES)
            </div>
            <h2 className="text-lg font-semibold text-slate-100 mt-0.5">
              1. NASA BASS-II Reported-Rate Straight-Line Illustration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a published single-condition Table 5.1 PMMA spread-rate measurement.
              The plotted line is an arithmetic illustration (distance = reported rate × elapsed time),
              NOT NASA-observed spatial trajectory, time-series telemetry, or a fire forecast.
            </p>
          </div>
          {selected && (
            <div className="flex flex-wrap items-center gap-2">
              <OriginTag origin={selected.originType} />
              <VerificationTag status={selected.verificationStatus} />
            </div>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-slate-300">
            NASA test (source-matched only)
            <select
              className="block mt-1 w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-slate-100"
              value={selected?.experimentId || ''}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {sourceRuns.map((r) => (
                <option value={r.experimentId} key={r.experimentId}>{r.experimentId}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-300">
            Illustrative continuation: {replayMinutes.toFixed(0)} min
            <input
              className="block mt-3 w-full cursor-pointer"
              type="range"
              min={0}
              max={30}
              step={1}
              value={replayMinutes}
              onChange={(e) => setReplayMinutes(Number(e.target.value))}
            />
          </label>
        </div>
        {selected && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">NASA-reported flame spread</div>
                <div className="font-mono text-xl text-teal-300 tabular-nums">{selected.reportedValue} mm/s</div>
              </div>
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">Published test O2 (start → end)</div>
                <div className="font-mono text-xl tabular-nums">
                  {selectedTestMeta
                    ? `${selectedTestMeta.initialOxygenVolPercent}% → ${selectedTestMeta.finalOxygenVolPercent}%`
                    : `${selected.oxygenPercent ?? 'N/A'}%`}
                </div>
              </div>
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">Airflow</div>
                <div className="font-mono text-xl tabular-nums">{selected.airflowVelocity ?? 'N/A'} {selected.airflowUnit ?? ''}</div>
              </div>
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">Observed Table 5.1 burn duration</div>
                <div className="font-mono text-xl text-amber-300 tabular-nums">
                  {selectedTestMeta ? `${selectedTestMeta.burnMinutes} min` : 'Not reported'}
                </div>
              </div>
            </div>
            {selectedTestMeta && replayMinutes > selectedTestMeta.burnMinutes && (
              <div className="rounded border border-amber-500/40 bg-amber-950/20 px-3 py-2 text-xs text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <span>
                  Illustrative horizon ({replayMinutes} min) exceeds NASA Table 5.1 observed burn duration ({selectedTestMeta.burnMinutes} min for {selectedTestMeta.id}, {selectedTestMeta.thicknessMm} mm × {selectedTestMeta.widthCm} cm, {selectedTestMeta.burningSides}-sided). Values beyond {selectedTestMeta.burnMinutes} min extrapolate past the experimental burn.
                </span>
              </div>
            )}
            <div className="h-60 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={replay} margin={{ top: 10, right: 22, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="timeMinutes" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="m" />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="mm" />
                  <Tooltip contentStyle={{ background: '#0b1120', color: '#fff', borderColor: '#334155' }} />
                  <Line type="linear" dataKey="illustrativeDistanceMm" name="Illustrative distance (mm)" stroke="#14b8a6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citation: {selected.citationLocator}.{' '}
              <a
                className="text-teal-300 underline"
                href={selected.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original NASA report
              </a>
              . Straight-line illustration does not incorporate burn-duration limits, O₂ depletion, or changing experimental conditions.
            </p>
          </>
        )}
        {!selected && (
          <p className="text-sm text-amber-300">No source-matched single-condition spread-rate records available.</p>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-4">
        <div className="flex flex-wrap gap-3 justify-between items-start">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-rose-300">
              <span>HYPOTHETICAL MODEL OUTPUT</span>
              <span aria-hidden="true">·</span>
              <span>NOT NASA DATA</span>
              <span aria-hidden="true">·</span>
              <span>NOT VALIDATED</span>
              <span aria-hidden="true">·</span>
              <span>NOT CERTIFIED</span>
              <span aria-hidden="true">·</span>
              <span>NOT A FIRE-SPREAD PREDICTION</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100">2. Hypothetical 0D oxygen-balance model</h2>
              <OriginTag origin="HYPOTHETICAL" />
            </div>
            <p className="text-xs text-slate-400">
              Every value below is a USER-ASSUMED scenario input, not a NASA BASS-II measurement.
              Fresh-gas exchange must not be confused with internal recirculation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScenario(DEFAULT_OXYGEN_SCENARIO)}
            className="flex items-center gap-2 rounded border border-slate-700 bg-slate-900 px-3 py-2 min-h-[44px] text-xs text-slate-200 hover:bg-slate-800 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Reset illustrative defaults
          </button>
        </div>
        <label className="block text-xs text-slate-300">
          Gravity label (descriptive only — NO gravity scaling implemented)
          <select
            value={scenario.gravity}
            onChange={(e) => setScenario((s) => ({ ...s, gravity: e.target.value as ScenarioGravity }))}
            className="block mt-1 w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded px-3 py-2.5 text-sm text-slate-100"
          >
            {GRAVITIES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {FIELDS.map(({ key, label, unit }) => (
            <label key={key} className="text-xs text-slate-300">
              {label} ({unit})
              <input
                type="number"
                inputMode="decimal"
                step="any"
                value={Number.isFinite(scenario[key]) ? scenario[key] : ''}
                onChange={(e) => updateNumber(key, e.target.value)}
                className="block mt-1 w-full min-h-[44px] rounded bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 font-mono"
              />
            </label>
          ))}
        </div>
        {errors.length > 0 && (
          <div className="border border-red-600/50 bg-red-950/20 rounded p-3 text-sm text-red-300">
            {errors.join(' ')}
          </div>
        )}
        {result && (
          <>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">Initial assumed O2</div>
                <div className="font-mono text-xl tabular-nums">{result.initialOxygenPercent.toFixed(2)}%</div>
              </div>
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">Calculated ending O2 (hypothetical)</div>
                <div className="font-mono text-xl text-amber-300 tabular-nums">{result.finalOxygenPercent.toFixed(2)}%</div>
              </div>
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">Prescribed O2-use calorimetry equivalent</div>
                <div className="font-mono text-xl tabular-nums">{result.assumedHeatReleaseW.toFixed(2)} W</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="text-slate-400">Y-Axis Scale:</span>
                {yAxisMode === 'focused' ? (
                  <span className="rounded border border-amber-500/40 bg-amber-950/30 px-2 py-0.5 text-amber-300">
                    TRUNCATED Y-AXIS ({yDomain[0]}%–{yDomain[1]}% non-zero baseline)
                  </span>
                ) : (
                  <span className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-slate-300">
                    Full 0–100% Scale
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setYAxisMode((m) => (m === 'focused' ? 'full' : 'focused'))}
                className="rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 min-h-[44px] text-xs font-mono text-slate-200 cursor-pointer"
              >
                {yAxisMode === 'focused' ? 'Switch to Full 0–100% Axis' : 'Switch to Focused Scale'}
              </button>
            </div>
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={result.points} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="timeMinutes" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="m" />
                  <YAxis domain={yDomain} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                  <Tooltip contentStyle={{ background: '#0b1120', color: '#fff', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="oxygenPercent" name="Calculated O2 (vol% — NOT NASA DATA)" stroke="#f59e0b" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={result.depleted ? 'text-xs text-red-300 leading-relaxed' : 'text-xs text-amber-300 leading-relaxed'}>
              {result.warning}
            </p>

            {diagnostics && (
              <div className="rounded border border-slate-800 bg-[#070B14] p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-200">
                    Conservation Check &amp; Local Parameter Sensitivity (Uncalibrated 0D Balance)
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                    n_gas = {diagnostics.nGasMol} mol · n_O₂(0) = {diagnostics.initialOxygenMol} mol ·{' '}
                    {diagnostics.steadyStateOxygenPercent !== null
                      ? `Asymptote = ${diagnostics.steadyStateOxygenPercent.toFixed(2)}% (τ = ${diagnostics.residenceTimeMinutes} min)`
                      : 'Sealed enclosure (no inlet dilution)'}
                    {' · '}
                    {diagnostics.massBalanceResidualMol !== null
                      ? `Mass-balance residual = ${diagnostics.massBalanceResidualMol} mol`
                      : 'Clamped at 0% O₂ depletion'}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {diagnostics.sensitivity.map((item) => (
                    <div
                      key={item.multiplierLabel}
                      className="rounded border border-slate-800 bg-[#0D1422] p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 font-mono">
                        <span>{item.multiplierLabel}</span>
                        <span className="tabular-nums">{item.consumptionMgPerSecond} mg/s</span>
                      </div>
                      <div className="font-mono text-sm text-amber-300 tabular-nums">
                        End O₂: {item.finalOxygenPercent.toFixed(2)}%
                      </div>
                      <div className="font-mono text-[11px] text-slate-400 tabular-nums">
                        Huggett equiv: {item.assumedHeatReleaseW.toFixed(2)} W
                        {item.depleted ? ' · DEPLETED' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => downloadScenarioCsv(scenario, result, diagnostics)}
              className="inline-flex items-center gap-2 rounded bg-teal-700 hover:bg-teal-600 text-white px-4 py-2.5 min-h-[44px] text-sm cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export hypothetical curve CSV (NOT-NASA-DATA)
            </button>
          </>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-2 text-xs text-slate-400">
        <h2 className="text-sm font-semibold text-slate-100">Model formulation &amp; source boundary</h2>
        <p>
          Oxygen mole fraction derivative: dx/dt = (Q/V)(x_in − x) − ṁO₂ / (M_O₂ n_gas), n_gas = PV/(RT).
          Prescribed constant oxygen consumption and equal-volume inlet/exhaust are assumptions.
        </p>
        <p>
          Heat release is simply 13.1 MJ/kg O₂ × assumed mass consumption rate. It is NOT an independently
          measured or predicted heat release rate for these scenarios.
        </p>
        <p>
          NASA/TM-20210011385 supplies reported spread-rate input for the replay only. Neither the
          hypothetical scenario parameters nor the resulting time series were measured by NASA.
        </p>
      </section>
    </div>
  );
};
