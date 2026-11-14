import Papa from 'papaparse';
import { ExperimentRecordSchema, GravityContextSchema, EvidenceOriginTypeSchema } from '../schemas/scientific.ts';
import type {
  ExperimentRecord,
  ExtractionMethod,
  GravityContext,
  ImportJob,
  ProvenanceEvent,
  SourceDocument,
  ValidationIssue,
} from '../types/scientific.ts';
import { computeSha256Hex, sanitizeImportedText, validateSourceUrl } from './security.ts';

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024; // 2 MB

export const CANONICAL_IMPORT_FIELDS = [
  'experimentId',
  'sourceId',
  'investigationId',
  'experimentFamily',
  'paperTitle',
  'institution',
  'sourceUrl',
  'reportId',
  'material',
  'fuelType',
  'gravityContext',
  'oxygenPercent',
  'airflowVelocity',
  'airflowUnit',
  'experimentGeometry',
  'measurementType',
  'observedOutcome',
  'reportedValue',
  'units',
  'uncertainty',
  'citationLocator',
  'originalExcerptShort',
  'originType',
  'notes',
] as const;

export type CanonicalField = (typeof CANONICAL_IMPORT_FIELDS)[number];
export type ColumnMapping = Record<CanonicalField, string>;

export function inferColumnMapping(headers: string[]): ColumnMapping {
  const lowerMap = new Map(headers.map((h) => [h.trim().toLowerCase(), h]));
  const mapping = {} as ColumnMapping;
  for (const field of CANONICAL_IMPORT_FIELDS) {
    const exact = lowerMap.get(field.toLowerCase());
    if (exact) {
      mapping[field] = exact;
    } else {
      const snake = field.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
      mapping[field] = lowerMap.get(snake) ?? '';
    }
  }
  return mapping;
}

function parseNullableNumber(
  raw: unknown,
  field: string,
  rowIndex: number,
  issues: ValidationIssue[]
): number | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (s === '' || s.toLowerCase() === 'null' || s.toLowerCase() === 'n/a' || s.toLowerCase() === 'not reported') {
    return null;
  }
  const num = Number(s);
  if (!Number.isFinite(num)) {
    issues.push({
      rowIndex,
      field,
      message: `Invalid numeric value "${s}". Missing values must be blank or null—never non-numeric text.`,
      severity: 'ERROR',
    });
    return null;
  }
  return num;
}

function parseNullableString(raw: unknown, maxLen = 600): string | null {
  if (raw === null || raw === undefined) return null;
  const cleaned = sanitizeImportedText(raw, maxLen);
  if (!cleaned || cleaned.toLowerCase() === 'null') return null;
  return cleaned;
}

export interface ParsedImportResult {
  accepted: ExperimentRecord[];
  issues: ValidationIssue[];
  duplicateIds: string[];
  totalRows: number;
}

