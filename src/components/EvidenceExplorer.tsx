import React, { useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitCompare,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import type { ExperimentRecord, VerificationStatus } from '../types/scientific.ts';
import { computeEvidenceCompleteness, getMissingScientificFields } from '../utils/scoring.ts';
import { formatNumericWithUnit } from '../utils/units.ts';
import { OriginTag, VerificationTag } from './ScientificLabels.tsx';

interface EvidenceExplorerProps {
  records: ExperimentRecord[];
  selectedCompareIds: string[];
  onToggleCompare: (experimentId: string) => void;
  onUpdateVerification: (
    experimentId: string,
    newStatus: VerificationStatus,
    notes: string,
    citationLocator: string | null
  ) => void;
}

type SortKey = 'title' | 'family' | 'verification' | 'completeness' | 'retrievalDate';

export const EvidenceExplorer: React.FC<EvidenceExplorerProps> = ({
  records,
  selectedCompareIds,
  onToggleCompare,
  onUpdateVerification,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [familyFilter, setFamilyFilter] = useState('ALL');
  const [investigationFilter, setInvestigationFilter] = useState('ALL');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [gravityFilter, setGravityFilter] = useState('ALL');
  const [oxygenFilter, setOxygenFilter] = useState<'ALL' | 'REPORTED' | 'MISSING'>('ALL');
  const [airflowFilter, setAirflowFilter] = useState<'ALL' | 'REPORTED' | 'MISSING'>('ALL');
  const [measurementFilter, setMeasurementFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortKey>('completeness');
  const [expandedId, setExpandedId] = useState<string | null>(
    records[0]?.experimentId ?? null
  );

  // Verification edit modal/inline state
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<VerificationStatus>('METADATA_REVIEWED');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftCitation, setDraftCitation] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const uniqueFamilies = useMemo(
    () => Array.from(new Set(records.map((r) => r.experimentFamily))).sort(),
    [records]
  );
  const uniqueInvestigations = useMemo(
    () => Array.from(new Set(records.map((r) => r.investigationId))).sort(),
    [records]
  );
  const uniqueMaterials = useMemo(
    () => Array.from(new Set(records.map((r) => r.fuelType ?? 'Unspecified'))).sort(),
    [records]
  );
  const uniqueGravities = useMemo(
    () => Array.from(new Set(records.map((r) => r.gravityContext))).sort(),
    [records]
  );
  const uniqueMeasurementTypes = useMemo(
    () => Array.from(new Set(records.map((r) => r.measurementType ?? 'Unspecified'))).sort(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records
      .filter((r) => {
        if (q) {
          const hay = [
            r.experimentId,
            r.paperTitle,
            r.experimentFamily,
            r.sourceId,
            r.reportId ?? '',
            r.material ?? '',
            r.fuelType ?? '',
            r.observedOutcome ?? '',
            r.notes ?? '',
          ]
            .join(' ')
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (familyFilter !== 'ALL' && r.experimentFamily !== familyFilter) return false;
        if (investigationFilter !== 'ALL' && r.investigationId !== investigationFilter) return false;
        if (materialFilter !== 'ALL' && (r.fuelType ?? 'Unspecified') !== materialFilter)
          return false;
        if (gravityFilter !== 'ALL' && r.gravityContext !== gravityFilter) return false;
        if (oxygenFilter === 'REPORTED' && r.oxygenPercent === null) return false;
        if (oxygenFilter === 'MISSING' && r.oxygenPercent !== null) return false;
        if (airflowFilter === 'REPORTED' && r.airflowVelocity === null) return false;
        if (airflowFilter === 'MISSING' && r.airflowVelocity !== null) return false;
        if (
          measurementFilter !== 'ALL' &&
          (r.measurementType ?? 'Unspecified') !== measurementFilter
        )
          return false;
        if (statusFilter !== 'ALL' && r.verificationStatus !== statusFilter) return false;
        if (levelFilter !== 'ALL' && (r.recordLevel ?? 'CATALOG_INDEX') !== levelFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.paperTitle.localeCompare(b.paperTitle);
        if (sortBy === 'family') return a.experimentFamily.localeCompare(b.experimentFamily);
        if (sortBy === 'verification')
          return a.verificationStatus.localeCompare(b.verificationStatus);
        if (sortBy === 'retrievalDate') return b.retrievalDate.localeCompare(a.retrievalDate);
        return computeEvidenceCompleteness(b) - computeEvidenceCompleteness(a);
      });
  }, [
    records,
    searchQuery,
    familyFilter,
    investigationFilter,
    materialFilter,
    gravityFilter,
    oxygenFilter,
    airflowFilter,
    measurementFilter,
    statusFilter,
    levelFilter,
    sortBy,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setFamilyFilter('ALL');
    setInvestigationFilter('ALL');
    setMaterialFilter('ALL');
    setGravityFilter('ALL');
    setOxygenFilter('ALL');
    setAirflowFilter('ALL');
    setMeasurementFilter('ALL');
    setStatusFilter('ALL');
    setLevelFilter('ALL');
  };

  const openVerificationEditor = (r: ExperimentRecord) => {
    setEditingRecordId(r.experimentId);
    setDraftStatus(r.verificationStatus);
    setDraftNotes(r.notes ?? '');
    setDraftCitation(r.citationLocator ?? '');
    setEditError(null);
  };

  const submitVerificationEdit = (e: React.FormEvent, record: ExperimentRecord) => {
    e.preventDefault();
    if (draftNotes.trim().length < 5) {
      setEditError('Reviewer verification rationale is required (minimum 5 characters).');
      return;
    }
    if (
      draftStatus === 'HUMAN_VERIFIED' &&
      (record.originType === 'HYPOTHETICAL' || record.originType === 'AI_ASSISTED')
    ) {
      setEditError(
        `DIWA safeguard: ${record.originType} records cannot be promoted to HUMAN_VERIFIED.`
      );
      return;
    }
    if (draftStatus === 'HUMAN_VERIFIED' && draftCitation.trim().length < 3) {
      setEditError(
        'DIWA safeguard: An explicit page/table/figure citation locator is required before marking HUMAN_VERIFIED.'
      );
      return;
    }
    onUpdateVerification(
      record.experimentId,
      draftStatus,
      draftNotes.trim(),
      draftCitation.trim() || null
    );
    setEditingRecordId(null);
    setEditError(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">NASA Evidence Explorer</h1>
          <p className="text-sm text-slate-400 mt-1">
            Searchable, unit-preserving combustion evidence database. Unreported measurements are
            explicitly flagged &ldquo;Not reported / Not verified&rdquo;.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-400 tabular-nums">
          Showing {filteredRecords.length} of {records.length} record(s)
        </div>
      </header>

      {/* Search & 8-Facet Filter Panel */}
      <section className="rounded-lg border border-slate-800 bg-[#0D1422] p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, report ID, material, fuel, findings, or notes..."
              aria-label="Search evidence records"
              className="w-full rounded-md border border-slate-700 bg-[#070B14] pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="sort-records" className="text-xs text-slate-400 whitespace-nowrap">
              Sort by
            </label>
            <select
              id="sort-records"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="rounded-md border border-slate-700 bg-[#070B14] px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            >
              <option value="completeness">Evidence Completeness</option>
              <option value="family">Experiment Family</option>
              <option value="verification">Verification Status</option>
              <option value="title">Document Title</option>
              <option value="retrievalDate">Retrieval Date</option>
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 rounded-md border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-2 text-xs text-slate-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Experiment Family</label>
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="ALL">All Families</option>
              {uniqueFamilies.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Research Investigation</label>
            <select
              value={investigationFilter}
              onChange={(e) => setInvestigationFilter(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="ALL">All Investigations</option>
              {uniqueInvestigations.map((inv) => (
                <option key={inv} value={inv}>
                  {inv}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Fuel / Material Class</label>
            <select
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="ALL">All Fuels / Materials</option>
              {uniqueMaterials.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Gravity Context</label>
            <select
              value={gravityFilter}
              onChange={(e) => setGravityFilter(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="ALL">All Gravity Regimes</option>
              {uniqueGravities.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Oxygen Availability</label>
            <select
              value={oxygenFilter}
              onChange={(e) => setOxygenFilter(e.target.value as 'ALL' | 'REPORTED' | 'MISSING')}
              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="ALL">All (Reported &amp; Missing)</option>
              <option value="REPORTED">Numeric O2 Reported</option>
              <option value="MISSING">O2 Not Reported</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Airflow Availability</label>
            <select
              value={airflowFilter}
              onChange={(e) => setAirflowFilter(e.target.value as 'ALL' | 'REPORTED' | 'MISSING')}
              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="ALL">All (Reported &amp; Missing)</option>
              <option value="REPORTED">Numeric Airflow Reported</option>
              <option value="MISSING">Airflow Not Reported</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Measurement Type</label>
            <select
              value={measurementFilter}
              onChange={(e) => setMeasurementFilter(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="ALL">All Measurement Types</option>
              {uniqueMeasurementTypes.map((mt) => (
                <option key={mt} value={mt}>
                  {mt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Verification Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="ALL">All Verification States</option>
              <option value="HUMAN_VERIFIED">HUMAN_VERIFIED</option>
              <option value="SOURCE_MATCHED">SOURCE_MATCHED</option>
              <option value="METADATA_REVIEWED">METADATA_REVIEWED</option>
              <option value="SOURCE_LINK_ONLY">SOURCE_LINK_ONLY</option>
              <option value="CONTRADICTED">CONTRADICTED</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Evidence Level</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-xs text-slate-100"
            >
              <option value="ALL">All Levels</option>
              <option value="EXPERIMENT_RUN">Experiment Run (Single Test)</option>
              <option value="REPORT_SUMMARY">Report Summary / Derived</option>
              <option value="CATALOG_INDEX">Catalog Index (Metadata)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Evidence Records List */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-[#0D1422] p-10 text-center space-y-3">
          <p className="text-sm text-slate-300">
            No experiment records match the active search and filter criteria.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const isExpanded = expandedId === record.experimentId;
            const isCompared = selectedCompareIds.includes(record.experimentId);
            const completenessPct = Math.round(computeEvidenceCompleteness(record) * 100);
            const missingFields = getMissingScientificFields(record);

            return (
              <article
                key={record.experimentId}
                className="rounded-lg border border-slate-800 bg-[#0D1422] transition-colors"
              >
                <div className="p-5 space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <h2 className="text-base font-semibold text-slate-100 leading-snug">
                        {record.paperTitle}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono text-teal-400">{record.experimentId}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-300">
                          {record.recordLevel ?? 'CATALOG_INDEX'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{record.experimentFamily}</span>
                        <span aria-hidden="true">·</span>
                        <span>{record.institution}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">
                          {record.reportId ?? record.sourceId}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <VerificationTag status={record.verificationStatus} />
                      <OriginTag origin={record.originType} />
                    </div>
                  </div>

                  {/* Conditions Summary Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 block">Gravity Context</span>
                      <span className="font-mono text-slate-200">{record.gravityContext}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Material / Fuel</span>
                      <span className="text-slate-200">
                        {record.material ?? 'Not reported / Not verified'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Oxygen / Airflow</span>
                      <span className="font-mono tabular-nums text-slate-200">
                        {record.oxygenPercent !== null ? `${record.oxygenPercent}% O2` : 'O2 N/R'} ·{' '}
                        {record.airflowVelocity !== null
                          ? formatNumericWithUnit(record.airflowVelocity, record.airflowUnit)
                          : 'Flow N/R'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Primary Measurement</span>
                      <span className="font-mono tabular-nums text-amber-300">
                        {formatNumericWithUnit(record.reportedValue, record.units)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {record.observedOutcome ?? 'Observed outcome: Not reported / Not verified.'}
                  </p>

                  {/* Footer Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <a
                        href={record.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-teal-400 hover:text-teal-300 whitespace-nowrap shrink-0"
                      >
                        <span>Original NASA Source</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <span className="font-mono tabular-nums text-slate-400">
                        Completeness: {completenessPct}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleCompare(record.experimentId)}
                        className={`inline-flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          isCompared
                            ? 'border-amber-500/60 bg-amber-950/40 text-amber-200'
                            : 'border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200'
                        }`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>{isCompared ? 'Selected for Compare' : 'Compare'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : record.experimentId)
                        }
                        aria-expanded={isExpanded}
                        className="inline-flex items-center gap-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'Inspect Evidence'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expandable Record Detail Drawer */}
                {isExpanded && (
                  <div className="border-t border-slate-800 bg-[#080D18] p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Original References &amp; Provenance
                        </h3>
                        <dl className="space-y-1.5 text-slate-300">
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-400">Source ID:</dt>
                            <dd className="font-mono">{record.sourceId}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-400">Investigation ID:</dt>
                            <dd className="font-mono">{record.investigationId}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-400">Citation Locator:</dt>
                            <dd className="font-mono text-right">
                              {record.citationLocator ?? 'Not reported / Not verified'}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-400">Extraction Method:</dt>
                            <dd className="font-mono">{record.extractionMethod}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-400">Retrieval Date:</dt>
                            <dd className="font-mono tabular-nums">{record.retrievalDate}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-400">SHA-256 Digest:</dt>
                            <dd className="font-mono truncate max-w-[220px]" title={record.sha256Hash ?? 'None'}>
                              {record.sha256Hash ?? 'Not hashed (catalog metadata)'}
                            </dd>
                          </div>
                        </dl>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                          Uncertainty &amp; Missing Data Audit
                        </h3>
                        <dl className="space-y-1.5 text-slate-300">
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-400">Experiment Geometry:</dt>
                            <dd className="text-right">
                              {record.experimentGeometry ?? 'Not reported / Not verified'}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-400">Measurement Type:</dt>
                            <dd className="text-right">
                              {record.measurementType ?? 'Not reported / Not verified'}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="text-slate-400">Uncertainty:</dt>
                            <dd className="font-mono text-right">
                              {record.uncertainty ?? 'Not reported / Not verified'}
                            </dd>
                          </div>
                        </dl>

                        <div className="pt-2">
                          <span className="text-slate-400 block mb-1">
                            Unreported / Missing Fields ({missingFields.length}):
                          </span>
                          {missingFields.length === 0 ? (
                            <span className="text-emerald-400 font-mono">
                              All core scientific fields populated.
                            </span>
                          ) : (
                            <p className="font-mono text-amber-300/90 leading-relaxed">
                              {missingFields.join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Structured Measurements Table */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Extracted Measurements ({record.measurements.length})
                      </h3>
                      {record.measurements.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          No run-level numeric measurements ingested for this record yet. Upload
                          extracted NASA PSI/NTRS rows in Data Import &amp; Validation.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded border border-slate-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-900/80 text-slate-400">
                              <tr>
                                <th className="px-3 py-2 font-medium">Parameter</th>
                                <th className="px-3 py-2 font-medium text-right">Value</th>
                                <th className="px-3 py-2 font-medium">Units</th>
                                <th className="px-3 py-2 font-medium">Uncertainty</th>
                                <th className="px-3 py-2 font-medium">Citation</th>
                                <th className="px-3 py-2 font-medium">Origin</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                              {record.measurements.map((m) => (
                                <tr key={m.measurementId}>
                                  <td className="px-3 py-2 text-slate-200">{m.parameterName}</td>
                                  <td className="px-3 py-2 font-mono tabular-nums text-right text-amber-300">
                                    {m.reportedValue !== null ? m.reportedValue : 'N/R'}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-300">
                                    {m.units ?? 'N/R'}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-400">
                                    {m.uncertainty ?? 'Not reported'}
                                  </td>
                                  <td className="px-3 py-2 font-mono text-slate-400">
                                    {m.citationLocator ?? 'Not reported'}
                                  </td>
                                  <td className="px-3 py-2">
                                    <OriginTag origin={m.originType} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Documented Findings Cards */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Source-Grounded Scientific Findings ({record.findings.length})
                      </h3>
                      {record.findings.length === 0 ? (
                        <p className="text-xs text-slate-400">
                          No structured findings extracted for this record yet.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {record.findings.map((f) => (
                            <div
                              key={f.findingId}
                              className="rounded border border-slate-800 bg-[#0D1422] p-3 space-y-2 text-xs"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-mono text-teal-400">{f.findingId}</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <OriginTag origin={f.originType} />
                                  <VerificationTag status={f.verificationStatus} />
                                </div>
                              </div>
                              <p className="text-slate-200 leading-relaxed">{f.statement}</p>
                              <div className="font-mono text-[11px] text-slate-400">
                                Locator: {f.citationLocator ?? 'Not reported / Not verified'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Verification Notes & Manual Audit Review */}
                    <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs text-slate-400">
                        <span className="font-medium text-slate-300">Verification Notes: </span>
                        {record.notes ?? 'None recorded.'}
                      </div>
                      <button
                        type="button"
                        onClick={() => openVerificationEditor(record)}
                        className="inline-flex items-center gap-1.5 rounded border border-teal-500/40 bg-teal-950/30 hover:bg-teal-950/60 px-3 py-1.5 text-xs font-medium text-teal-300 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Update Verification Review</span>
                      </button>
                    </div>

                    {editingRecordId === record.experimentId && (
                      <form
                        onSubmit={(e) => submitVerificationEdit(e, record)}
                        className="rounded border border-slate-700 bg-[#0D1422] p-4 space-y-3 text-xs"
                      >
                        <div className="font-medium text-slate-100">
                          DIWA Reviewer Verification Update ({record.experimentId})
                        </div>
                        <p className="text-slate-400">
                          All status changes are logged immutably in DIWA Provenance. Only mark{' '}
                          <span className="font-mono text-emerald-300">HUMAN_VERIFIED</span> after
                          inspecting the primary NASA document directly.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-slate-400 mb-1">New Verification Status</label>
                            <select
                              value={draftStatus}
                              onChange={(e) => setDraftStatus(e.target.value as VerificationStatus)}
                              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-slate-100"
                            >
                              <option value="SOURCE_LINK_ONLY">SOURCE_LINK_ONLY</option>
                              <option value="METADATA_REVIEWED">METADATA_REVIEWED</option>
                              <option value="SOURCE_MATCHED">SOURCE_MATCHED</option>
                              <option value="HUMAN_VERIFIED">HUMAN_VERIFIED</option>
                              <option value="CONTRADICTED">CONTRADICTED</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-slate-400 mb-1">
                              Citation Locator (Page / Table / Figure)
                            </label>
                            <input
                              type="text"
                              value={draftCitation}
                              onChange={(e) => setDraftCitation(e.target.value)}
                              placeholder="e.g., Table 2, Page 14"
                              className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-slate-100"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">
                            Reviewer Rationale (Required)
                          </label>
                          <textarea
                            rows={2}
                            value={draftNotes}
                            onChange={(e) => setDraftNotes(e.target.value)}
                            placeholder="Document exactly how values were verified against the NASA source..."
                            className="w-full rounded border border-slate-700 bg-[#070B14] px-2.5 py-1.5 text-slate-100"
                          />
                        </div>
                        {editError && <p className="text-rose-400">{editError}</p>}
                        <div className="flex items-center gap-2">
                          <button
                            type="submit"
                            className="rounded bg-teal-600 hover:bg-teal-500 px-3 py-1.5 font-medium text-slate-950 cursor-pointer"
                          >
                            Save Verification Event
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRecordId(null)}
                            className="rounded border border-slate-700 px-3 py-1.5 text-slate-300 hover:bg-slate-800 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
