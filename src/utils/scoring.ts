import type {
  ApplicationContext,
  ExperimentRecord,
  RelevanceBreakdown,
  VerificationStatus,
} from '../types/scientific.ts';

const VERIFICATION_WEIGHTS: Record<VerificationStatus, number> = {
  HUMAN_VERIFIED: 1.0,
  SOURCE_MATCHED: 0.85,
  METADATA_REVIEWED: 0.6,
  SOURCE_LINK_ONLY: 0.35,
  CONTRADICTED: 0.15,
};

export const CONTEXT_LABELS: Record<ApplicationContext, string> = {
  ISS_HABITAT: 'ISS or Spacecraft Habitat (0 g)',
  PRESSURIZED_ROVER: 'Pressurized Exploration Rover (Partial g / Mobile)',
  LUNAR_HABITAT: 'Lunar Surface Habitat (0.165 g)',
  MARTIAN_HABITAT: 'Martian Surface Habitat (0.38 g)',
};

export const RELEVANCE_FORMULA_DESCRIPTION =
  'R = Completeness × (0.30·S_env + 0.25·S_param + 0.25·S_verif + 0.20·S_mat) × 100';

/**
 * Computes list of missing scientific fields for an ExperimentRecord.
 * Never treats 0 or null as equivalent.
 */
export function getMissingScientificFields(record: ExperimentRecord): string[] {
  const missing: string[] = [];
  if (record.oxygenPercent === null) missing.push('oxygenPercent');
  if (record.airflowVelocity === null) missing.push('airflowVelocity');
  if (!record.airflowUnit) missing.push('airflowUnit');
  if (record.reportedValue === null) missing.push('reportedValue');
  if (!record.units) missing.push('units');
  if (!record.uncertainty) missing.push('uncertainty');
  if (!record.citationLocator) missing.push('citationLocator');
  if (!record.material) missing.push('material');
  if (!record.experimentGeometry) missing.push('experimentGeometry');
  return missing;
}

/**
 * Computes deterministic evidence completeness in [0.25, 1.0].
 * Missing numeric measurements directly penalize completeness.
 */
export function computeEvidenceCompleteness(record: ExperimentRecord): number {
  const checks = [
    Boolean(record.sourceUrl),
    Boolean(record.material),
    Boolean(record.experimentGeometry),
    Boolean(record.citationLocator),
    record.oxygenPercent !== null,
    record.airflowVelocity !== null && Boolean(record.airflowUnit),
    record.reportedValue !== null && Boolean(record.units),
    Boolean(record.uncertainty),
  ];
  const present = checks.filter(Boolean).length;
  return Number((present / checks.length).toFixed(4));
}

function computeEnvironmentAlignment(
  record: ExperimentRecord,
  context: ApplicationContext
): { score: number; limitation: string | null } {
  const g = record.gravityContext;
  if (context === 'ISS_HABITAT') {
    if (g === 'MICROGRAVITY_ISS' || g === 'MICROGRAVITY_SPACECRAFT') {
      return { score: 1.0, limitation: null };
    }
    if (g === 'MICROGRAVITY_DROP_TOWER') {
      return {
        score: 0.7,
        limitation: 'Drop-tower microgravity has short test duration compared to sustained ISS/spacecraft habitats.',
      };
    }
    return {
      score: 0.4,
      limitation: `Gravity context (${g}) differs from sustained orbital microgravity.`,
    };
  }

  if (context === 'LUNAR_HABITAT') {
    if (g === 'PARTIAL_GRAVITY_LUNAR') {
      return { score: 1.0, limitation: null };
    }
    return {
      score: g.startsWith('MICROGRAVITY') ? 0.55 : 0.45,
      limitation:
        'Microgravity (0 g) and 1 g tests do NOT validate Lunar partial-gravity (0.165 g) buoyant flame or smoke transport.',
    };
  }

  if (context === 'MARTIAN_HABITAT') {
    if (g === 'PARTIAL_GRAVITY_MARTIAN') {
      return { score: 1.0, limitation: null };
    }
    return {
      score: g.startsWith('MICROGRAVITY') ? 0.55 : 0.45,
      limitation:
        'Microgravity (0 g) and 1 g tests do NOT validate Martian partial-gravity (0.38 g) combustion or cabin pressure regimes.',
    };
  }

  // PRESSURIZED_ROVER
  if (g === 'PARTIAL_GRAVITY_LUNAR' || g === 'PARTIAL_GRAVITY_MARTIAN') {
    return { score: 0.9, limitation: null };
  }
  return {
    score: g.startsWith('MICROGRAVITY') ? 0.65 : 0.5,
    limitation:
      'Pressurized rovers operate in partial gravity with elevated O2/low-pressure exploration atmospheres not fully replicated by 0 g ISS tests.',
  };
}