export function validateAndNormalizeRows(
  rawRows: Record<string, unknown>[],
  mapping: ColumnMapping,
  existingRecords: ExperimentRecord[],
  extractionMethod: ExtractionMethod,
  sha256Hex: string
): ParsedImportResult {
  const issues: ValidationIssue[] = [];
  const accepted: ExperimentRecord[] = [];
  const duplicateIds: string[] = [];

  const existingIds = new Set(existingRecords.map((r) => r.experimentId.toLowerCase()));
  const existingSignatures = new Set(
    existingRecords.map(
      (r) =>
        `${r.sourceUrl.toLowerCase()}|${(r.material ?? '').toLowerCase()}|${(r.measurementType ?? '').toLowerCase()}|${r.reportedValue ?? 'null'}`
    )
  );
  const batchIds = new Set<string>();
  const nowIso = new Date().toISOString().slice(0, 10);

  rawRows.forEach((rawRow, idx) => {
    const rowNumber = idx + 1;
    const rowIssues: ValidationIssue[] = [];

    const getVal = (field: CanonicalField): unknown => {
      const mappedCol = mapping[field];
      if (mappedCol && mappedCol in rawRow) return rawRow[mappedCol];
      if (field in rawRow) return rawRow[field];
      return undefined;
    };

    const experimentId =
      parseNullableString(getVal('experimentId'), 80) ?? `EXP-IMPORT-${rowNumber}-${sha256Hex.slice(0, 6)}`;
    const sourceUrlRaw = parseNullableString(getVal('sourceUrl'), 400) ?? '';
    const urlCheck = validateSourceUrl(sourceUrlRaw);

    if (!urlCheck.valid || !urlCheck.normalizedUrl) {
      rowIssues.push({
        rowIndex: rowNumber,
        field: 'sourceUrl',
        message: urlCheck.reason,
        severity: 'ERROR',
      });
    } else if (!urlCheck.approvedDomain) {
      issues.push({
        rowIndex: rowNumber,
        field: 'sourceUrl',
        message: `${urlCheck.reason} Record remains unverified.`,
        severity: 'WARNING',
      });
    }

    const rawGravity = parseNullableString(getVal('gravityContext'), 60) ?? 'UNSPECIFIED';
    const gravityParsed = GravityContextSchema.safeParse(rawGravity);
    const gravityContext: GravityContext = gravityParsed.success ? gravityParsed.data : 'UNSPECIFIED';
    if (!gravityParsed.success) {
      issues.push({
        rowIndex: rowNumber,
        field: 'gravityContext',
        message: `Unrecognized gravityContext "${rawGravity}"; defaulted to UNSPECIFIED.`,
        severity: 'WARNING',
      });
    }

    const rawOrigin = parseNullableString(getVal('originType'), 40) ?? 'SOURCE_REPORTED';
    const originParsed = EvidenceOriginTypeSchema.safeParse(rawOrigin);
    const originType = originParsed.success ? originParsed.data : 'MANUALLY_CURATED';

    const oxygenPercent = parseNullableNumber(getVal('oxygenPercent'), 'oxygenPercent', rowNumber, rowIssues);
    const airflowVelocity = parseNullableNumber(getVal('airflowVelocity'), 'airflowVelocity', rowNumber, rowIssues);
    const reportedValue = parseNullableNumber(getVal('reportedValue'), 'reportedValue', rowNumber, rowIssues);

    const airflowUnit = parseNullableString(getVal('airflowUnit'), 40);
    const units = parseNullableString(getVal('units'), 40);
    const material = parseNullableString(getVal('material'), 240);
    const measurementType = parseNullableString(getVal('measurementType'), 160);

    // Duplicate checks
    const idLower = experimentId.toLowerCase();
    const signature = `${(urlCheck.normalizedUrl ?? sourceUrlRaw).toLowerCase()}|${(material ?? '').toLowerCase()}|${(measurementType ?? '').toLowerCase()}|${reportedValue ?? 'null'}`;

    if (existingIds.has(idLower) || batchIds.has(idLower) || existingSignatures.has(signature)) {
      duplicateIds.push(experimentId);
      rowIssues.push({
        rowIndex: rowNumber,
        field: 'experimentId',
        message: `Duplicate record detected (${experimentId} or matching source/material/measurement signature).`,
        severity: 'ERROR',
      });
    }

    const candidate: ExperimentRecord = {
      experimentId,
      sourceId: parseNullableString(getVal('sourceId'), 80) ?? `SRC-USER-${sha256Hex.slice(0, 8)}`,
      investigationId: parseNullableString(getVal('investigationId'), 80) ?? 'INV-USER-IMPORT',
      experimentFamily: parseNullableString(getVal('experimentFamily'), 80) ?? 'User Imported',
      paperTitle: parseNullableString(getVal('paperTitle'), 280) ?? '',
      institution: parseNullableString(getVal('institution'), 180) ?? 'Not reported',
      sourceUrl: urlCheck.normalizedUrl ?? sourceUrlRaw,
      reportId: parseNullableString(getVal('reportId'), 100),
      material,
      fuelType: parseNullableString(getVal('fuelType'), 80),
      gravityContext,
      oxygenPercent,
      airflowVelocity,
      airflowUnit,
      experimentGeometry: parseNullableString(getVal('experimentGeometry'), 200),
      measurementType,
      observedOutcome: parseNullableString(getVal('observedOutcome'), 1200),
      reportedValue,
      units,
      uncertainty: parseNullableString(getVal('uncertainty'), 120),
      citationLocator: parseNullableString(getVal('citationLocator'), 200),
      originalExcerptShort: parseNullableString(getVal('originalExcerptShort'), 380),
      extractionMethod,
      // Security & scientific safeguard: user-imported records are ALWAYS flagged unverified until reviewed.
      verificationStatus: 'SOURCE_LINK_ONLY',
      originType,
      retrievalDate: nowIso,
      sha256Hash: sha256Hex,
      notes: parseNullableString(getVal('notes'), 1000),
      measurements:
        reportedValue !== null
          ? [
              {
                measurementId: `MEAS-${experimentId}`,
                measurementType: measurementType ?? 'Reported outcome',
                parameterName: measurementType ?? 'Primary outcome',
                reportedValue,
                units,
                uncertainty: parseNullableString(getVal('uncertainty'), 120),
                citationLocator: parseNullableString(getVal('citationLocator'), 200),
                originalExcerptShort: parseNullableString(getVal('originalExcerptShort'), 380),
                originType,
                verificationStatus: 'SOURCE_LINK_ONLY',
                sourceUrl: urlCheck.normalizedUrl ?? sourceUrlRaw,
              },
            ]
          : [],
      findings: [],
    };

    const zodRes = ExperimentRecordSchema.safeParse(candidate);
    if (!zodRes.success) {
      for (const zErr of zodRes.error.issues) {
        rowIssues.push({
          rowIndex: rowNumber,
          field: zErr.path.join('.') || 'record',
          message: zErr.message,
          severity: 'ERROR',
        });
      }
    }

    if (rowIssues.length > 0) {
      issues.push(...rowIssues);
    } else if (zodRes.success) {
      batchIds.add(idLower);
      existingSignatures.add(signature);
      accepted.push(zodRes.data);
    }
  });

  return {
    accepted,
    issues,
    duplicateIds,
    totalRows: rawRows.length,
  };
}

