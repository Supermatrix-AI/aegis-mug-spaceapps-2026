import React, { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  AlertTriangle,
  Download,
  ExternalLink,
  Database,
  Layers3,
  RotateCcw,
} from 'lucide-react';
import {
  BASS2_TESTS,
  BASS2_SEGMENTS,
  BASS2_TABLE51_URL,
  BASS2_TABLE51_LIMITATION,
} from '../data/bass2Table51.ts';
import {
  BASS2_INSIGHT_SAFETY,
  BASS2_RESEARCH_INSIGHTS,
  computeBass2Summary,
  exportBass2SegmentsCsv,
  trendForTest,
} from '../utils/bass2Insights.ts';
import { OriginTag, VerificationTag } from './ScientificLabels.tsx';
import { inspectBass2Segment } from '../utils/evidenceEngine.ts';
import { EvidenceInspectorCard } from './EvidenceInspectorCard.tsx';

type SidesFilter = 'ALL' | 'ONE' | 'TWO';
type VelocityRangeFilter = 'ALL' | 'LOW' | 'MID' | 'HIGH';
type OxygenRangeFilter = 'ALL' | 'LOW' | 'MID' | 'HIGH';
type SpreadAvailabilityFilter = 'ALL' | 'NUMERIC' | 'MISSING';

interface ScatterPoint {
  velocity: number;
  spread: number;
  test: string;
  segmentId: string;
  thickness: number;
  width: number;
  sides: 1 | 2;
  initialO2: number;
  finalO2: number;
  burnMinutes: number;
}

function downloadCsv(segmentsToExport: typeof BASS2_SEGMENTS, filtered: boolean) {
  const data = exportBass2SegmentsCsv(segmentsToExport);
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
  const u = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = u;
  a.download = filtered
    ? 'NASA-BASS2-Table5-1-filtered-segments.csv'
    : 'NASA-BASS2-Table5-1-source-matched-segment-atlas.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(u);
}

const THICKNESS_OPTIONS = Array.from(new Set(BASS2_TESTS.map((t) => t.thicknessMm))).sort(
  (a, b) => a - b
);
const WIDTH_OPTIONS = Array.from(new Set(BASS2_TESTS.map((t) => t.widthCm))).sort(
  (a, b) => a - b
);