function computeParameterAlignment(record: ExperimentRecord): number {
  let score = 0.2;
  if (record.oxygenPercent !== null) score += 0.25;
  if (record.airflowVelocity !== null && record.airflowUnit) score += 0.25;
  if (record.reportedValue !== null && record.units) score += 0.2;
  if (record.uncertainty) score += 0.1;
  return Number(Math.min(1.0, score).toFixed(4));
}

function computeMaterialAlignment(record: ExperimentRecord, context: ApplicationContext): number {
  const fuel = `${record.fuelType ?? ''} ${record.material ?? ''} ${record.experimentFamily}`.toLowerCase();
  if (fuel.includes('solid') || fuel.includes('textile') || fuel.includes('pmma') || fuel.includes('protection')) {
    return context === 'ISS_HABITAT' ? 0.9 : 0.8;
  }
  if (fuel.includes('smoke') || fuel.includes('aerosol') || fuel.includes('same')) {
    return 0.85;
  }
  if (fuel.includes('gaseous') || fuel.includes('liquid')) {
    return 0.6;
  }
  return 0.4;
}

/**
 * Deterministic research-relevance ranking.
 * Output represents Research Relevance & Evidence Completeness ONLY —
 * never fire probability, physical hazard severity, or safety certification.
 */
export function scoreExperimentRelevance(
  record: ExperimentRecord,
  context: ApplicationContext
): RelevanceBreakdown {
  const completenessScore = computeEvidenceCompleteness(record);
  const env = computeEnvironmentAlignment(record, context);
  const parameterAlignment = computeParameterAlignment(record);
  const verificationWeight = VERIFICATION_WEIGHTS[record.verificationStatus];
  const materialAlignment = computeMaterialAlignment(record, context);

  const weightedCore =
    0.3 * env.score +
    0.25 * parameterAlignment +
    0.25 * verificationWeight +
    0.2 * materialAlignment;

  // Completeness gates the final relevance index so incomplete/unverified records rank lower.
  const completenessFactor = 0.25 + 0.75 * completenessScore;
  const overallRelevanceIndex = Number((completenessFactor * weightedCore * 100).toFixed(1));

  const missingCriticalFields = getMissingScientificFields(record);
  const limitations: string[] = [];
  if (env.limitation) limitations.push(env.limitation);
  if (missingCriticalFields.length > 0) {
    limitations.push(
      `Missing ${missingCriticalFields.length} key field(s): ${missingCriticalFields.join(', ')}.`
    );
  }
  if (record.verificationStatus === 'SOURCE_LINK_ONLY') {
    limitations.push('Source is link-indexed only; underlying numeric measurements are not yet ingested.');
  }
  if (record.verificationStatus === 'CONTRADICTED') {
    limitations.push('Record is flagged CONTRADICTED in DIWA provenance audit.');
  }
  if (record.originType === 'HYPOTHETICAL') {
    limitations.push('Marked HYPOTHETICAL / synthetic test data — not authentic NASA observations.');
  }

  const rationale = `${record.experimentId} (${record.experimentFamily}) scores ${overallRelevanceIndex}/100 research-relevance for ${CONTEXT_LABELS[context]} based on ${(completenessScore * 100).toFixed(0)}% field completeness and ${record.verificationStatus} provenance.`;

  return {
    experimentId: record.experimentId,
    context,
    completenessScore,
    environmentAlignment: env.score,
    parameterAlignment,
    verificationWeight,
    materialAlignment,
    overallRelevanceIndex,
    missingCriticalFields,
    limitations,
    rationale,
  };
}

export function rankExperimentsForContext(
  records: ExperimentRecord[],
  context: ApplicationContext
): Array<{ record: ExperimentRecord; breakdown: RelevanceBreakdown }> {
  return records
    .map((record) => ({
      record,
      breakdown: scoreExperimentRelevance(record, context),
    }))
    .sort((a, b) => {
      if (b.breakdown.overallRelevanceIndex !== a.breakdown.overallRelevanceIndex) {
        return b.breakdown.overallRelevanceIndex - a.breakdown.overallRelevanceIndex;
      }
      return a.record.experimentId.localeCompare(b.record.experimentId);
    });
}

export interface DeterministicSynthesis {
  contextLabel: string;
  methodologicalSimilarities: string[];
  evidenceGaps: string[];
  contradictions: string[];
  suggestedQuestions: string[];
  groundedSummary: string;
}