export async function parseCsvImportPreview(fileContent: string): Promise<{
  headers: string[];
  rows: Record<string, unknown>[];
  sha256Hex: string;
}> {
  const sha256Hex = await computeSha256Hex(fileContent);
  const parsed = Papa.parse<Record<string, unknown>>(fileContent, {
    header: true,
    skipEmptyLines: true,
  });
  return {
    headers: parsed.meta.fields ?? [],
    rows: parsed.data ?? [],
    sha256Hex,
  };
}

export async function parseJsonImportPreview(fileContent: string): Promise<{
  headers: string[];
  rows: Record<string, unknown>[];
  sha256Hex: string;
}> {
  const sha256Hex = await computeSha256Hex(fileContent);
  const raw = JSON.parse(fileContent) as unknown;
  const rows: Record<string, unknown>[] = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : raw && typeof raw === 'object' && Array.isArray((raw as { records?: unknown[] }).records)
      ? ((raw as { records: Record<string, unknown>[] }).records ?? [])
      : [];
  const headerSet = new Set<string>();
  rows.forEach((r) => {
    if (r && typeof r === 'object') {
      Object.keys(r).forEach((k) => headerSet.add(k));
    }
  });
  return {
    headers: Array.from(headerSet),
    rows,
    sha256Hex,
  };
}

export function buildBlankCsvTemplate(): string {
  return Papa.unparse({
    fields: [...CANONICAL_IMPORT_FIELDS],
    data: [
      {
        experimentId: 'EXP-USER-001',
        sourceId: 'SRC-NTRS-20210011385',
        investigationId: 'INV-BASS-II',
        experimentFamily: 'BASS-II',
        paperTitle: 'Example BASS-II Extracted Run (Replace with verified paper title)',
        institution: 'NASA Glenn Research Center',
        sourceUrl: 'https://ntrs.nasa.gov/citations/20210011385',
        reportId: 'NTRS-20210011385',
        material: 'PMMA rod or cotton-fiberglass sample (specify exact)',
        fuelType: 'Solid fuel',
        gravityContext: 'MICROGRAVITY_ISS',
        oxygenPercent: '',
        airflowVelocity: '',
        airflowUnit: 'cm/s',
        experimentGeometry: 'ISS MSG flow duct',
        measurementType: 'Flame spread rate',
        observedOutcome: 'Enter documented observation from source citation',
        reportedValue: '',
        units: 'mm/s',
        uncertainty: '',
        citationLocator: 'Table X / Page Y',
        originalExcerptShort: '',
        originType: 'SOURCE_REPORTED',
        notes: 'Leave numeric fields blank if not reported in the source.',
      },
    ],
  });
}

