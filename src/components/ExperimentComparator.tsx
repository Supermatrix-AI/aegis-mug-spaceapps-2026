import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AlertTriangle, ExternalLink, Info } from 'lucide-react';
import type { ExperimentRecord } from '../types/scientific.ts';
import { evaluateExperimentCompatibility } from '../utils/comparator.ts';
import { formatNumericWithUnit } from '../utils/units.ts';
import { OriginTag, VerificationTag } from './ScientificLabels.tsx';

interface ExperimentComparatorProps {
  records: ExperimentRecord[];
  selectedIds: string[];
  onToggleSelect: (experimentId: string) => void;
  onClearSelection: () => void;
}

export const ExperimentComparator: React.FC<ExperimentComparatorProps> = ({
  records,
  selectedIds,
  onToggleSelect,
  onClearSelection,
}) => {
  const selectedRecords = selectedIds
    .map((id) => records.find((r) => r.experimentId === id))
    .filter((r): r is ExperimentRecord => Boolean(r));

  const report = evaluateExperimentCompatibility(selectedRecords);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Experiment Comparator</h1>
          <p className="text-sm text-slate-400 mt-1">
            Select 2 to 4 research records for side-by-side scientific comparison. Comparison plots
            render only when compatible numeric dimensions exist.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-mono tabular-nums text-slate-400">
            Selected: {selectedRecords.length}/4
          </span>
          {selectedRecords.length > 0 && (
            <button
              type="button"
              onClick={onClearSelection}
              className="rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Clear Selection
            </button>
          )}
        </div>
      </header>

      {/* Record Selector Strip */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Select 2–4 Experiment Records to Compare
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
          {records.map((r) => {
            const isSelected = selectedIds.includes(r.experimentId);
            const disabled = !isSelected && selectedIds.length >= 4;
            return (
              <button
                key={r.experimentId}
                type="button"
                disabled={disabled}
                onClick={() => onToggleSelect(r.experimentId)}
                className={`text-left rounded border p-3 transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${
                  isSelected
                    ? 'border-teal-500/70 bg-teal-950/30'
                    : 'border-slate-800 bg-[#070B14] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-teal-400 truncate">
                    {r.experimentId}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {r.experimentFamily}
                  </span>
                </div>
                <div className="text-xs text-slate-200 font-medium truncate mt-1">
                  {r.paperTitle}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1 tabular-nums">
                  {r.reportedValue !== null
                    ? `${r.reportedValue} ${r.units ?? ''}`
                    : 'Numeric outcome: N/R'}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Blockers / Warnings */}
      {report.blockers.length > 0 && (
        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 text-sm text-slate-300 flex items-center gap-3">
          <Info className="w-5 h-5 text-teal-400 shrink-0" />
          <span>{report.blockers[0]}</span>
        </div>
      )}

      {selectedRecords.length >= 2 && (
        <>
          {report.warnings.length > 0 && (
            <section className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Scientific Compatibility Warnings ({report.warnings.length})</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs text-amber-200/90">
                {report.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Side-by-side Scientific Matrix */}
          <section className="rounded-lg border border-slate-800 bg-[#0D1422] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-800">
              <h2 className="text-base font-semibold text-slate-100">
                Side-by-Side Scientific Comparison Matrix
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#080D18] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-medium w-44">Dimension</th>
                    {selectedRecords.map((r) => (
                      <th key={r.experimentId} className="px-4 py-3 font-medium min-w-[220px]">
                        <div className="font-mono text-teal-400">{r.experimentId}</div>
                        <div className="text-slate-200 mt-0.5 line-clamp-2">{r.paperTitle}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Verification &amp; Origin</td>
                    {selectedRecords.map((r) => (
                      <td key={r.experimentId} className="px-4 py-3 space-y-1">
                        <div>
                          <VerificationTag status={r.verificationStatus} />
                        </div>
                        <div>
                          <OriginTag origin={r.originType} />
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Research Source</td>
                    {selectedRecords.map((r) => (
                      <td key={r.experimentId} className="px-4 py-3 text-slate-200">
                        <div>{r.reportId ?? r.sourceId}</div>
                        <a
                          href={r.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-mono mt-1"
                        >
                          <span>Source Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Gravity Environment</td>
                    {selectedRecords.map((r) => (
                      <td key={r.experimentId} className="px-4 py-3 font-mono text-slate-200">
                        {r.gravityContext}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Fuel / Sample Material</td>
                    {selectedRecords.map((r) => (
                      <td key={r.experimentId} className="px-4 py-3 text-slate-200">
                        {r.material ?? 'Not reported / Not verified'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Oxygen Concentration</td>
                    {selectedRecords.map((r) => (
                      <td
                        key={r.experimentId}
                        className="px-4 py-3 font-mono tabular-nums text-slate-200"
                      >
                        {r.oxygenPercent !== null
                          ? `${r.oxygenPercent} %`
                          : 'Not reported / Not verified'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Airflow Velocity</td>
                    {selectedRecords.map((r) => (
                      <td
                        key={r.experimentId}
                        className="px-4 py-3 font-mono tabular-nums text-slate-200"
                      >
                        {formatNumericWithUnit(r.airflowVelocity, r.airflowUnit)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Experimental Geometry</td>
                    {selectedRecords.map((r) => (
                      <td key={r.experimentId} className="px-4 py-3 text-slate-200">
                        {r.experimentGeometry ?? 'Not reported / Not verified'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Measurement Instruments / Type</td>
                    {selectedRecords.map((r) => (
                      <td key={r.experimentId} className="px-4 py-3 text-slate-200">
                        {r.measurementType ?? 'Not reported / Not verified'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Flame Behavior / Outcomes</td>
                    {selectedRecords.map((r) => (
                      <td key={r.experimentId} className="px-4 py-3 text-slate-300 leading-relaxed">
                        {r.observedOutcome ?? 'Not reported / Not verified'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Numeric Value &amp; Units</td>
                    {selectedRecords.map((r) => (
                      <td
                        key={r.experimentId}
                        className="px-4 py-3 font-mono tabular-nums text-amber-300"
                      >
                        {formatNumericWithUnit(r.reportedValue, r.units)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Measurement Uncertainty</td>
                    {selectedRecords.map((r) => (
                      <td key={r.experimentId} className="px-4 py-3 font-mono text-slate-300">
                        {r.uncertainty ?? 'Not reported / Not verified'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-400">Citation Locator</td>
                    {selectedRecords.map((r) => (
                      <td key={r.experimentId} className="px-4 py-3 font-mono text-slate-400">
                        {r.citationLocator ?? 'Not reported / Not verified'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Numeric Comparison Charts (Only Rendered When Comparable Numeric Data Exists) */}
          <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Unit-Checked Numeric Comparison Charts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Plots are generated exclusively from scientifically comparable numeric values.
              </p>
            </div>

            {!report.comparable ? (
              <div className="rounded border border-slate-800 bg-[#070B14] p-6 space-y-3">
                <div className="text-sm font-semibold text-amber-300">
                  No comparable numeric data available.
                </div>
                <p className="text-xs text-slate-300">
                  AegisμG refuses to fabricate or interpolate missing experimental numbers to draw a
                  chart. Specifically, for your selected records:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400">
                  {report.missingNumericExplanation.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {report.sharedNumericDimensions.map((dim) => (
                  <div
                    key={dim.key}
                    className="rounded border border-slate-800 bg-[#070B14] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-200">{dim.label}</span>
                      <span className="font-mono text-teal-400">{dim.targetUnit ?? ''}</span>
                    </div>

                    <div className="h-56 w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart
                          data={dim.values}
                          margin={{ top: 8, right: 12, left: 0, bottom: 16 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                          <XAxis
                            dataKey="experimentId"
                            tick={{ fill: '#94A3B8', fontSize: 10 }}
                            axisLine={{ stroke: '#334155' }}
                          />
                          <YAxis
                            tick={{ fill: '#94A3B8', fontSize: 11 }}
                            axisLine={{ stroke: '#334155' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0B1120',
                              borderColor: '#334155',
                              fontSize: '12px',
                              color: '#F1F5F9',
                            }}
                          />
                          <Bar
                            dataKey="value"
                            name={dim.label}
                            fill="#14B8A6"
                            radius={[3, 3, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 space-y-1">
                      {dim.values.map((v) => (
                        <div key={v.experimentId} className="flex justify-between gap-2">
                          <span>{v.experimentId}</span>
                          <span className="tabular-nums">
                            {v.value} {dim.targetUnit}
                            {v.converted
                              ? ` (converted from ${v.originalValue} ${v.originalUnit})`
                              : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