export const Bass2Atlas: React.FC = () => {
  const [selectedTest, setSelectedTest] = useState('ALL');
  const [thicknessFilter, setThicknessFilter] = useState('ALL');
  const [widthFilter, setWidthFilter] = useState('ALL');
  const [sides, setSides] = useState<SidesFilter>('ALL');
  const [velocityFilter, setVelocityFilter] = useState<VelocityRangeFilter>('ALL');
  const [oxygenFilter, setOxygenFilter] = useState<OxygenRangeFilter>('ALL');
  const [spreadAvailability, setSpreadAvailability] =
    useState<SpreadAvailabilityFilter>('ALL');
  const [inspectedSegmentId, setInspectedSegmentId] = useState<string | null>('M3-S1');

  const summary = useMemo(() => computeBass2Summary(), []);
  const inspectedSegment = useMemo(
    () =>
      inspectedSegmentId
        ? BASS2_SEGMENTS.find((s) => s.id === inspectedSegmentId) ?? null
        : null,
    [inspectedSegmentId]
  );

  const filtered = useMemo(
    () =>
      BASS2_SEGMENTS.filter((s) => {
        if (selectedTest !== 'ALL' && s.testId !== selectedTest) return false;
        if (thicknessFilter !== 'ALL' && s.thicknessMm !== Number(thicknessFilter)) return false;
        if (widthFilter !== 'ALL' && s.widthCm !== Number(widthFilter)) return false;
        if (sides === 'ONE' && s.burningSides !== 1) return false;
        if (sides === 'TWO' && s.burningSides !== 2) return false;
        if (velocityFilter === 'LOW' && s.velocityCmPerSecond >= 10) return false;
        if (
          velocityFilter === 'MID' &&
          (s.velocityCmPerSecond < 10 || s.velocityCmPerSecond > 15)
        ) {
          return false;
        }
        if (velocityFilter === 'HIGH' && s.velocityCmPerSecond <= 15) return false;
        if (oxygenFilter === 'LOW' && s.initialOxygenVolPercent >= 19.5) return false;
        if (
          oxygenFilter === 'MID' &&
          (s.initialOxygenVolPercent < 19.5 || s.initialOxygenVolPercent > 21.5)
        ) {
          return false;
        }
        if (oxygenFilter === 'HIGH' && s.initialOxygenVolPercent <= 21.5) return false;
        if (spreadAvailability === 'NUMERIC' && s.spreadRateMmPerSecond === null) return false;
        if (spreadAvailability === 'MISSING' && s.spreadRateMmPerSecond !== null) return false;
        return true;
      }),
    [
      selectedTest,
      thicknessFilter,
      widthFilter,
      sides,
      velocityFilter,
      oxygenFilter,
      spreadAvailability,
    ]
  );

  const isFiltered =
    selectedTest !== 'ALL' ||
    thicknessFilter !== 'ALL' ||
    widthFilter !== 'ALL' ||
    sides !== 'ALL' ||
    velocityFilter !== 'ALL' ||
    oxygenFilter !== 'ALL' ||
    spreadAvailability !== 'ALL';

  const resetFilters = () => {
    setSelectedTest('ALL');
    setThicknessFilter('ALL');
    setWidthFilter('ALL');
    setSides('ALL');
    setVelocityFilter('ALL');
    setOxygenFilter('ALL');
    setSpreadAvailability('ALL');
  };

  const numeric = filtered.filter(
    (s): s is typeof s & { spreadRateMmPerSecond: number } =>
      s.spreadRateMmPerSecond !== null
  );

  const toPoint = (s: (typeof numeric)[number]): ScatterPoint => ({
    velocity: s.velocityCmPerSecond,
    spread: s.spreadRateMmPerSecond,
    test: s.testId,
    segmentId: s.id,
    thickness: s.thicknessMm,
    width: s.widthCm,
    sides: s.burningSides,
    initialO2: s.initialOxygenVolPercent,
    finalO2: s.finalOxygenVolPercent,
    burnMinutes: s.burnMinutes,
  });

  const one = numeric.filter((s) => s.burningSides === 1).map(toPoint);
  const two = numeric.filter((s) => s.burningSides === 2).map(toPoint);
  const selected =
    selectedTest === 'ALL' ? null : BASS2_TESTS.find((x) => x.id === selectedTest) ?? null;
  const trend = selected ? trendForTest(selected) : null;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-teal-400">
          <span>SPECULATRON AI · NASA/TM-20210011385</span>
          <OriginTag origin="SOURCE_REPORTED" />
          <VerificationTag status="SOURCE_MATCHED" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-50 flex items-center gap-2">
          <Layers3 className="w-6 h-6 text-amber-400 shrink-0" />
          <span>BASS-II Evidence Atlas (Table 5.1)</span>
        </h1>
        <p className="text-sm text-slate-300">
          Complete published 20-test cast black PMMA matrix from NASA/TM-20210011385 Table 5.1 (p. 57),
          preserving every velocity/spread-rate segment and explicitly missing measurements without double-counting
          against the main catalog.
        </p>
        <a
          href={BASS2_TABLE51_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex gap-1.5 items-center text-xs font-mono text-teal-300 hover:text-teal-200 underline"
        >
          <span>Open original NASA NTRS report, Table 5.1 (printed p. 57)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </header>

      {/* Transparent Summary Counts */}
      <section aria-label="Source atlas counts" className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          {
            label: 'Distinct NASA test samples',
            value: summary.sampleTests,
            sub: `${summary.multiConditionTests} multi-condition tests`,
          },
          {
            label: 'Reported velocity conditions',
            value: summary.reportedVelocityConditions,
            sub: 'Sequential duct segments',
          },
          {
            label: 'Numeric spread observations',
            value: summary.numericSpreadObservations,
            sub: 'Repeated observations, NOT 39 fires',
          },
          {
            label: 'Missing / not-tracked rates',
            value: summary.noTrackedRateSegments,
            sub: `Preserved null (${summary.testWithMissingRates.join(', ')})`,
          },
          {
            label: 'Multi-velocity trend',
            value: `${summary.alignedWithinTest}/${summary.assessableMultiConditionTests}`,
            sub: `Aligned · ${summary.nonalignedWithinTest} exception (M3)`,
          },
        ].map((x) => (
          <div key={x.label} className="bg-[#0D1422] border border-slate-800 rounded-lg p-4">
            <div className="font-mono text-2xl font-semibold text-teal-300 tabular-nums">
              {x.value}
            </div>
            <div className="text-xs font-medium text-slate-200 mt-1">{x.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{x.sub}</div>
          </div>
        ))}
      </section>

      {/* Missingness & Independence Warning */}
      <section className="border border-amber-500/40 bg-amber-950/20 rounded-lg p-4 flex gap-3 text-xs text-amber-100">
        <AlertTriangle className="w-5 h-5 shrink-0 text-amber-300" />
        <div className="space-y-1.5">
          <strong>SCIENTIFIC COMPARABILITY &amp; MISSINGNESS NOTICE</strong>
          <p className="leading-relaxed">{BASS2_TABLE51_LIMITATION}</p>
          <p className="leading-relaxed">
            The {summary.numericSpreadObservations} numeric spread values are paired segment observations across{' '}
            {summary.sampleTests} test samples, NOT {summary.numericSpreadObservations} independent fires. Table 5.1
            does not report per-run error bars or per-segment oxygen percentages.
          </p>
        </div>
      </section>

      {/* Missingness Visualization */}
      <section className="bg-[#0D1422] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Table 5.1 Measurement Availability &amp; Missingness Profile
            </h2>
            <p className="text-xs text-slate-400">
              Audit of which quantities exist in NASA/TM-20210011385 Table 5.1 versus quantities left deliberately{' '}
              <span className="font-mono">null</span>.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Test-level Start/End O2',
              have: 20,
              total: 20,
              note: '20/20 tests (100%)',
              barClass: 'bg-teal-500',
            },
            {
              label: 'Segment Spread Rate (mm/s)',
              have: summary.numericSpreadObservations,
              total: summary.reportedVelocityConditions,
              note: `${summary.numericSpreadObservations}/${summary.reportedVelocityConditions} tracked (M6, M12 null)`,
              barClass: 'bg-teal-500',
            },
            {
              label: 'Per-Segment Oxygen (vol%)',
              have: 0,
              total: summary.reportedVelocityConditions,
              note: '0/43 reported (NEVER interpolated)',
              barClass: 'bg-amber-500',
            },
            {
              label: 'Per-Run Error Bounds (±)',
              have: 0,
              total: summary.sampleTests,
              note: '0/20 tabulated in Table 5.1',
              barClass: 'bg-amber-500',
            },
          ].map((item) => {
            const pct = item.total > 0 ? Math.round((item.have / item.total) * 100) : 0;
            return (
              <div key={item.label} className="rounded border border-slate-800 bg-[#070B14] p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-200 font-medium">{item.label}</span>
                  <span className="font-mono text-slate-400 tabular-nums">{pct}%</span>
                </div>
                <div className="h-2 w-full rounded bg-slate-800 overflow-hidden">
                  <div className={`h-full ${item.barClass}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="text-[11px] text-slate-400">{item.note}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filters & Scatterplot */}
      <section className="bg-[#0D1422] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Reported Opposed-Flow Velocity vs Flame-Spread Rate
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              NASA Table 5.1 source-reported observations split by one-sided vs two-sided burning geometry.
              No unvalidated regression line is fitted across mixed geometries or changing oxygen levels.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isFiltered && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 min-h-[44px] text-xs text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset filters</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => downloadCsv(filtered, isFiltered)}
              className="rounded bg-teal-700 hover:bg-teal-600 px-4 py-2.5 min-h-[44px] text-sm text-white inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isFiltered ? 'Export filtered CSV' : 'Export sourced CSV'}</span>
            </button>
          </div>
        </div>

        {/* 7-Facet Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="text-xs text-slate-300">
            Test sample
            <select
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="block mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 min-h-[44px] text-xs text-slate-100"
            >
              <option value="ALL">All 20 tests (M1–M20)</option>
              {BASS2_TESTS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} — {t.thicknessMm} mm, {t.burningSides}-sided
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-300">
            Material thickness
            <select
              value={thicknessFilter}
              onChange={(e) => setThicknessFilter(e.target.value)}
              className="block mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 min-h-[44px] text-xs text-slate-100"
            >
              <option value="ALL">All thicknesses (1–5 mm)</option>
              {THICKNESS_OPTIONS.map((mm) => (
                <option key={mm} value={String(mm)}>
                  {mm} mm PMMA
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-300">
            Sample width
            <select
              value={widthFilter}
              onChange={(e) => setWidthFilter(e.target.value)}
              className="block mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 min-h-[44px] text-xs text-slate-100"
            >
              <option value="ALL">All widths (1.2 / 2.2 cm)</option>
              {WIDTH_OPTIONS.map((cm) => (
                <option key={cm} value={String(cm)}>
                  {cm} cm wide
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-300">
            Burning sides
            <select
              value={sides}
              onChange={(e) => setSides(e.target.value as SidesFilter)}
              className="block mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 min-h-[44px] text-xs text-slate-100"
            >
              <option value="ALL">Both geometries</option>
              <option value="ONE">One-sided only</option>
              <option value="TWO">Two-sided only</option>
            </select>
          </label>

          <label className="text-xs text-slate-300">
            Airflow velocity
            <select
              value={velocityFilter}
              onChange={(e) => setVelocityFilter(e.target.value as VelocityRangeFilter)}
              className="block mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 min-h-[44px] text-xs text-slate-100"
            >
              <option value="ALL">All velocities (2–21 cm/s)</option>
              <option value="LOW">&lt; 10 cm/s</option>
              <option value="MID">10–15 cm/s</option>
              <option value="HIGH">&gt; 15 cm/s</option>
            </select>
          </label>

          <label className="text-xs text-slate-300">
            Test-level initial O2
            <select
              value={oxygenFilter}
              onChange={(e) => setOxygenFilter(e.target.value as OxygenRangeFilter)}
              className="block mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 min-h-[44px] text-xs text-slate-100"
            >
              <option value="ALL">All O2 ranges (17.9–22.2%)</option>
              <option value="LOW">&lt; 19.5 vol%</option>
              <option value="MID">19.5–21.5 vol%</option>
              <option value="HIGH">&gt; 21.5 vol%</option>
            </select>
          </label>

          <label className="text-xs text-slate-300 sm:col-span-2">
            Spread measurement availability
            <select
              value={spreadAvailability}
              onChange={(e) =>
                setSpreadAvailability(e.target.value as SpreadAvailabilityFilter)
              }
              className="block mt-1 w-full bg-slate-900 border border-slate-700 rounded px-3 py-2.5 min-h-[44px] text-xs text-slate-100"
            >
              <option value="ALL">All rows (include “Not tracked” null rows)</option>
              <option value="NUMERIC">Available numeric spread rates only</option>
              <option value="MISSING">Missing / “Not tracked” rows only (M6, M12)</option>
            </select>
          </label>
        </div>

        <p className="text-xs text-slate-400 font-mono tabular-nums">
          Showing {filtered.length} velocity-condition segment(s); {numeric.length} have numeric spread rates.
        </p>

        {numeric.length > 0 ? (
          <div className="min-w-0 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ScatterChart margin={{ top: 12, right: 28, bottom: 26, left: 6 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  type="number"
                  dataKey="velocity"
                  name="Opposed-flow velocity"
                  unit=" cm/s"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{
                    value: 'Reported opposed-flow velocity (cm/s)',
                    position: 'insideBottom',
                    offset: -14,
                    fill: '#94a3b8',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="spread"
                  name="Flame spread"
                  unit=" mm/s"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  width={60}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const p = payload[0].payload as ScatterPoint;
                    return (
                      <div className="rounded border border-slate-700 bg-[#0B1120] p-3 text-xs text-slate-100 space-y-1 shadow-lg">
                        <div className="font-mono font-semibold text-teal-300">
                          {p.segmentId} (Test {p.test})
                        </div>
                        <div className="font-mono tabular-nums">
                          Flow: {p.velocity} cm/s · Spread: {p.spread} mm/s
                        </div>
                        <div className="text-slate-300">
                          Geometry: {p.thickness} mm × {p.width} cm · {p.sides}-sided
                        </div>
                        <div className="text-amber-300 font-mono tabular-nums">
                          Test O2: {p.initialO2}% → {p.finalO2}% ({p.burnMinutes} min)
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '12px' }} />
                {one.length > 0 && (
                  <Scatter name="One-sided observations" data={one} fill="#f59e0b" />
                )}
                {two.length > 0 && (
                  <Scatter name="Two-sided observations" data={two} fill="#14b8a6" />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-slate-400 text-sm border border-slate-800 rounded p-8 text-center">
            No numeric spread rates under the current filters (missing / &ldquo;Not tracked&rdquo; rows remain visible in the table below).
          </div>
        )}

        {selected && (
          <div className="border border-slate-800 bg-[#070B14] rounded p-4 text-sm space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium text-teal-300">Focused NASA Test {selected.id}</div>
              <span className="text-xs font-mono text-slate-400">
                Trend check: {trend?.status}
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {selected.thicknessMm} mm thickness · {selected.widthCm} cm width ·{' '}
              {selected.burningSides}-sided · Test O2 from {selected.initialOxygenVolPercent}% to{' '}
              {selected.finalOxygenVolPercent}% over {selected.burnMinutes} min (initial/final only).
            </p>
            <p className="text-xs text-amber-300">{trend?.note}</p>
          </div>
        )}
      </section>

      {/* Auditable Source Table */}
      <section className="bg-[#0D1422] border border-slate-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Auditable Source Table</h2>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {filtered.length} / {BASS2_SEGMENTS.length} rows
          </span>
        </div>

        {inspectedSegment && (
          <EvidenceInspectorCard
            inspection={inspectBass2Segment(inspectedSegment)}
            onClose={() => setInspectedSegmentId(null)}
          />
        )}

        <div className="overflow-x-auto rounded border border-slate-800">
          <table className="w-full text-left text-xs min-w-[840px]">
            <thead className="bg-[#080D18] text-slate-400">
              <tr>
                <th className="p-3">Test / segment</th>
                <th className="p-3">Thickness</th>
                <th className="p-3">Width</th>
                <th className="p-3">Sides</th>
                <th className="p-3">Flow</th>
                <th className="p-3">Spread rate</th>
                <th className="p-3">Burn time</th>
                <th className="p-3">Test O2 start → end</th>
                <th className="p-3">O2 at segment</th>
                <th className="p-3 text-right">Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((x) => {
                const isInspected = inspectedSegment?.id === x.id;
                return (
                  <tr
                    key={x.id}
                    className={isInspected ? 'bg-teal-950/20' : 'hover:bg-slate-800/40'}
                  >
                    <td className="p-3 font-mono text-teal-300 whitespace-nowrap">{x.id}</td>
                    <td className="p-3 font-mono tabular-nums">{x.thicknessMm} mm</td>
                    <td className="p-3 font-mono tabular-nums">{x.widthCm} cm</td>
                    <td className="p-3 font-mono tabular-nums">{x.burningSides}</td>
                    <td className="p-3 font-mono tabular-nums">{x.velocityCmPerSecond} cm/s</td>
                    <td className="p-3 font-mono tabular-nums">
                      {x.spreadRateMmPerSecond === null ? (
                        <span className="text-amber-300">Not tracked (null)</span>
                      ) : (
                        `${x.spreadRateMmPerSecond} mm/s`
                      )}
                    </td>
                    <td className="p-3 font-mono tabular-nums">{x.burnMinutes} min</td>
                    <td className="p-3 font-mono tabular-nums">
                      {x.initialOxygenVolPercent}% → {x.finalOxygenVolPercent}%
                    </td>
                    <td className="p-3 text-amber-300">Not reported</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectedSegmentId(isInspected ? null : x.id)}
                        className={`rounded border px-2.5 py-1 font-mono text-[11px] whitespace-nowrap cursor-pointer ${
                          isInspected
                            ? 'border-teal-500 bg-teal-500/20 text-teal-200'
                            : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        {isInspected ? 'Inspecting' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400">
          Source: NASA/TM-20210011385, Table 5.1, printed p. 57. Verified verbatim against official NTRS full text.
          Per-run uncertainty bounds are omitted in the source table.
        </p>
      </section>

      {/* Evidence Intelligence & Research Gaps */}
      <section className="bg-[#0D1422] border border-slate-800 rounded-lg p-5 space-y-4">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-400" />
          <span>Evidence Intelligence, Exceptions &amp; Research Gaps</span>
        </h2>
        <div className="grid lg:grid-cols-2 gap-3">
          <div className="border border-slate-800 bg-[#070B14] rounded p-4 space-y-2">
            <h3 className="font-semibold text-slate-100">
              Within-test descriptive alignment (12 aligned, 1 exception: M3)
            </h3>
            <div className="font-mono text-xl text-teal-300 tabular-nums">
              {summary.alignedWithinTest}/{summary.assessableMultiConditionTests} tests aligned
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Across {summary.assessableMultiConditionTests} assessable multi-velocity tests,{' '}
              {summary.alignedWithinTest} show nondecreasing spread rate with higher airflow, while{' '}
              <strong>M3</strong> is a documented counterexample ({' '}
              <span className="font-mono">10 cm/s → 0.029 mm/s</span> vs{' '}
              <span className="font-mono">20 cm/s → 0.024 mm/s</span>).
            </p>
            <p className="text-xs text-amber-300 leading-relaxed">
              Not a causal law: test O2 fell from 20.8% to 19.7% during M3 and flow was stepped sequentially on one 5 mm sample.
            </p>
          </div>
          <div className="border border-slate-800 bg-[#070B14] rounded p-4 space-y-2">
            <h3 className="font-semibold text-slate-100">Next highest-value data request</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Obtain time-resolved NASA PSI-25 camera flame-front trajectories, calibrated flow and gas-analyzer O2
              time series for individual velocity segments, together with measurement uncertainty intervals.
            </p>
            <p className="text-xs text-amber-300 leading-relaxed">
              Prerequisite before any reduced-order combustion digital twin can undergo held-out quantitative validation.
            </p>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-3">
          {BASS2_RESEARCH_INSIGHTS.map((insight) => (
            <article
              key={insight.id}
              className="border border-slate-800 bg-[#070B14] rounded p-4 space-y-2"
            >
              <h3 className="font-semibold text-sm text-slate-100">{insight.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{insight.statement}</p>
              <p className="text-xs text-amber-300 leading-relaxed">{insight.limitation}</p>
              <p className="text-[11px] font-mono text-teal-400">{insight.citation}</p>
            </article>
          ))}
        </div>
        <p className="text-xs text-amber-300">{BASS2_INSIGHT_SAFETY}</p>
      </section>
    </div>
  );
};
