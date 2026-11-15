import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Scale,
  Trash2,
} from 'lucide-react';
import type {
  ExperimentRecord,
  ImportJob,
  ValidationIssue,
} from '../types/scientific.ts';
import {
  buildBlankCsvTemplate,
  buildSyntheticQaFixtureCsv,
  CANONICAL_IMPORT_FIELDS,
  ColumnMapping,
  inferColumnMapping,
  MAX_IMPORT_BYTES,
  parseCsvImportPreview,
  parseJsonImportPreview,
  validateAndNormalizeRows,
} from '../utils/importExport.ts';
import { convertMeasurementUnit } from '../utils/units.ts';

interface DataImportProps {
  existingRecords: ExperimentRecord[];
  onCommitImport: (records: ExperimentRecord[], job: ImportJob) => void;
  onResetSessionImports: () => void;
  userImportedCount: number;
}

export const DataImport: React.FC<DataImportProps> = ({
  existingRecords,
  onCommitImport,
  onResetSessionImports,
  userImportedCount,
}) => {
  const [filename, setFilename] = useState<string | null>(null);
  const [format, setFormat] = useState<'CSV' | 'JSON'>('CSV');
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [sha256Hex, setSha256Hex] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewAccepted, setPreviewAccepted] = useState<ExperimentRecord[]>([]);
  const [previewIssues, setPreviewIssues] = useState<ValidationIssue[]>([]);
  const [duplicateIds, setDuplicateIds] = useState<string[]>([]);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);

  // Explicit unit conversion calculator state
  const [convValue, setConvValue] = useState<string>('10');
  const [convFrom, setConvFrom] = useState<string>('cm/s');
  const [convTo, setConvTo] = useState<string>('m/s');

  const convNumeric = convValue.trim() === '' ? null : Number(convValue);
  const convResult = convertMeasurementUnit(
    Number.isFinite(convNumeric) ? convNumeric : null,
    convFrom,
    convTo
  );

  const runValidationPreview = (
    rows: Record<string, unknown>[],
    colMap: ColumnMapping,
    fmt: 'CSV' | 'JSON',
    hash: string
  ) => {
    const result = validateAndNormalizeRows(
      rows,
      colMap,
      existingRecords,
      fmt === 'CSV' ? 'USER_CSV_IMPORT' : 'USER_JSON_IMPORT',
      hash
    );
    setPreviewAccepted(result.accepted);
    setPreviewIssues(result.issues);
    setDuplicateIds(result.duplicateIds);
  };

  const processFileText = async (name: string, text: string) => {
    setParseError(null);
    setCommitMessage(null);
    const byteSize = new TextEncoder().encode(text).length;
    if (byteSize > MAX_IMPORT_BYTES) {
      setParseError(`File exceeds 2 MB safety limit (${(byteSize / 1024).toFixed(0)} KB).`);
      return;
    }

    const isJson = name.toLowerCase().endsWith('.json') || text.trim().startsWith('[') || text.trim().startsWith('{');
    const detectedFormat: 'CSV' | 'JSON' = isJson ? 'JSON' : 'CSV';

    try {
      const parsed =
        detectedFormat === 'JSON'
          ? await parseJsonImportPreview(text)
          : await parseCsvImportPreview(text);

      if (parsed.rows.length === 0) {
        setParseError('No data rows detected in uploaded file.');
        return;
      }

      const inferred = inferColumnMapping(parsed.headers);
      setFilename(name);
      setFormat(detectedFormat);
      setRawHeaders(parsed.headers);
      setRawRows(parsed.rows);
      setMapping(inferred);
      setSha256Hex(parsed.sha256Hex);
      runValidationPreview(parsed.rows, inferred, detectedFormat, parsed.sha256Hex);
    } catch (err) {
      setParseError(
        err instanceof Error ? `Failed to parse file: ${err.message}` : 'Failed to parse file.'
      );
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      setParseError(`File exceeds 2 MB safety limit.`);
      return;
    }
    const text = await file.text();
    await processFileText(file.name, text);
    e.target.value = '';
  };

  const handleMappingChange = (field: keyof ColumnMapping, header: string) => {
    if (!mapping) return;
    const updated = { ...mapping, [field]: header };
    setMapping(updated);
    runValidationPreview(rawRows, updated, format, sha256Hex);
  };

  const handleCommit = () => {
    if (previewAccepted.length === 0 || !filename) return;
    const job: ImportJob = {
      jobId: `JOB-${Date.now()}`,
      filename,
      format,
      importedAt: new Date().toISOString(),
      totalRows: rawRows.length,
      acceptedRows: previewAccepted.length,
      rejectedRows: rawRows.length - previewAccepted.length,
      duplicateRows: duplicateIds.length,
      sha256Hex,
      validationErrors: previewIssues,
    };
    onCommitImport(previewAccepted, job);
    setCommitMessage(
      `Imported ${previewAccepted.length} validated record(s) into browser session (flagged SOURCE_LINK_ONLY until human-verified).`
    );
    setRawRows([]);
    setPreviewAccepted([]);
    setPreviewIssues([]);
    setFilename(null);
    setMapping(null);
  };

  const downloadTextFile = (content: string, downloadName: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            Data Import &amp; Scientific Validation
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Ingest CSV or JSON records exported from NASA PSI or curated from NTRS PDFs. All
            imported rows are Zod-validated, sanitized, SHA-256 hashed, and marked unverified until
            reviewed.
          </p>
        </div>
        {userImportedCount > 0 && (
          <button
            type="button"
            onClick={onResetSessionImports}
            className="inline-flex items-center gap-1.5 rounded border border-rose-500/40 bg-rose-950/30 hover:bg-rose-950/50 px-3 py-2 text-xs font-medium text-rose-300 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear {userImportedCount} Session Import(s)</span>
          </button>
        )}
      </header>

      {/* Templates & Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-100">
              Upload CSV or JSON Experiment Dataset
            </h2>
            <span className="text-xs font-mono text-slate-400">Max 2 MB</span>
          </div>

          <label className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-[#070B14] p-8 text-center hover:border-teal-500/60 transition-colors cursor-pointer">
            <FileUp className="w-7 h-7 text-teal-400 mb-2" />
            <span className="text-sm font-medium text-slate-200">
              Select a .csv or .json file from your device
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Files are parsed locally in-browser; embedded HTML/scripts and formula prefixes are
              stripped.
            </span>
            <input
              type="file"
              accept=".csv,.json,text/csv,application/json"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  buildBlankCsvTemplate(),
                  'aegis_mug_import_template.csv',
                  'text/csv;charset=utf-8'
                )
              }
              className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Download Blank CSV Template</span>
            </button>

            <button
              type="button"
              onClick={() =>
                downloadTextFile(
                  buildSyntheticQaFixtureCsv(),
                  'aegis_mug_synthetic_qa_fixture_NOT_NASA_DATA.csv',
                  'text/csv;charset=utf-8'
                )
              }
              className="inline-flex items-center gap-1.5 rounded border border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 px-3 py-2 text-xs font-medium text-amber-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Synthetic QA Fixture (Not NASA Data)</span>
            </button>

            <button
              type="button"
              onClick={() =>
                processFileText(
                  'qa_synthetic_fixture.csv',
                  buildSyntheticQaFixtureCsv()
                )
              }
              className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Load QA Fixture into Preview</span>
            </button>
          </div>

          {parseError && (
            <div className="rounded border border-rose-500/40 bg-rose-950/30 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}

          {commitMessage && (
            <div className="rounded border border-emerald-500/40 bg-emerald-950/30 p-3 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{commitMessage}</span>
            </div>
          )}
        </section>

        {/* Unit-Aware Conversion Workbench */}
        <section className="lg:col-span-5 rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Unit-Aware Scientific Converter
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Explicit dimension-checked conversion. Incompatible physical units are rejected rather
            than silently coerced. Original reported values remain preserved on import.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div>
              <label htmlFor="conv-value" className="block text-slate-400 mb-1">Value</label>
              <input
                id="conv-value"
                type="number"
                step="any"
                value={convValue}
                onChange={(e) => setConvValue(e.target.value)}
                className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 font-mono text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="conv-from" className="block text-slate-400 mb-1">From Unit</label>
              <select
                id="conv-from"
                value={convFrom}
                onChange={(e) => setConvFrom(e.target.value)}
                className="w-full rounded border border-slate-700 bg-[#070B14] px-2 py-1.5 font-mono text-slate-100"
              >
                <option value="cm/s">cm/s</option>
                <option value="m/s">m/s</option>
                <option value="mm/s">mm/s</option>
                <option value="°C">°C</option>
                <option value="K">K</option>
                <option value="kPa">kPa</option>
                <option value="atm">atm</option>
                <option value="psi">psi</option>
                <option value="kW">kW</option>
                <option value="W">W</option>
              </select>
            </div>
            <div>
              <label htmlFor="conv-to" className="block text-slate-400 mb-1">To Unit</label>
              <select
                id="conv-to"
                value={convTo}
                onChange={(e) => setConvTo(e.target.value)}
                className="w-full rounded border border-slate-700 bg-[#070B14] px-2 py-1.5 font-mono text-slate-100"
              >
                <option value="m/s">m/s</option>
                <option value="cm/s">cm/s</option>
                <option value="mm/s">mm/s</option>
                <option value="K">K</option>
                <option value="°C">°C</option>
                <option value="kPa">kPa</option>
                <option value="atm">atm</option>
                <option value="psi">psi</option>
                <option value="kW">kW</option>
                <option value="W">W</option>
              </select>
            </div>
          </div>

          <div className="rounded border border-slate-800 bg-[#070B14] p-3 text-xs space-y-1">
            {convResult.success ? (
              <>
                <div className="font-mono text-lg font-semibold text-teal-300 tabular-nums">
                  {convResult.value} {convResult.targetUnit}
                </div>
                <div className="text-slate-400 font-mono">
                  Formula: {convResult.formula} · Origin: DERIVED_CALCULATION
                </div>
              </>
            ) : (
              <div className="text-rose-400">{convResult.error}</div>
            )}
          </div>
        </section>
      </div>

      {/* Column Mapping & Validation Preview */}
      {mapping && rawRows.length > 0 && (
        <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Import Preview &amp; Column Mapping ({filename})
              </h2>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                SHA-256 (file consistency): {sha256Hex.slice(0, 24)}… · {rawRows.length} row(s)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono tabular-nums">
              <span className="text-emerald-400">{previewAccepted.length} valid</span>
              <span className="text-rose-400">
                {rawRows.length - previewAccepted.length} rejected
              </span>
              <span className="text-amber-400">{duplicateIds.length} duplicate(s)</span>
            </div>
          </div>

          {/* Column Mapper */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
              Canonical Schema Column Mapping
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {CANONICAL_IMPORT_FIELDS.slice(0, 16).map((field) => (
                <div key={field}>
                  <label htmlFor={`map-col-${field}`} className="block font-mono text-[11px] text-slate-400 mb-1">
                    {field}
                  </label>
                  <select
                    id={`map-col-${field}`}
                    value={mapping[field] ?? ''}
                    onChange={(e) => handleMappingChange(field, e.target.value)}
                    className="w-full rounded border border-slate-700 bg-[#070B14] px-2 py-1 text-xs text-slate-100"
                  >
                    <option value="">-- Unmapped --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Errors & Warnings */}
          {previewIssues.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Validation Diagnostics ({previewIssues.length})
              </h3>
              <div className="max-h-48 overflow-y-auto rounded border border-slate-800 bg-[#070B14] divide-y divide-slate-800/80 text-xs">
                {previewIssues.map((issue, idx) => (
                  <div key={idx} className="px-3 py-2 flex items-start gap-2">
                    <span
                      className={`font-mono shrink-0 ${
                        issue.severity === 'ERROR' ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      Row {issue.rowIndex} [{issue.severity}]
                    </span>
                    <span className="font-mono text-slate-400 shrink-0">{issue.field}:</span>
                    <span className="text-slate-200">{issue.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Rows Preview Table */}
          {previewAccepted.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Validated Records Ready for Session Persistence ({previewAccepted.length})
              </h3>
              <div className="overflow-x-auto rounded border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">ID</th>
                      <th className="px-3 py-2 font-medium">Title</th>
                      <th className="px-3 py-2 font-medium">Gravity</th>
                      <th className="px-3 py-2 font-medium text-right">O2 %</th>
                      <th className="px-3 py-2 font-medium text-right">Airflow</th>
                      <th className="px-3 py-2 font-medium text-right">Outcome</th>
                      <th className="px-3 py-2 font-medium">Origin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {previewAccepted.slice(0, 10).map((r) => (
                      <tr key={r.experimentId}>
                        <td className="px-3 py-2 font-mono text-teal-400">{r.experimentId}</td>
                        <td className="px-3 py-2 text-slate-200 max-w-xs truncate">
                          {r.paperTitle}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-300">{r.gravityContext}</td>
                        <td className="px-3 py-2 font-mono tabular-nums text-right">
                          {r.oxygenPercent !== null ? `${r.oxygenPercent}%` : 'N/R'}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-right">
                          {r.airflowVelocity !== null
                            ? `${r.airflowVelocity} ${r.airflowUnit ?? ''}`
                            : 'N/R'}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-right text-amber-300">
                          {r.reportedValue !== null ? `${r.reportedValue} ${r.units ?? ''}` : 'N/R'}
                        </td>
                        <td className="px-3 py-2 font-mono text-slate-400">{r.originType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  All accepted rows are locked to <span className="font-mono text-amber-300">SOURCE_LINK_ONLY</span>{' '}
                  until reviewed in Evidence Explorer or DIWA Provenance.
                </p>
                <button
                  type="button"
                  onClick={handleCommit}
                  className="rounded-md bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-medium text-slate-950 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Commit {previewAccepted.length} Validated Record(s) to Session
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