/**
 * Generates an explicitly marked HYPOTHETICAL QA fixture for validating
 * CSV import, unit conversion, and comparator charts without falsifying NASA data.
 */
export function buildSyntheticQaFixtureCsv(): string {
  return Papa.unparse({
    fields: [...CANONICAL_IMPORT_FIELDS],
    data: [
      {
        experimentId: 'QA-SYNTH-001',
        sourceId: 'SRC-QA-SYNTHETIC',
        investigationId: 'INV-QA-TEST',
        experimentFamily: 'BASS-II',
        paperTitle: '[SYNTHETIC QA FIXTURE - NOT NASA DATA] Simulated Solid-Fuel Run A',
        institution: 'QA Validation Fixture',
        sourceUrl: 'https://ntrs.nasa.gov/citations/20210011385',
        reportId: 'QA-FIXTURE-01',
        material: 'Synthetic PMMA test fixture',
        fuelType: 'Solid fuel',
        gravityContext: 'MICROGRAVITY_ISS',
        oxygenPercent: '21.0',
        airflowVelocity: '10.0',
        airflowUnit: 'cm/s',
        experimentGeometry: 'Small flow duct (QA fixture)',
        measurementType: 'Flame spread rate',
        observedOutcome: 'Synthetic validation fixture row for testing unit conversion and comparator plots.',
        reportedValue: '2.4',
        units: 'mm/s',
        uncertainty: '±0.2 mm/s (synthetic)',
        citationLocator: 'QA Fixture Row 1',
        originalExcerptShort: 'Not an authentic NASA quote — QA fixture only.',
        originType: 'HYPOTHETICAL',
        notes: 'Synthetic QA test fixture — do NOT cite as authentic NASA experimental data.',
      },
      {
        experimentId: 'QA-SYNTH-002',
        sourceId: 'SRC-QA-SYNTHETIC',
        investigationId: 'INV-QA-TEST',
        experimentFamily: 'Saffire',
        paperTitle: '[SYNTHETIC QA FIXTURE - NOT NASA DATA] Simulated Large-Duct Run B',
        institution: 'QA Validation Fixture',
        sourceUrl: 'https://psi.nasa.gov/physci/repo/data/investigations/PSI-98',
        reportId: 'QA-FIXTURE-02',
        material: 'Synthetic cotton-fiberglass fixture',
        fuelType: 'Solid textile',
        gravityContext: 'MICROGRAVITY_SPACECRAFT',
        oxygenPercent: '21.0',
        airflowVelocity: '0.20',
        airflowUnit: 'm/s',
        experimentGeometry: 'Large spacecraft duct (QA fixture)',
        measurementType: 'Flame spread rate',
        observedOutcome: 'Synthetic validation fixture row demonstrating m/s -> cm/s and cm/s -> mm/s conversions.',
        reportedValue: '0.38',
        units: 'cm/s',
        uncertainty: '±0.05 cm/s (synthetic)',
        citationLocator: 'QA Fixture Row 2',
        originalExcerptShort: 'Not an authentic NASA quote — QA fixture only.',
        originType: 'HYPOTHETICAL',
        notes: 'Synthetic QA test fixture — do NOT cite as authentic NASA experimental data.',
      },
    ],
  });
}

