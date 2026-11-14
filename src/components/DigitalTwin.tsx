import React, { useState } from 'react';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, Download, RotateCcw, FlaskConical } from 'lucide-react';
import type { ExperimentRecord } from '../types/scientific.ts';
import {
  DEFAULT_OXYGEN_SCENARIO,
  replayConstantRate,
  simulateOxygenScenario,
  validateOxygenScenario,
} from '../utils/digitalTwin.ts';
import type { OxygenScenario, ScenarioGravity } from '../utils/digitalTwin.ts';
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

function exportPoints(points: Array<{ timeMinutes: number; oxygenPercent: number }>) {
  const lines = [
    'time_minutes,calculated_oxygen_vol_percent,data_origin_NOT_NASA_DATA,model_id',
    ...points.map(
      (p) => `${p.timeMinutes},${p.oxygenPercent},NOT-NASA-DATA-HYPOTHETICAL,AEGIS_0D_OXYGEN_BALANCE_V1`
    ),
  ].join('\n');
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
  const errors = validateOxygenScenario(scenario);
  const result = errors.length ? null : simulateOxygenScenario(scenario);

  const sourceRuns = records.filter((r) =>
    r.recordLevel === 'EXPERIMENT_RUN' &&
    r.originType === 'SOURCE_REPORTED' &&
    (r.verificationStatus === 'SOURCE_MATCHED' || r.verificationStatus === 'HUMAN_VERIFIED') &&
    r.experimentId.startsWith('EXP-BASS2-M') &&
    r.reportedValue !== null &&
    r.units === 'mm/s'
  );
  const selected = sourceRuns.find((r) => r.experimentId === selectedId) || sourceRuns[0] || null;
  const replay = selected?.reportedValue != null
    ? replayConstantRate(selected.reportedValue, replayMinutes)
    : [];

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
        <div>
          <strong>EXPLORATORY / UNVALIDATED MODEL — NOT NASA DATA OR SAFETY ADVICE.</strong>
          <p className="mt-1 leading-relaxed">
            This is a zero-dimensional, constant-temperature, constant-pressure, perfectly mixed
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
            <h2 className="text-lg font-semibold text-slate-100">1. NASA BASS-II evidence replay</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a published single-condition Table 5.1 PMMA spread-rate measurement.
              The straight line illustrates distance = reported rate × elapsed time,
              NOT NASA-observed front position or a forecast.
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
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">NASA-reported flame spread</div>
                <div className="font-mono text-xl text-teal-300 tabular-nums">{selected.reportedValue} mm/s</div>
              </div>
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">Published initial O2</div>
                <div className="font-mono text-xl tabular-nums">{selected.oxygenPercent ?? 'N/A'}%</div>
              </div>
              <div className="border border-slate-800 bg-[#070B14] rounded p-3">
                <div className="text-xs text-slate-400">Airflow</div>
                <div className="font-mono text-xl tabular-nums">{selected.airflowVelocity ?? 'N/A'} {selected.airflowUnit ?? ''}</div>
              </div>
            </div>
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
              . Straight-line illustration does not incorporate burn-duration limits or changing experimental conditions.
            </p>
          </>
        )}
        {!selected && (
          <p className="text-sm text-amber-300">No source-matched single-condition spread-rate records available.</p>
        )}
      </section>

      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-4">
        <div className="flex flex-wrap gap-3 justify-between items-start">
          <div className="space-y-1">
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
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={result.points} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="timeMinutes" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="m" />
                  <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                  <Tooltip contentStyle={{ background: '#0b1120', color: '#fff', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="oxygenPercent" name="Calculated O2 (vol% — NOT NASA DATA)" stroke="#f59e0b" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={result.depleted ? 'text-xs text-red-300 leading-relaxed' : 'text-xs text-amber-300 leading-relaxed'}>
              {result.warning}
            </p>
            <button
              type="button"
              onClick={() => exportPoints(result.points)}
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
