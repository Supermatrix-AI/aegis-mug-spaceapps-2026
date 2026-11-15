import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  ArrowRight,
  Database,
  FileUp,
  GitCompare,
  BrainCircuit,
  FlaskConical,
  ShieldCheck,
  ExternalLink,
  Layers3,
  Play,
} from 'lucide-react';
import type {
  ExperimentRecord,
  ImportJob,
  ProvenanceEvent,
  SourceDocument,
} from '../types/scientific.ts';
import { computeEvidenceCompleteness } from '../utils/scoring.ts';
import { VerificationTag } from './ScientificLabels.tsx';

export type NavSection =
  | 'overview'
  | 'explorer'
  | 'evidence-atlas'
  | 'import'
  | 'comparator'
  | 'intelligence'
  | 'digital-twin'
  | 'provenance'
  | 'about';

interface MissionOverviewProps {
  sources: SourceDocument[];
  records: ExperimentRecord[];
  provenanceEvents: ProvenanceEvent[];
  importJobs: ImportJob[];
  onNavigate: (section: NavSection) => void;
  onStartDemo?: () => void;
}

export const MissionOverview: React.FC<MissionOverviewProps> = ({
  sources,
  records,
  provenanceEvents,
  importJobs,
  onNavigate,
  onStartDemo,
}) => {
  const verifiedCount = records.filter(
    (r) => r.verificationStatus === 'HUMAN_VERIFIED' || r.verificationStatus === 'SOURCE_MATCHED'
  ).length;
  const metadataReviewedCount = records.filter(
    (r) => r.verificationStatus === 'METADATA_REVIEWED'
  ).length;
  const unverifiedCount = records.filter(
    (r) => r.verificationStatus === 'SOURCE_LINK_ONLY' || r.verificationStatus === 'CONTRADICTED'
  ).length;

  const meanCompleteness =
    records.length > 0
      ? Math.round(
          (records.reduce((acc, r) => acc + computeEvidenceCompleteness(r), 0) / records.length) *
            100
        )
      : 0;

  const ingestedSources = sources.filter((s) => s.ingestionState !== 'REFERENCE_INDEXED').length;
  const recordsWithOxygen = records.filter((r) => r.oxygenPercent !== null).length;
  const recordsWithAirflow = records.filter(
    (r) => r.airflowVelocity !== null && Boolean(r.airflowUnit)
  ).length;
  const recordsWithNumeric = records.filter(
    (r) => r.reportedValue !== null && Boolean(r.units)
  ).length;
  const recordsWithUncertainty = records.filter((r) => Boolean(r.uncertainty)).length;

  // Coverage by experiment family computed dynamically
  const familyMap = new Map<
    string,
    { family: string; records: number; avgCompleteness: number; numericCount: number }
  >();
  for (const r of records) {
    const entry = familyMap.get(r.experimentFamily) ?? {
      family: r.experimentFamily,
      records: 0,
      avgCompleteness: 0,
      numericCount: 0,
    };
    entry.records += 1;
    entry.avgCompleteness += computeEvidenceCompleteness(r) * 100;
    if (r.reportedValue !== null) entry.numericCount += 1;
    familyMap.set(r.experimentFamily, entry);
  }
  const familyData = Array.from(familyMap.values()).map((item) => ({
    family: item.family,
    records: item.records,
    completenessPct: Math.round(item.avgCompleteness / item.records),
    numericCount: item.numericCount,
  }));

  const recentEvents = [...provenanceEvents].slice(-6).reverse();

  return (
    <div className="space-y-8">
      {/* Hero / Mission Header */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-mono text-teal-400">SPECULATRON AI</span>
              <span aria-hidden="true">·</span>
              <span>NASA Space Apps Challenge 2026</span>
              <span aria-hidden="true">·</span>
              <span>Flame in Freefall</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50 text-balance">
              AegisμG — Microgravity Fire Safety Intelligence
            </h1>
            <p className="text-sm sm:text-base leading-relaxed text-slate-300">
              Evidence-traceable research workspace translating NASA Physical Sciences Informatics (PSI)
              and Technical Reports Server (NTRS) microgravity combustion investigations into
              comparable, unit-aware scientific records. Built for spacecraft, pressurized rover, lunar,
              and Martian habitat fire-safety inquiry without fabricating unverified metrics.
            </p>
            <p className="text-xs text-amber-300/90 border border-amber-500/30 bg-amber-950/20 rounded px-3 py-2">
              Independent, unofficial research prototype. Does not represent NASA endorsement, flight
              qualification, or spacecraft material fire-safety certification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {onStartDemo && (
              <button
                type="button"
                onClick={onStartDemo}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-500 hover:bg-amber-400 px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>Start Scientific Demo</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('explorer')}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-600 hover:bg-teal-500 px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>Explore NASA Evidence</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('evidence-atlas')}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Layers3 className="w-4 h-4 text-teal-400" />
              <span>Open BASS-II Table 5.1 Atlas</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('import')}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-amber-400" />
              <span>Import CSV / JSON Data</span>
            </button>
          </div>
        </div>
      </section>

      {/* First-Screen Executive Value Strip */}
      <section aria-label="Problem Solution Differentiator Value" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-4 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
            The Problem
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            NASA microgravity fire data spans scattered PSI investigations and technical reports with missing metrics, varying units, and incompatible spacecraft scales.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-4 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400">
            The Solution
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            AegisμG provides a verification-gated, citation-traceable dashboard uniting Table 5.1 BASS-II PMMA data, deterministic relevance ranking, and zero-key fallback analysis.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-4 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-sky-400">
            The Differentiator
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Zero invented numbers: null spread rates (M6, M12), unmeasured segment O₂, the M3 non-monotonic counterexample, and strict 0 g vs Moon/Mars boundaries stay explicit.
          </p>
        </div>
        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-4 space-y-1.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
            The Value
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Accelerates literature triage for ISS, pressurized rover, lunar, and Martian habitat researchers while keeping human reviewer sign-off mandatory.
          </p>
        </div>
      </section>

      {/* Gravity & Buoyancy Scientific Boundary */}
      <section aria-label="Gravity and Buoyancy Regime Boundary" className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Gravity Regime &amp; Buoyancy Boundary (Why 0 g ≠ Moon or Mars)
            </h2>
            <p className="text-xs text-slate-400">
              All bundled numeric fire observations originate from ~0 g spacecraft chambers (NASA/TM-20210011385, OCHMO-TB-008). Partial-gravity regimes remain unmeasured.
            </p>
          </div>
          <span className="font-mono text-[11px] text-amber-300">NO EMPIRICAL PARTIAL-G DATA</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="rounded border border-teal-500/30 bg-[#070B14] p-3 space-y-1">
            <div className="font-mono font-semibold text-teal-300">ISS / Cygnus (~0 g)</div>
            <p className="text-slate-300 leading-relaxed">
              Natural buoyancy absent; flames depend on forced ventilation, diffusion, and wall heat loss (BASS-II Table 5.1/7.1 empirical runs).
            </p>
          </div>
          <div className="rounded border border-amber-500/30 bg-[#070B14] p-3 space-y-1">
            <div className="font-mono font-semibold text-amber-300">Lunar Surface (0.165 g)</div>
            <p className="text-slate-300 leading-relaxed">
              Weak buoyant plumes re-emerge; exploration cabins may use ~34% O₂ / 56.5 kPa. 0 empirical 0.165 g measurements in workspace.
            </p>
          </div>
          <div className="rounded border border-amber-500/30 bg-[#070B14] p-3 space-y-1">
            <div className="font-mono font-semibold text-amber-300">Martian Surface (0.38 g)</div>
            <p className="text-slate-300 leading-relaxed">
              Mixed buoyancy + forced-flow regime alters heat feedback and smoke stratification. 0 empirical 0.38 g measurements in workspace.
            </p>
          </div>
          <div className="rounded border border-slate-700 bg-[#070B14] p-3 space-y-1">
            <div className="font-mono font-semibold text-slate-200">Earth Normal (1 g)</div>
            <p className="text-slate-400 leading-relaxed">
              Strong buoyant convection sweeps fresh oxidizer upward; terrestrial qualification cannot bound microgravity or partial-g risk.
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic KPI Strip */}
      <section aria-label="Catalog Metrics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Official NASA Sources
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-semibold text-slate-50 tabular-nums">
              {sources.length}
            </span>
            <span className="text-xs font-mono text-teal-400">
              {ingestedSources} metadata ingested
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Verified URLs across NTRS, PSI, OCHMO, and Space Apps.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Experiment Records
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-semibold text-slate-50 tabular-nums">
              {records.length}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {familyData.length} families
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {recordsWithNumeric} with extracted numeric outcomes; {records.length - recordsWithNumeric} awaiting import.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Verification Distribution
          </div>
          <div className="mt-2 flex items-baseline gap-3 font-mono tabular-nums">
            <div>
              <span className="text-2xl font-semibold text-emerald-400">{verifiedCount}</span>
              <span className="ml-1 text-xs text-slate-400">verified</span>
            </div>
            <span className="text-slate-600">/</span>
            <div>
              <span className="text-2xl font-semibold text-sky-400">{metadataReviewedCount}</span>
              <span className="ml-1 text-xs text-slate-400">metadata</span>
            </div>
            <span className="text-slate-600">/</span>
            <div>
              <span className="text-2xl font-semibold text-amber-400">{unverifiedCount}</span>
              <span className="ml-1 text-xs text-slate-400">unverified</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Strict human-review gate prevents unverified auto-promotion.
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-5">
          <div className="text-xs uppercase tracking-wider text-slate-400">
            Mean Evidence Completeness
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-mono font-semibold text-amber-400 tabular-nums">
              {meanCompleteness}%
            </span>
            <span className="text-xs font-mono text-slate-400">across 8 schema checks</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Missing numeric measurements explicitly reduce completeness.
          </p>
        </div>
      </section>

      {/* Main 2-column Analytical Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coverage by Experiment Family */}
        <section className="lg:col-span-7 rounded-lg border border-slate-800 bg-[#0D1422] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Research Coverage by Experiment Family
              </h2>
              <p className="text-xs text-slate-400">
                Record count and average schema completeness (%) calculated live from active records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('comparator')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Open Comparator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {familyData.length === 0 ? (
            <div className="rounded border border-slate-800 bg-[#070B14] p-8 text-center text-sm text-slate-400">
              No experiment records loaded. Import CSV or JSON records to view family coverage.
            </div>
          ) : (
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={familyData} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis
                    dataKey="family"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={52}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#94A3B8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    allowDecimals={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fill: '#F59E0B', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B1120',
                      borderColor: '#334155',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#F1F5F9',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="records"
                    name="Records"
                    fill="#14B8A6"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="completenessPct"
                    name="Mean Completeness (%)"
                    fill="#F59E0B"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Parameter Completeness Indicators */}
        <section className="lg:col-span-5 rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Scientific Parameter Availability
            </h2>
            <p className="text-xs text-slate-400">
              Unextracted parameters remain marked &ldquo;Not reported / Not verified&rdquo;.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                label: 'Oxygen Concentration (%)',
                count: recordsWithOxygen,
                total: records.length,
              },
              {
                label: 'Forced Airflow Velocity + Units',
                count: recordsWithAirflow,
                total: records.length,
              },
              {
                label: 'Numeric Outcome + Units',
                count: recordsWithNumeric,
                total: records.length,
              },
              {
                label: 'Measurement Uncertainty Reported',
                count: recordsWithUncertainty,
                total: records.length,
              },
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.count / item.total) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {item.count}/{item.total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-teal-500 transition-all duration-200"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigate('intelligence')}
              className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-teal-400" />
              <span>SPECULATRON Ranking</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('comparator')}
              className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <GitCompare className="w-3.5 h-3.5 text-amber-400" />
              <span>Compare Records</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('digital-twin')}
              className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
              <span>Digital Twin Sandbox</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('provenance')}
              className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DIWA Audit Log</span>
            </button>
          </div>
        </section>
      </div>

      {/* Bottom Row: Official NASA Catalog Snapshot & Recent Import/Provenance Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-lg border border-slate-800 bg-[#0D1422] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-100">
              Primary NASA Reference Catalog
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="text-xs text-teal-400 hover:text-teal-300 cursor-pointer"
            >
              Full Bibliography
            </button>
          </div>
          <div className="divide-y divide-slate-800">
            {sources.slice(0, 5).map((src) => (
              <div key={src.sourceId} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-100 truncate">
                    {src.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <span className="font-mono text-teal-400">{src.sourceId}</span>
                    <span aria-hidden="true">·</span>
                    <span>{src.nasaProgram}</span>
                    <span aria-hidden="true">·</span>
                    <span>Retrieved {src.retrievalDate}</span>
                  </div>
                </div>
                <a
                  href={src.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-mono text-amber-300 hover:text-amber-200 whitespace-nowrap shrink-0"
                >
                  <span>NASA Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 rounded-lg border border-slate-800 bg-[#0D1422] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-100">
              Recent Import &amp; Provenance Activity
            </h2>
            <span className="text-xs font-mono text-slate-400">
              {importJobs.length} import job(s)
            </span>
          </div>

          {recentEvents.length === 0 ? (
            <p className="text-sm text-slate-400">No provenance events recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentEvents.map((evt) => (
                <div key={evt.eventId} className="py-2.5 space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-teal-400">{evt.action}</span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {evt.timestamp.slice(0, 19).replace('T', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{evt.details}</p>
                </div>
              ))}
            </div>
          )}

          {records.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Lead catalog entry status:</span>
              <VerificationTag status={records[0].verificationStatus} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