export function exportRecordsToCsv(records: ExperimentRecord[]): string {
  const flat = records.map((r) => ({
    experimentId: r.experimentId,
    sourceId: r.sourceId,
    investigationId: r.investigationId,
    experimentFamily: r.experimentFamily,
    paperTitle: r.paperTitle,
    institution: r.institution,
    sourceUrl: r.sourceUrl,
    reportId: r.reportId ?? '',
    material: r.material ?? 'Not reported / Not verified',
    fuelType: r.fuelType ?? 'Not reported / Not verified',
    gravityContext: r.gravityContext,
    oxygenPercent: r.oxygenPercent ?? '',
    airflowVelocity: r.airflowVelocity ?? '',
    airflowUnit: r.airflowUnit ?? '',
    experimentGeometry: r.experimentGeometry ?? 'Not reported / Not verified',
    measurementType: r.measurementType ?? 'Not reported / Not verified',
    reportedValue: r.reportedValue ?? '',
    units: r.units ?? '',
    uncertainty: r.uncertainty ?? 'Not reported / Not verified',
    citationLocator: r.citationLocator ?? 'Not reported / Not verified',
    extractionMethod: r.extractionMethod,
    verificationStatus: r.verificationStatus,
    originType: r.originType,
    retrievalDate: r.retrievalDate,
    sha256Hash: r.sha256Hash ?? '',
    observedOutcome: r.observedOutcome ?? 'Not reported / Not verified',
    notes: r.notes ?? '',
  }));
  return Papa.unparse(flat);
}

export function exportDossierToJson(
  sources: SourceDocument[],
  records: ExperimentRecord[],
  events: ProvenanceEvent[],
  importJobs: ImportJob[]
): string {
  return JSON.stringify(
    {
      application: 'AegisμG — Microgravity Fire Safety Intelligence',
      creator: 'SPECULATRON AI',
      challenge: 'NASA Space Apps Challenge 2026 — Flame in Freefall',
      disclaimer:
        'Independent, unofficial research prototype. Not NASA-endorsed and not a spacecraft fire-safety certification tool.',
      exportedAt: new Date().toISOString(),
      sourceCount: sources.length,
      recordCount: records.length,
      sources,
      records,
      provenanceEvents: events,
      importJobs,
    },
    null,
    2
  );
}

export function exportEvidenceReportMarkdown(
  sources: SourceDocument[],
  records: ExperimentRecord[],
  events: ProvenanceEvent[]
): string {
  const lines: string[] = [
    '# AegisμG — Microgravity Fire Safety Evidence Report',
    '',
    `- **Generated:** ${new Date().toISOString()}`,
    '- **Creator:** SPECULATRON AI',
    '- **Challenge:** NASA Space Apps Challenge 2026 — Flame in Freefall',
    '- **Disclaimer:** Independent, unofficial research prototype. Does not represent NASA endorsement or fire-safety certification.',
    '',
    '## Summary Counts',
    `- Authoritative Sources Indexed: ${sources.length}`,
    `- Experiment Records: ${records.length}`,
    `- Provenance Audit Events: ${events.length}`,
    '',
    '## Experiment Records & Traceability',
    '',
  ];

  for (const r of records) {
    lines.push(`### ${r.experimentId} — ${r.paperTitle}`);
    lines.push(`- **Family / Institution:** ${r.experimentFamily} · ${r.institution}`);
    lines.push(`- **Verification Status:** ${r.verificationStatus} (${r.originType})`);
    lines.push(`- **Source URL:** ${r.sourceUrl}`);
    lines.push(`- **Citation Locator:** ${r.citationLocator ?? 'Not reported / Not verified'}`);
    lines.push(`- **Gravity Context:** ${r.gravityContext}`);
    lines.push(`- **Material / Fuel:** ${r.material ?? 'Not reported / Not verified'}`);
    lines.push(
      `- **Oxygen (%):** ${r.oxygenPercent !== null ? `${r.oxygenPercent} %` : 'Not reported / Not verified'}`
    );
    lines.push(
      `- **Airflow:** ${r.airflowVelocity !== null ? `${r.airflowVelocity} ${r.airflowUnit ?? ''}` : 'Not reported / Not verified'}`
    );
    lines.push(
      `- **Primary Reported Value:** ${r.reportedValue !== null ? `${r.reportedValue} ${r.units ?? ''}` : 'Not reported / Not verified'}`
    );
    lines.push(`- **Uncertainty:** ${r.uncertainty ?? 'Not reported / Not verified'}`);
    lines.push(`- **Observed Outcome:** ${r.observedOutcome ?? 'Not reported / Not verified'}`);
    lines.push('');
  }

  lines.push('## Official NASA Source Bibliography', '');
  for (const s of sources) {
    lines.push(
      `- **${s.sourceId}** (${s.ingestionState}): [${s.title}](${s.sourceUrl}) — Retrieved ${s.retrievalDate}`
    );
  }

  return lines.join('\n');
}