export function generateDeterministicSynthesis(
  records: ExperimentRecord[],
  context: ApplicationContext
): DeterministicSynthesis {
  const ranked = rankExperimentsForContext(records, context);
  const withOxygen = records.filter((r) => r.oxygenPercent !== null);
  const withAirflow = records.filter((r) => r.airflowVelocity !== null);
  const withNumericOutcome = records.filter((r) => r.reportedValue !== null && r.units);
  const contradicted = records.filter((r) => r.verificationStatus === 'CONTRADICTED');
  const humanVerified = records.filter((r) => r.verificationStatus === 'HUMAN_VERIFIED');

  const families = Array.from(new Set(records.map((r) => r.experimentFamily)));
  const issSolidCount = records.filter(
    (r) => r.gravityContext === 'MICROGRAVITY_ISS' && (r.fuelType ?? '').toLowerCase().includes('solid')
  ).length;

  const methodologicalSimilarities: string[] = [];
  if (issSolidCount > 0) {
    methodologicalSimilarities.push(
      `${issSolidCount} record(s) investigate solid-fuel combustion in ISS microgravity facilities (${records
        .filter((r) => r.gravityContext === 'MICROGRAVITY_ISS' && (r.fuelType ?? '').toLowerCase().includes('solid'))
        .map((r) => r.experimentId)
        .join(', ')}).`
    );
  }
  if (families.length > 0) {
    methodologicalSimilarities.push(
      `Indexed investigation families span ${families.join(', ')}, separating solid-fuel duct studies (BASS/BASS-II/Saffire) from liquid droplet (FLEX/FLEX-2), smoke aerosol (SAME), and gaseous burner (ACME) geometries.`
    );
  }

  const evidenceGaps: string[] = [
    `${records.length - withOxygen.length} of ${records.length} record(s) do not yet report numeric oxygen concentration (oxygenPercent).`,
    `${records.length - withAirflow.length} of ${records.length} record(s) do not yet report numeric airflow velocity and units.`,
    `${records.length - withNumericOutcome.length} of ${records.length} record(s) lack an extracted numeric measurement with uncertainty.`,
    `${records.length - humanVerified.length} of ${records.length} record(s) have not reached HUMAN_VERIFIED status.`,
  ];

  if (context === 'LUNAR_HABITAT' || context === 'MARTIAN_HABITAT' || context === 'PRESSURIZED_ROVER') {
    evidenceGaps.push(
      `Partial-gravity empirical gap: Current ISS/Cygnus microgravity (0 g) records cannot validate buoyant convection or flame spread thresholds at ${context === 'LUNAR_HABITAT' ? '0.165 g (Lunar)' : context === 'MARTIAN_HABITAT' ? '0.38 g (Martian)' : 'partial-gravity exploration rover conditions'}.`
    );
  }

  const contradictions =
    contradicted.length > 0
      ? contradicted.map(
          (r) =>
            `${r.experimentId} (${r.paperTitle}): marked CONTRADICTED — ${r.notes ?? 'Check DIWA provenance notes.'}`
        )
      : ['No records are currently flagged CONTRADICTED in the active catalog or session dataset.'];

  const top = ranked[0];
  const groundedSummary = top
    ? `Deterministic non-AI synthesis for ${CONTEXT_LABELS[context]} across ${records.length} active record(s): Highest-ranked research entry is ${top.record.experimentId} (${top.record.paperTitle}, Relevance Index ${top.breakdown.overallRelevanceIndex}/100, status ${top.record.verificationStatus}). Currently ${withNumericOutcome.length} record(s) contain extracted numeric measurements with units; remaining records preserve "Not reported / Not verified" until NASA PSI/NTRS tables are imported and human-reviewed.`
    : 'No active records available for synthesis.';

  const suggestedQuestions = [
    'Which specific BASS-II (PSI-25 / NTRS-20210011385) test runs share overlapping oxygen (%) and forced-flow velocity (cm/s) ranges with Saffire-I (PSI-98) despite duct scale differences?',
    'What smoke particulate size distributions from SAME inform false-alarm vs. early-smoldering detection margins in spacecraft ventilation ducts?',
    `How do low-velocity forced convective flows in microgravity (0 g) bound worst-case flame spread uncertainty when extrapolated cautiously toward ${CONTEXT_LABELS[context]}?`,
  ];

  return {
    contextLabel: CONTEXT_LABELS[context],
    methodologicalSimilarities,
    evidenceGaps,
    contradictions,
    suggestedQuestions,
    groundedSummary,
  };
}
