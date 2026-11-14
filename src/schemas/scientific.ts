import { z } from 'zod';

export const VerificationStatusSchema = z.enum([
  'SOURCE_LINK_ONLY',
  'METADATA_REVIEWED',
  'SOURCE_MATCHED',
  'HUMAN_VERIFIED',
  'CONTRADICTED',
]);

export const EvidenceOriginTypeSchema = z.enum([
  'SOURCE_REPORTED',
  'MANUALLY_CURATED',
  'DERIVED_CALCULATION',
  'AI_ASSISTED',
  'HYPOTHETICAL',
]);

export const ExtractionMethodSchema = z.enum([
  'OFFICIAL_METADATA_INDEX',
  'MANUAL_CURATION',
  'USER_CSV_IMPORT',
  'USER_JSON_IMPORT',
  'API_STRUCTURED_EXTRACT',
]);

export const GravityContextSchema = z.enum([
  'MICROGRAVITY_ISS',
  'MICROGRAVITY_SPACECRAFT',
  'MICROGRAVITY_DROP_TOWER',
  'PARTIAL_GRAVITY_LUNAR',
  'PARTIAL_GRAVITY_MARTIAN',
  'NORMAL_GRAVITY_1G',
  'UNSPECIFIED',
]);

export const ApplicationContextSchema = z.enum([
  'ISS_HABITAT',
  'PRESSURIZED_ROVER',
  'LUNAR_HABITAT',
  'MARTIAN_HABITAT',
]);

export const MeasurementSchema = z.object({
  measurementId: z.string().min(1),
  measurementType: z.string().min(1),
  parameterName: z.string().min(1),
  reportedValue: z.number().finite().nullable(),
  units: z.string().nullable(),
  uncertainty: z.string().nullable(),
  citationLocator: z.string().nullable(),
  originalExcerptShort: z.string().max(400).nullable(),
  originType: EvidenceOriginTypeSchema,
  verificationStatus: VerificationStatusSchema,
  sourceUrl: z.string().url(),
  derivedFrom: z
    .object({
      originalValue: z.number().finite(),
      originalUnits: z.string().min(1),
      formula: z.string().min(1),
    })
    .nullable()
    .optional(),
});

export const FindingSchema = z.object({
  findingId: z.string().min(1),
  statement: z.string().min(1).max(1000),
  citationLocator: z.string().nullable(),
  originType: EvidenceOriginTypeSchema,
  verificationStatus: VerificationStatusSchema,
  contradictionNote: z.string().nullable(),
});

export const RecordLevelSchema = z.enum([
  'REPORT_SUMMARY',
  'EXPERIMENT_RUN',
  'DERIVED_ANALYSIS',
  'CATALOG_INDEX',
]);

export const ExperimentRecordSchema = z
  .object({
    experimentId: z.string().min(1, 'experimentId is required'),
    sourceId: z.string().min(1, 'sourceId is required'),
    investigationId: z.string().min(1, 'investigationId is required'),
    experimentFamily: z.string().min(1, 'experimentFamily is required'),
    recordLevel: RecordLevelSchema.optional(),
    paperTitle: z.string().min(1, 'paperTitle is required').max(300),
    institution: z.string().min(1, 'institution is required').max(200),
    sourceUrl: z.string().url('sourceUrl must be a valid URL'),
    reportId: z.string().nullable(),
    material: z.string().nullable(),
    fuelType: z.string().nullable(),
    gravityContext: GravityContextSchema,
    oxygenPercent: z
      .number()
      .finite()
      .min(0, 'oxygenPercent cannot be negative')
      .max(100, 'oxygenPercent cannot exceed 100%')
      .nullable(),
    airflowVelocity: z
      .number()
      .finite()
      .min(0, 'airflowVelocity magnitude cannot be negative')
      .nullable(),
    airflowUnit: z.string().nullable(),
    experimentGeometry: z.string().nullable(),
    measurementType: z.string().nullable(),
    observedOutcome: z.string().max(1500).nullable(),
    reportedValue: z.number().finite().nullable(),
    units: z.string().nullable(),
    uncertainty: z.string().nullable(),
    citationLocator: z.string().nullable(),
    originalExcerptShort: z.string().max(400).nullable(),
    extractionMethod: ExtractionMethodSchema,
    verificationStatus: VerificationStatusSchema,
    originType: EvidenceOriginTypeSchema,
    retrievalDate: z.string().min(1),
    sha256Hash: z.string().nullable(),
    notes: z.string().max(1500).nullable(),
    measurements: z.array(MeasurementSchema),
    findings: z.array(FindingSchema),
  })
  .superRefine((val, ctx) => {
    if (val.reportedValue !== null && (!val.units || val.units.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['units'],
        message: 'Numeric reportedValue requires explicit measurement units.',
      });
    }
    if (val.airflowVelocity !== null && (!val.airflowUnit || val.airflowUnit.trim() === '')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['airflowUnit'],
        message: 'Numeric airflowVelocity requires explicit airflowUnit (e.g., cm/s, m/s).',
      });
    }
  });

export const SourceDocumentSchema = z.object({
  sourceId: z.string().min(1),
  title: z.string().min(1),
  nasaProgram: z.string().min(1),
  reportId: z.string().nullable(),
  institution: z.string().min(1),
  authors: z.string().nullable(),
  publicationYear: z.number().int().min(1958).max(2030).nullable(),
  retrievalDate: z.string().min(1),
  sourceUrl: z.string().url(),
  domainApproved: z.boolean(),
  sha256Hash: z.string().nullable(),
  ingestionState: z.enum(['METADATA_INGESTED', 'REFERENCE_INDEXED', 'USER_IMPORTED']),
  notes: z.string(),
});

export const VerificationUpdateSchema = z.object({
  experimentId: z.string().min(1),
  newStatus: VerificationStatusSchema,
  reviewerNotes: z.string().min(5, 'Reviewer rationale is required (min 5 characters).').max(800),
  citationLocator: z.string().max(200).nullable(),
});
