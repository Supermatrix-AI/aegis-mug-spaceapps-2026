export type VerificationStatus =
  | 'SOURCE_LINK_ONLY'
  | 'METADATA_REVIEWED'
  | 'SOURCE_MATCHED'
  | 'HUMAN_VERIFIED'
  | 'CONTRADICTED';

export type EvidenceOriginType =
  | 'SOURCE_REPORTED'
  | 'MANUALLY_CURATED'
  | 'DERIVED_CALCULATION'
  | 'AI_ASSISTED'
  | 'HYPOTHETICAL';

export type ExtractionMethod =
  | 'OFFICIAL_METADATA_INDEX'
  | 'MANUAL_CURATION'
  | 'USER_CSV_IMPORT'
  | 'USER_JSON_IMPORT'
  | 'API_STRUCTURED_EXTRACT';

export type GravityContext =
  | 'MICROGRAVITY_ISS'
  | 'MICROGRAVITY_SPACECRAFT'
  | 'MICROGRAVITY_DROP_TOWER'
  | 'PARTIAL_GRAVITY_LUNAR'
  | 'PARTIAL_GRAVITY_MARTIAN'
  | 'NORMAL_GRAVITY_1G'
  | 'UNSPECIFIED';

export type ApplicationContext =
  | 'ISS_HABITAT'
  | 'PRESSURIZED_ROVER'
  | 'LUNAR_HABITAT'
  | 'MARTIAN_HABITAT';

export type IngestionState =
  | 'METADATA_INGESTED'
  | 'REFERENCE_INDEXED'
  | 'USER_IMPORTED';

export interface SourceDocument {
  sourceId: string;
  title: string;
  nasaProgram: string;
  reportId: string | null;
  institution: string;
  authors: string | null;
  publicationYear: number | null;
  retrievalDate: string;
  sourceUrl: string;
  domainApproved: boolean;
  sha256Hash: string | null;
  ingestionState: IngestionState;
  notes: string;
}

export interface Investigation {
  investigationId: string;
  experimentFamily: string;
  title: string;
  psiIdentifier: string | null;
  facility: string | null;
  sourceId: string;
  sourceUrl: string;
  summary: string;
  verificationStatus: VerificationStatus;
}

export interface Measurement {
  measurementId: string;
  measurementType: string;
  parameterName: string;
  reportedValue: number | null;
  units: string | null;
  uncertainty: string | null;
  citationLocator: string | null;
  originalExcerptShort: string | null;
  originType: EvidenceOriginType;
  verificationStatus: VerificationStatus;
  sourceUrl: string;
  derivedFrom?: {
    originalValue: number;
    originalUnits: string;
    formula: string;
  } | null;
}

export interface Finding {
  findingId: string;
  statement: string;
  citationLocator: string | null;
  originType: EvidenceOriginType;
  verificationStatus: VerificationStatus;
  contradictionNote: string | null;
}

export type RecordLevel =
  | 'REPORT_SUMMARY'
  | 'EXPERIMENT_RUN'
  | 'DERIVED_ANALYSIS'
  | 'CATALOG_INDEX';

export interface ExperimentRecord {
  experimentId: string;
  sourceId: string;
  investigationId: string;
  experimentFamily: string;
  recordLevel?: RecordLevel;
  paperTitle: string;
  institution: string;
  sourceUrl: string;
  reportId: string | null;
  material: string | null;
  fuelType: string | null;
  gravityContext: GravityContext;
  oxygenPercent: number | null;
  airflowVelocity: number | null;
  airflowUnit: string | null;
  experimentGeometry: string | null;
  measurementType: string | null;
  observedOutcome: string | null;
  reportedValue: number | null;
  units: string | null;
  uncertainty: string | null;
  citationLocator: string | null;
  originalExcerptShort: string | null;
  extractionMethod: ExtractionMethod;
  verificationStatus: VerificationStatus;
  originType: EvidenceOriginType;
  retrievalDate: string;
  sha256Hash: string | null;
  notes: string | null;
  measurements: Measurement[];
  findings: Finding[];
}

export type ProvenanceAction =
  | 'DATA_IMPORTED'
  | 'DATA_MODIFIED'
  | 'SOURCE_LINKED'
  | 'VALIDATION_COMPLETED'
  | 'VERIFICATION_STATUS_CHANGED'
  | 'EXPORT_GENERATED';

export interface ProvenanceEvent {
  eventId: string;
  timestamp: string;
  action: ProvenanceAction;
  recordId: string;
  actor: string;
  details: string;
  previousValue: string | null;
  newValue: string | null;
  hashNote: string | null;
}

export interface ValidationIssue {
  rowIndex: number;
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface ImportJob {
  jobId: string;
  filename: string;
  format: 'CSV' | 'JSON';
  importedAt: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  duplicateRows: number;
  sha256Hex: string;
  validationErrors: ValidationIssue[];
}

export interface RelevanceBreakdown {
  experimentId: string;
  context: ApplicationContext;
  completenessScore: number; // 0..1
  environmentAlignment: number; // 0..1
  parameterAlignment: number; // 0..1
  verificationWeight: number; // 0..1
  materialAlignment: number; // 0..1
  overallRelevanceIndex: number; // 0..100 (explicitly research relevance, never safety/hazard)
  missingCriticalFields: string[];
  limitations: string[];
  rationale: string;
}

export interface CompatibilityReport {
  comparable: boolean;
  warnings: string[];
  blockers: string[];
  sharedNumericDimensions: {
    key: 'oxygenPercent' | 'airflowVelocity' | 'reportedValue';
    label: string;
    targetUnit: string | null;
    values: Array<{
      experimentId: string;
      title: string;
      value: number;
      originalValue: number;
      originalUnit: string | null;
      converted: boolean;
      verificationStatus: VerificationStatus;
    }>;
  }[];
  missingNumericExplanation: string[];
}
