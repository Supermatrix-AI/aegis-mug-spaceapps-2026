import type { CompatibilityReport, ExperimentRecord } from '../types/scientific.ts';
import { convertMeasurementUnit, getUnitDimension, normalizeUnitKey } from './units.ts';

/**
 * Evaluates scientific comparability across 2-4 selected ExperimentRecords.
 * Explicitly flags differences in gravity, fuel/material, geometry, oxygen, airflow,
 * measurement type, and units. Never invents data to draw a chart.
 */
export function evaluateExperimentCompatibility(
  selected: ExperimentRecord[]
): CompatibilityReport {
  const warnings: string[] = [];
  const blockers: string[] = [];
  const missingNumericExplanation: string[] = [];

  if (selected.length < 2) {
    blockers.push('Select at least 2 records (maximum 4) to run a scientific comparison.');
    return {
      comparable: false,
      warnings,
      blockers,
      sharedNumericDimensions: [],
      missingNumericExplanation,
    };
  }

  const gravities = new Set(selected.map((r) => r.gravityContext));
  if (gravities.size > 1) {
    warnings.push(
      `Gravity context mismatch across selected records: ${Array.from(gravities).join(' vs. ')}. Buoyancy and natural convection differ fundamentally across gravity regimes.`
    );
  }

  const fuelTypes = new Set(selected.map((r) => (r.fuelType ?? 'Unspecified').toLowerCase()));
  if (fuelTypes.size > 1) {
    warnings.push(
      `Fuel/phase mismatch (${Array.from(fuelTypes).join(' vs. ')}). Solid-fuel flame spread cannot be equated directly to liquid droplet or gaseous flame metrics.`
    );
  }

  const geometries = new Set(
    selected.map((r) => (r.experimentGeometry ?? 'Unspecified').toLowerCase())
  );
  if (geometries.size > 1) {
    warnings.push(
      'Experimental geometry differs (e.g., small MSG flow duct vs. large Cygnus Saffire duct or CIR chamber), introducing wall-heat-loss and blockage-ratio differences.'
    );
  }

  const origins = selected.filter((r) => r.originType === 'HYPOTHETICAL');
  if (origins.length > 0) {
    warnings.push(
      `Warning: ${origins.map((o) => o.experimentId).join(', ')} marked HYPOTHETICAL (not authentic NASA observations).`
    );
  }

  const sharedNumericDimensions: CompatibilityReport['sharedNumericDimensions'] = [];

  // 1. Oxygen concentration (%)
  const o2Records = selected.filter((r) => r.oxygenPercent !== null);
  if (o2Records.length >= 2) {
    sharedNumericDimensions.push({
      key: 'oxygenPercent',
      label: 'Oxygen Concentration (%)',
      targetUnit: '% O2',
      values: o2Records.map((r) => ({
        experimentId: r.experimentId,
        title: r.paperTitle,
        value: r.oxygenPercent as number,
        originalValue: r.oxygenPercent as number,
        originalUnit: '% O2',
        converted: false,
        verificationStatus: r.verificationStatus,
      })),
    });
  } else {
    missingNumericExplanation.push(
      `Oxygen concentration (%): only ${o2Records.length} of ${selected.length} selected record(s) report numeric oxygenPercent.`
    );
  }

  // 2. Airflow velocity (converted explicitly to cm/s when dimension is VELOCITY)
  const flowRecords = selected.filter(
    (r) => r.airflowVelocity !== null && Boolean(r.airflowUnit)
  );
  const convertibleFlow: typeof sharedNumericDimensions[number]['values'] = [];
  for (const r of flowRecords) {
    const conv = convertMeasurementUnit(r.airflowVelocity, r.airflowUnit, 'cm/s');
    if (conv.success && conv.value !== null) {
      convertibleFlow.push({
        experimentId: r.experimentId,
        title: r.paperTitle,
        value: conv.value,
        originalValue: r.airflowVelocity as number,
        originalUnit: r.airflowUnit,
        converted: normalizeUnitKey(r.airflowUnit) !== 'cm/s',
        verificationStatus: r.verificationStatus,
      });
    } else {
      warnings.push(
        `Airflow velocity for ${r.experimentId} (${r.airflowVelocity} ${r.airflowUnit}) cannot be normalized to cm/s: ${conv.error}`
      );
    }
  }
  if (convertibleFlow.length >= 2) {
    sharedNumericDimensions.push({
      key: 'airflowVelocity',
      label: 'Forced Airflow Velocity (Normalized to cm/s)',
      targetUnit: 'cm/s',
      values: convertibleFlow,
    });
  } else {
    missingNumericExplanation.push(
      `Airflow velocity: only ${convertibleFlow.length} of ${selected.length} selected record(s) have unit-compatible velocity values.`
    );
  }

  // 3. Reported primary outcome value (only if >=2 share the exact same physical dimension)
  const outcomeRecords = selected.filter(
    (r) => r.reportedValue !== null && Boolean(r.units)
  );
  if (outcomeRecords.length >= 2) {
    const dimGroups = new Map<string, ExperimentRecord[]>();
    for (const r of outcomeRecords) {
      const dim = getUnitDimension(r.units);
      const groupKey = dim !== 'UNKNOWN' ? dim : `RAW:${normalizeUnitKey(r.units)}`;
      const arr = dimGroups.get(groupKey) ?? [];
      arr.push(r);
      dimGroups.set(groupKey, arr);
    }

    let matchedGroup: ExperimentRecord[] | null = null;
    for (const group of dimGroups.values()) {
      if (group.length >= 2) {
        matchedGroup = group;
        break;
      }
    }

    if (matchedGroup) {
      const targetUnit = matchedGroup[0].units as string;
      const convertedValues: typeof sharedNumericDimensions[number]['values'] = [];
      for (const r of matchedGroup) {
        if (normalizeUnitKey(r.units) === normalizeUnitKey(targetUnit)) {
          convertedValues.push({
            experimentId: r.experimentId,
            title: r.paperTitle,
            value: r.reportedValue as number,
            originalValue: r.reportedValue as number,
            originalUnit: r.units,
            converted: false,
            verificationStatus: r.verificationStatus,
          });
        } else {
          const conv = convertMeasurementUnit(r.reportedValue, r.units, targetUnit);
          if (conv.success && conv.value !== null) {
            convertedValues.push({
              experimentId: r.experimentId,
              title: r.paperTitle,
              value: conv.value,
              originalValue: r.reportedValue as number,
              originalUnit: r.units,
              converted: true,
              verificationStatus: r.verificationStatus,
            });
          }
        }
      }

      if (convertedValues.length >= 2) {
        sharedNumericDimensions.push({
          key: 'reportedValue',
          label: `Primary Reported Measurement (${targetUnit})`,
          targetUnit,
          values: convertedValues,
        });
      }
    } else {
      warnings.push(
        'Selected records report numeric outcomes in incompatible physical units/dimensions and cannot be plotted on a common axis.'
      );
      missingNumericExplanation.push(
        'Primary reported outcome: units across selected records belong to different physical dimensions.'
      );
    }
  } else {
    missingNumericExplanation.push(
      `Primary reported outcome: only ${outcomeRecords.length} of ${selected.length} selected record(s) report a numeric reportedValue with units.`
    );
  }

  return {
    comparable: sharedNumericDimensions.length > 0,
    warnings,
    blockers,
    sharedNumericDimensions,
    missingNumericExplanation,
  };
}
