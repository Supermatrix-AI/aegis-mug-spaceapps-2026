import React, { useState } from 'react';
import { Check, Copy, Download, ExternalLink, FileText } from 'lucide-react';
import type {
  ExperimentRecord,
  ImportJob,
  ProvenanceEvent,
  SourceDocument,
} from '../types/scientific.ts';
import {
  exportDossierToJson,
  exportEvidenceReportMarkdown,
  exportRecordsToCsv,
} from '../utils/importExport.ts';
import { RELEVANCE_FORMULA_DESCRIPTION } from '../utils/scoring.ts';

interface AboutAndExportProps {
  sources: SourceDocument[];
  records: ExperimentRecord[];
  events: ProvenanceEvent[];
  importJobs: ImportJob[];
  onExportLogged: (format: 'CSV' | 'JSON' | 'MARKDOWN') => void;
}

export const AboutAndExport: React.FC<AboutAndExportProps> = ({
  sources,
  records,
  events,
  importJobs,
  onExportLogged,
}) => {
  const [copied, setCopied] = useState(false);

  const downloadBlob = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    downloadBlob(
      exportRecordsToCsv(records),
      `aegis_mug_records_${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8'
    );
    onExportLogged('CSV');
  };

  const handleExportJson = () => {
    downloadBlob(
      exportDossierToJson(sources, records, events, importJobs),
      `aegis_mug_dossier_${new Date().toISOString().slice(0, 10)}.json`,
      'application/json;charset=utf-8'
    );
    onExportLogged('JSON');
  };

  const handleExportMarkdown = () => {
    downloadBlob(
      exportEvidenceReportMarkdown(sources, records, events),
      `aegis_mug_evidence_report_${new Date().toISOString().slice(0, 10)}.md`,
      'text/markdown;charset=utf-8'
    );
    onExportLogged('MARKDOWN');
  };

  const handleCopySummary = async () => {
    const summary = [
      'AegisμG — Microgravity Fire Safety Intelligence (SPECULATRON AI)',
      'NASA Space Apps Challenge 2026: Flame in Freefall',
      `Active Catalog: ${sources.length} NASA source citations, ${records.length} experiment records, ${events.length} DIWA provenance events.`,
      'Disclaimer: Independent, unofficial research prototype. Not NASA-endorsed or fire-safety certified.',
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked in restricted iframe
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">
          About, Scientific Methodology &amp; Data Export
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Full documentation, verified NASA bibliography, limitations, and provenance-preserving
          exports.
        </p>
      </header>

      {/* Export Controls */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Provenance-Preserving Exports
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every exported file preserves original measurement units, verification statuses,
              source URLs, and extraction methods.
            </p>
          </div>
          <span className="text-xs font-mono text-teal-400 tabular-nums">
            {records.length} record(s) ready
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-md bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-medium text-slate-950 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Canonical JSON</span>
          </button>
          <button
            type="button"
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Evidence Report (.md)</span>
          </button>
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>{copied ? 'Summary Copied' : 'Copy Project Summary'}</span>
          </button>
        </div>
      </section>

      {/* Mission, Methodology, Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-3 text-xs leading-relaxed text-slate-300">
          <h2 className="text-base font-semibold text-slate-100">
            Project Mission &amp; Disclaimer
          </h2>
          <p>
            <strong>AegisμG</strong> is built by <strong>SPECULATRON AI</strong> for the{' '}
            <strong>NASA Space Apps Challenge 2026</strong> (&ldquo;Flame in Freefall: SI-Powered
            Fire Safety Insights from Microgravity Combustion Data&rdquo;).
          </p>
          <p>
            Its purpose is to organize official NASA microgravity combustion investigations into a
            searchable, unit-preserving, evidence-traceable workspace so researchers and mission
            analysts can inspect exact conditions, spot missing measurements, and avoid invalid
            cross-regime comparisons.
          </p>
          <p className="text-amber-300">
            <strong>Independent Prototype Disclaimer:</strong> AegisμG is an independent,
            unofficial open-source research prototype. It is not endorsed by NASA, does not certify
            spacecraft materials, and must not be used for operational flight safety decisions.
          </p>
        </section>

        <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-3 text-xs leading-relaxed text-slate-300">
          <h2 className="text-base font-semibold text-slate-100">
            Methodology &amp; Scientific Limitations
          </h2>
          <p className="font-mono text-teal-300">{RELEVANCE_FORMULA_DESCRIPTION}</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Strict Null Policy:</strong> Missing numeric fields remain{' '}
              <span className="font-mono">null</span> (&ldquo;Not reported / Not verified&rdquo;)
              and are never replaced by zero or interpolated values.
            </li>
            <li>
              <strong>Partial-Gravity Gap:</strong> Microgravity (0 g) ISS/Cygnus findings do not
              empirically validate Lunar (0.165 g) or Martian (0.38 g) buoyant combustion behavior.
            </li>
            <li>
              <strong>Geometry &amp; Scale:</strong> Small MSG flow ducts (BASS-II) cannot be
              directly equated to large-scale spacecraft ducts (Saffire-I) or droplet chambers
              (FLEX) without wall-loss and flow-regime caveats.
            </li>
            <li>
              <strong>No-Key Guarantee:</strong> All search, validation, unit conversion,
              comparison, deterministic ranking, provenance logging, and exports run without a
              Gemini API key.
            </li>
            <li>
              <strong>Exploratory Digital Twin Boundary:</strong> The Digital Twin Sandbox replays
              NASA Table 5.1 rates linearly and computes a hypothetical 0D oxygen inventory; outputs
              are strictly non-NASA calculations and never safety or partial-gravity predictions.
            </li>
          </ul>
        </section>
      </div>

      {/* Data Dictionary & Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-3 text-xs text-slate-300">
          <h2 className="text-base font-semibold text-slate-100">Core Data Dictionary</h2>
          <dl className="divide-y divide-slate-800">
            {[
              ['experimentId', 'Unique record identifier (e.g., EXP-BASS-II-NTRS-2021)'],
              ['sourceId / sourceUrl', 'Canonical NASA citation ID and verified HTTPS link'],
              ['gravityContext', 'MICROGRAVITY_ISS, MICROGRAVITY_SPACECRAFT, PARTIAL_GRAVITY_*, etc.'],
              ['oxygenPercent', 'Nullable numeric O2 volume percentage (0-100)'],
              ['airflowVelocity / airflowUnit', 'Nullable numeric velocity paired with explicit unit (cm/s, m/s)'],
              ['reportedValue / units', 'Nullable primary measured outcome and exact preserved unit'],
              ['verificationStatus', 'SOURCE_LINK_ONLY, METADATA_REVIEWED, SOURCE_MATCHED, HUMAN_VERIFIED, CONTRADICTED'],
              ['originType', 'SOURCE_REPORTED, MANUALLY_CURATED, DERIVED_CALCULATION, AI_ASSISTED, HYPOTHETICAL'],
            ].map(([k, v]) => (
              <div key={k} className="py-2 flex flex-col sm:flex-row sm:justify-between gap-1">
                <dt className="font-mono text-teal-400">{k}</dt>
                <dd className="text-slate-300 sm:text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-3 text-xs text-slate-300">
          <h2 className="text-base font-semibold text-slate-100">
            Stack, AI Disclosure &amp; Roadmap
          </h2>
          <p>
            <strong>Architecture:</strong> React 19, TypeScript, Tailwind CSS v4, Recharts,
            PapaParse, Zod schema validation, Node.js + Express backend, and optional server-side{' '}
            <span className="font-mono">@google/genai</span> (<span className="font-mono">gemini-4-hydrogen</span>)
            with deterministic non-AI fallback.
          </p>
          <p>
            <strong>AI Disclosure:</strong> AI assistance is documented transparently in{' '}
            <span className="font-mono">AI_DISCLOSURE.md</span>. Runtime AI outputs are strictly
            labeled <span className="font-mono text-amber-300">AI-Assisted</span>, grounded to
            active record IDs, and never required for core operations.
          </p>
          <p>
            <strong>Roadmap:</strong> NASA PSI raw time-series ingestion, held-out calibration of
            reduced-order models against primary telemetry, and collaborative peer-review signoff
            workflows (see <span className="font-mono">ROADMAP.md</span> and{' '}
            <span className="font-mono">DIGITAL_TWIN_METHOD.md</span>).
          </p>
        </section>
      </div>

      {/* Verified NASA Source Bibliography */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-100">
          Verified NASA Source Bibliography ({sources.length})
        </h2>
        <div className="divide-y divide-slate-800">
          {sources.map((s) => (
            <div
              key={s.sourceId}
              className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-medium text-slate-100">{s.title}</div>
                <div className="text-slate-400">
                  <span className="font-mono text-teal-400">{s.sourceId}</span> · {s.nasaProgram} ·{' '}
                  {s.ingestionState} · Retrieved {s.retrievalDate}
                </div>
                <div className="text-slate-400">{s.notes}</div>
              </div>
              <a
                href={s.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-amber-300 hover:text-amber-200 whitespace-nowrap shrink-0"
              >
                <span>Open Reference</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
