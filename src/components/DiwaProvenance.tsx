import React, { useMemo, useState } from 'react';
import { CheckCircle2, Globe, ShieldAlert, ShieldCheck } from 'lucide-react';
import type {
  ExperimentRecord,
  ProvenanceAction,
  ProvenanceEvent,
  SourceDocument,
} from '../types/scientific.ts';
import { VerificationTag } from './ScientificLabels.tsx';

interface DiwaProvenanceProps {
  sources: SourceDocument[];
  records: ExperimentRecord[];
  events: ProvenanceEvent[];
  onLogUrlCheck: (url: string, details: string) => void;
}

export const DiwaProvenance: React.FC<DiwaProvenanceProps> = ({
  sources,
  records,
  events,
  onLogUrlCheck,
}) => {
  const [actionFilter, setActionFilter] = useState<'ALL' | ProvenanceAction>('ALL');
  const [urlToVerify, setUrlToVerify] = useState(
    sources[0]?.sourceUrl ?? 'https://ntrs.nasa.gov/citations/20210011385'
  );
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyOutput, setVerifyOutput] = useState<{
    valid: boolean;
    approvedDomain: boolean;
    reachable: boolean;
    httpStatus: number | null;
    reason: string;
    networkNote?: string;
  } | null>(null);

  const filteredEvents = useMemo(() => {
    const ordered = [...events].reverse();
    if (actionFilter === 'ALL') return ordered;
    return ordered.filter((e) => e.action === actionFilter);
  }, [events, actionFilter]);

  const handleVerifyUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyLoading(true);
    setVerifyOutput(null);
    try {
      const res = await fetch('/api/sources/verify-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToVerify }),
      });
      const data = await res.json();
      setVerifyOutput({
        valid: Boolean(data.valid),
        approvedDomain: Boolean(data.approvedDomain),
        reachable: Boolean(data.reachable),
        httpStatus: data.httpStatus ?? null,
        reason: data.reason ?? data.error ?? 'Checked URL.',
        networkNote: data.networkNote,
      });
      onLogUrlCheck(
        urlToVerify,
        `Domain check: ${data.approvedDomain ? 'Approved NASA domain' : 'Blocked/Unapproved'} · HTTP ${data.httpStatus ?? 'N/A'}`
      );
    } catch (err) {
      setVerifyOutput({
        valid: false,
        approvedDomain: false,
        reachable: false,
        httpStatus: null,
        reason: err instanceof Error ? err.message : 'Verification request failed.',
      });
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-50">
          DIWA Provenance &amp; Audit Trail
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Inspectable data lineage, extraction methods, byte-level SHA-256 integrity digests, and
          immutable verification activity logs.
        </p>
      </header>

      {/* Explicit 6-Stage DIWA Evidence Assurance Chain */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-100">
            DIWA Evidence Assurance Chain
          </h2>
          <span className="text-xs font-mono text-teal-400">
            Zero Auto-Promotion · Explicit Null &amp; Origin Separation
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 text-xs">
          {[
            {
              stage: '1. SOURCE',
              metric: `${sources.length} NASA URLs`,
              detail: 'Verified NTRS, PSI, OCHMO, Space Apps references',
            },
            {
              stage: '2. EXPERIMENT',
              metric: `${records.length} + 20 runs`,
              detail: 'Core catalog + full Table 5.1 PMMA series',
            },
            {
              stage: '3. MEASUREMENT',
              metric: `${records.reduce((a, r) => a + r.measurements.length, 0)} + 43 segs`,
              detail: 'Original units preserved; untracked rates kept null',
            },
            {
              stage: '4. CLAIM',
              metric: `${records.reduce((a, r) => a + r.findings.length, 0)} findings`,
              detail: 'Explicit verification status & citation locators',
            },
            {
              stage: '5. INTERPRETATION',
              metric: '12/13 + M3',
              detail: 'Deterministic ranking & AI-assisted labeled separately',
            },
            {
              stage: '6. RECOMMENDATION',
              metric: 'PSI-25/98 Next',
              detail: 'Research follow-up only — never safety certification',
            },
          ].map((node) => (
            <div key={node.stage} className="rounded border border-slate-800 bg-[#070B14] p-3 space-y-1">
              <div className="font-mono text-[11px] font-semibold text-teal-400">{node.stage}</div>
              <div className="font-mono text-sm font-semibold text-slate-100 tabular-nums">
                {node.metric}
              </div>
              <div className="text-[11px] text-slate-400 leading-snug">{node.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrity Caveat & SSRF-Safe NASA URL Verifier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Integrity Hash vs. Scientific Verification
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            When a CSV or JSON dataset is uploaded, AegisμG computes a SHA-256 digest over the exact
            uploaded file bytes. A matching SHA-256 hash proves file consistency and absence of
            alteration after capture — it does{' '}
            <span className="font-semibold text-amber-300">not</span> verify scientific
            correctness, experimental accuracy, or NASA peer review.
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            No imported or parsed record is ever automatically promoted to{' '}
            <span className="font-mono text-emerald-300">HUMAN_VERIFIED</span>.
          </p>
        </section>

        <section className="lg:col-span-7 rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-400" />
            <h2 className="text-base font-semibold text-slate-100">
              SSRF-Protected NASA Source Domain Verifier
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Validates HTTPS syntax, blocks private IPs/redirects, and checks official NASA/SpaceApps
            domain allowlists (<span className="font-mono">ntrs.nasa.gov</span>,{' '}
            <span className="font-mono">psi.nasa.gov</span>,{' '}
            <span className="font-mono">www.nasa.gov</span>,{' '}
            <span className="font-mono">spaceappschallenge.org</span>).
          </p>

          <form onSubmit={handleVerifyUrl} className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={urlToVerify}
              onChange={(e) => setUrlToVerify(e.target.value)}
              aria-label="NASA Source URL to verify"
              className="flex-1 rounded border border-slate-700 bg-[#070B14] px-3 py-2 font-mono text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={verifyLoading}
              className="rounded-md bg-teal-600 hover:bg-teal-500 disabled:opacity-60 px-4 py-2 text-xs font-medium text-slate-950 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {verifyLoading ? 'Checking...' : 'Verify NASA URL'}
            </button>
          </form>

          {verifyOutput && (
            <div className="rounded border border-slate-800 bg-[#070B14] p-3 text-xs space-y-1">
              <div className="flex items-center gap-2 font-mono">
                {verifyOutput.approvedDomain ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className={verifyOutput.approvedDomain ? 'text-emerald-300' : 'text-rose-300'}>
                  {verifyOutput.reason}
                </span>
              </div>
              <div className="font-mono text-slate-400">
                HTTP Status: {verifyOutput.httpStatus ?? 'Not reached'} · Reachable:{' '}
                {verifyOutput.reachable ? 'Yes' : 'No'}
              </div>
              {verifyOutput.networkNote && (
                <div className="text-slate-400">{verifyOutput.networkNote}</div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Record Lineage & Hash Table */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-100">
            Record Lineage &amp; Extraction Provenance ({records.length})
          </h2>
          <ShieldCheck className="w-4 h-4 text-teal-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080D18] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Record ID</th>
                <th className="px-4 py-3 font-medium">Source Document</th>
                <th className="px-4 py-3 font-medium">Extraction Method</th>
                <th className="px-4 py-3 font-medium">Retrieval Date</th>
                <th className="px-4 py-3 font-medium">SHA-256 Digest</th>
                <th className="px-4 py-3 font-medium">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {records.map((r) => (
                <tr key={r.experimentId}>
                  <td className="px-4 py-3 font-mono text-teal-400">{r.experimentId}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-200 max-w-xs truncate">{r.paperTitle}</div>
                    <div className="font-mono text-[11px] text-slate-400">{r.sourceId}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">{r.extractionMethod}</td>
                  <td className="px-4 py-3 font-mono tabular-nums text-slate-400">
                    {r.retrievalDate}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-400 max-w-[160px] truncate" title={r.sha256Hash ?? 'None'}>
                    {r.sha256Hash ? `${r.sha256Hash.slice(0, 16)}…` : 'Not hashed'}
                  </td>
                  <td className="px-4 py-3">
                    <VerificationTag status={r.verificationStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Source-to-Claim Traceability Audit */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Source-to-Claim Traceability Audit
            </h2>
            <p className="text-xs text-slate-400">
              Verifies that every displayed finding and numeric measurement carries a source ID,
              locator, verification status, and explicit units.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 tabular-nums">
            {records.reduce((acc, r) => acc + r.findings.length + r.measurements.length, 0)}{' '}
            claims audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080D18] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Claim / Metric ID</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Source &amp; Locator</th>
                <th className="px-4 py-3 font-medium">Value / Units</th>
                <th className="px-4 py-3 font-medium">Traceability Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {records.flatMap((r) => [
                ...r.findings.map((f) => {
                  const invalidAutoVerify =
                    f.verificationStatus === 'HUMAN_VERIFIED' &&
                    (f.originType === 'AI_ASSISTED' || f.originType === 'HYPOTHETICAL');
                  const traceOk = Boolean(r.sourceId && r.sourceUrl && f.citationLocator && !invalidAutoVerify);
                  return (
                    <tr key={`${r.experimentId}-${f.findingId}`}>
                      <td className="px-4 py-2.5 font-mono text-teal-400">{f.findingId}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-300">
                        Finding ({f.originType})
                      </td>
                      <td className="px-4 py-2.5 text-slate-300">
                        <div className="font-mono text-[11px]">{r.sourceId}</div>
                        <div className="text-slate-400">
                          {f.citationLocator ?? 'Missing locator'}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">Qualitative finding</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`font-mono ${traceOk ? 'text-emerald-400' : 'text-amber-300'}`}
                        >
                          {traceOk ? '● PASS' : '▲ NEEDS CITATION'}
                        </span>
                      </td>
                    </tr>
                  );
                }),
                ...r.measurements.map((m) => {
                  const hasUnitsIfNumeric = m.reportedValue === null || Boolean(m.units);
                  const traceOk = Boolean(
                    r.sourceId && m.sourceUrl && m.citationLocator && hasUnitsIfNumeric
                  );
                  return (
                    <tr key={`${r.experimentId}-${m.measurementId}`}>
                      <td className="px-4 py-2.5 font-mono text-amber-300">{m.measurementId}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-300">
                        Measurement ({m.originType})
                      </td>
                      <td className="px-4 py-2.5 text-slate-300">
                        <div className="font-mono text-[11px]">{r.sourceId}</div>
                        <div className="text-slate-400">
                          {m.citationLocator ?? 'Missing locator'}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono tabular-nums text-slate-200">
                        {m.reportedValue !== null ? `${m.reportedValue} ${m.units ?? ''}` : 'N/R'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`font-mono ${traceOk ? 'text-emerald-400' : 'text-rose-400'}`}
                        >
                          {traceOk ? '● PASS' : '✖ INCOMPLETE'}
                        </span>
                      </td>
                    </tr>
                  );
                }),
              ])}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inspectable Activity Log */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-100">
            DIWA Evidence Activity Log ({filteredEvents.length})
          </h2>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as 'ALL' | ProvenanceAction)}
            aria-label="Filter provenance events by action"
            className="rounded border border-slate-700 bg-[#070B14] px-3 py-1.5 text-xs text-slate-100"
          >
            <option value="ALL">All Event Types</option>
            <option value="DATA_IMPORTED">DATA_IMPORTED</option>
            <option value="DATA_MODIFIED">DATA_MODIFIED</option>
            <option value="SOURCE_LINKED">SOURCE_LINKED</option>
            <option value="VALIDATION_COMPLETED">VALIDATION_COMPLETED</option>
            <option value="VERIFICATION_STATUS_CHANGED">VERIFICATION_STATUS_CHANGED</option>
            <option value="EXPORT_GENERATED">EXPORT_GENERATED</option>
          </select>
        </div>

        <div className="divide-y divide-slate-800 border border-slate-800 rounded bg-[#070B14]">
          {filteredEvents.map((evt) => (
            <div key={evt.eventId} className="p-4 space-y-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-teal-400 font-medium">{evt.action}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="font-mono text-slate-300">{evt.recordId}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400">{evt.actor}</span>
                </div>
                <span className="font-mono tabular-nums text-slate-500">{evt.timestamp}</span>
              </div>
              <p className="text-slate-200">{evt.details}</p>
              {(evt.previousValue || evt.newValue) && (
                <div className="font-mono text-[11px] text-slate-400">
                  {evt.previousValue ? `From: ${evt.previousValue} -> ` : ''}
                  {evt.newValue ? `To: ${evt.newValue}` : ''}
                </div>
              )}
              {evt.hashNote && (
                <div className="font-mono text-[11px] text-amber-300/80">{evt.hashNote}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
