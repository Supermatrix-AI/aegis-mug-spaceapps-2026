import React from 'react';
import type { EvidenceOriginType, VerificationStatus } from '../types/scientific.ts';

const VERIFICATION_META: Record<
  VerificationStatus,
  { glyph: string; label: string; classes: string; description: string }
> = {
  HUMAN_VERIFIED: {
    glyph: '●',
    label: 'HUMAN_VERIFIED',
    classes: 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40',
    description: 'Independently reviewed by a human researcher against the cited NASA source.',
  },
  SOURCE_MATCHED: {
    glyph: '◆',
    label: 'SOURCE_MATCHED',
    classes: 'text-teal-300 border-teal-500/40 bg-teal-950/40',
    description: 'Fields cross-checked against official NASA source documentation.',
  },
  METADATA_REVIEWED: {
    glyph: '◇',
    label: 'METADATA_REVIEWED',
    classes: 'text-sky-300 border-sky-500/40 bg-sky-950/40',
    description: 'Official NASA citation metadata verified; run-level numeric tables pending.',
  },
  SOURCE_LINK_ONLY: {
    glyph: '▲',
    label: 'SOURCE_LINK_ONLY (Unverified)',
    classes: 'text-amber-300 border-amber-500/40 bg-amber-950/40',
    description: 'Indexed link or user-imported data awaiting independent verification.',
  },
  CONTRADICTED: {
    glyph: '✖',
    label: 'CONTRADICTED',
    classes: 'text-rose-300 border-rose-500/40 bg-rose-950/40',
    description: 'Discrepancy or contradiction documented in DIWA provenance audit.',
  },
};

export const VerificationTag: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  const meta = VERIFICATION_META[status];
  return (
    <span
      title={meta.description}
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-mono tracking-tight whitespace-nowrap shrink-0 ${meta.classes}`}
    >
      <span aria-hidden="true">{meta.glyph}</span>
      <span>{meta.label}</span>
    </span>
  );
};

const ORIGIN_META: Record<
  EvidenceOriginType,
  { label: string; classes: string }
> = {
  SOURCE_REPORTED: {
    label: 'Source-Reported',
    classes: 'text-teal-300 border-teal-500/30 bg-teal-950/30',
  },
  MANUALLY_CURATED: {
    label: 'Curated Metadata',
    classes: 'text-slate-300 border-slate-700 bg-slate-900/70',
  },
  DERIVED_CALCULATION: {
    label: 'Derived Calculation',
    classes: 'text-sky-300 border-sky-500/30 bg-sky-950/30',
  },
  AI_ASSISTED: {
    label: 'AI-Assisted',
    classes: 'text-amber-300 border-amber-500/30 bg-amber-950/30',
  },
  HYPOTHETICAL: {
    label: 'Hypothetical / Synthetic',
    classes: 'text-rose-300 border-rose-500/40 bg-rose-950/40',
  },
};

export const OriginTag: React.FC<{ origin: EvidenceOriginType }> = ({ origin }) => {
  const meta = ORIGIN_META[origin];
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-mono whitespace-nowrap shrink-0 ${meta.classes}`}
    >
      {meta.label}
    </span>
  );
};
