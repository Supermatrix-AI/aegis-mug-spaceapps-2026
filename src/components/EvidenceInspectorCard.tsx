import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
import type {
  EvidenceInspectionRecord,
  ProvenanceClassification,
} from '../utils/evidenceEngine.ts';
import { OriginTag, VerificationTag } from './ScientificLabels.tsx';

const CLASSIFICATION_STYLES: Record<ProvenanceClassification, string> = {
  NASA_OBSERVED: 'border-teal-500/50 bg-teal-950/40 text-teal-300',
  NASA_REPORTED: 'border-sky-500/50 bg-sky-950/40 text-sky-300',
  DERIVED: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300',
  INTERPRETATION: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
  HYPOTHETICAL: 'border-rose-500/50 bg-rose-950/40 text-rose-300',
  UNVERIFIED: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
};

interface EvidenceInspectorCardProps {
  inspection: EvidenceInspectionRecord;
  onClose?: () => void;
}

export const EvidenceInspectorCard: React.FC<EvidenceInspectorCardProps> = ({
  inspection,
  onClose,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(inspection.sourceUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1800);
    } catch {
      // Clipboard blocked in restricted iframe context
    }
  };

  return (
    <div
      role="region"
      aria-label={`Evidence Integrity Inspector for ${inspection.id}`}
      className="rounded-lg border border-teal-500/40 bg-[#0A1120] p-4 sm:p-5 space-y-4 text-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-mono font-semibold text-teal-300">
              EVIDENCE INTEGRITY INSPECTOR · {inspection.id}
            </span>
          </div>
          <div className="text-sm font-medium text-slate-100">{inspection.title}</div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span
            className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] font-semibold whitespace-nowrap shrink-0 ${CLASSIFICATION_STYLES[inspection.classification]}`}
          >
            {inspection.classification}
          </span>
          {inspection.needsSourceCheck && (
            <span className="inline-flex items-center gap-1 rounded border border-rose-500/50 bg-rose-950/40 px-2 py-0.5 font-mono text-[11px] text-rose-300 whitespace-nowrap shrink-0">
              <AlertTriangle className="w-3 h-3" />
              <span>NEEDS_SOURCE_CHECK</span>
            </span>
          )}
          <OriginTag origin={inspection.originType} />
          <VerificationTag status={inspection.verificationStatus} />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {inspection.needsSourceCheckReason && (
        <div className="rounded border border-rose-500/40 bg-rose-950/20 p-2.5 text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{inspection.needsSourceCheckReason}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <dl className="space-y-1.5 rounded border border-slate-800 bg-[#070B14] p-3">
          <div className="flex justify-between gap-2">
            <dt className="text-slate-400">NASA Source ID:</dt>
            <dd className="font-mono text-slate-200 text-right">{inspection.sourceId}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-400">Report / DOI:</dt>
            <dd className="font-mono text-slate-200 text-right">{inspection.reportOrDoi}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-slate-400">Authentic Locator ({inspection.locatorKind}):</dt>
            <dd className="font-mono text-amber-300 text-right">{inspection.locator}</dd>
          </div>
          <div className="flex justify-between gap-2 items-center pt-1">
            <dt className="text-slate-400">Source Link:</dt>
            <dd className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyUrl}
                className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-200 cursor-pointer"
              >
                {copiedUrl ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
                <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
              </button>
              <a
                href={inspection.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-teal-400 hover:text-teal-300 underline"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </dd>
          </div>
        </dl>

        <dl className="space-y-1.5 rounded border border-slate-800 bg-[#070B14] p-3">
          <div>
            <dt className="text-slate-400">Missingness Discipline:</dt>
            <dd className="text-slate-200 mt-0.5">{inspection.missingnessStatus}</dd>
          </div>
          <div className="pt-1">
            <dt className="text-slate-400">Uncertainty Reporting:</dt>
            <dd className="font-mono text-amber-300/90 mt-0.5">{inspection.uncertaintyStatus}</dd>
          </div>
          {inspection.sha256Hash && (
            <div className="pt-1">
              <dt className="text-slate-400">Artifact SHA-256 Digest:</dt>
              <dd className="font-mono text-[11px] text-slate-400 truncate" title={inspection.sha256Hash}>
                {inspection.sha256Hash}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* 6-Stage Evidence Lineage Chain */}
      <div className="space-y-2">
        <div className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          6-Stage Lineage Chain (NASA SOURCE → EXPERIMENT → MEASUREMENT → DERIVED ANALYSIS → INTERPRETATION → RESEARCH RECOMMENDATION)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          {inspection.evidenceChain.map((step) => (
            <div
              key={step.stage}
              className="rounded border border-slate-800 bg-[#070B14] p-2.5 space-y-1"
            >
              <div className="font-mono text-[10px] font-semibold text-teal-400">
                {step.stage}
              </div>
              <div className="text-[11px] text-slate-200 leading-snug">{step.detail}</div>
              <div className="font-mono text-[10px] text-slate-500 truncate" title={step.locator}>
                {step.locator}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
