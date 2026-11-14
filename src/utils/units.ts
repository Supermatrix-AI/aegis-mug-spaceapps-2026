export type PhysicalDimension =
  | 'VELOCITY'
  | 'TEMPERATURE'
  | 'PRESSURE'
  | 'PERCENTAGE'
  | 'HEAT_RELEASE_RATE'
  | 'LENGTH'
  | 'MASS_FLUX'
  | 'UNKNOWN';

interface UnitDescriptor {
  dimension: PhysicalDimension;
  canonicalUnit: string;
  toCanonical: (value: number) => number;
  fromCanonical: (value: number) => number;
  formulaFromUnit: (targetUnit: string) => string;
}

const UNIT_REGISTRY: Record<string, UnitDescriptor> = {
  'cm/s': {
    dimension: 'VELOCITY',
    canonicalUnit: 'cm/s',
    toCanonical: (v) => v,
    fromCanonical: (v) => v,
    formulaFromUnit: (t) => (t === 'cm/s' ? 'identity (1:1)' : `value * 0.01 (${t})`),
  },
  'm/s': {
    dimension: 'VELOCITY',
    canonicalUnit: 'cm/s',
    toCanonical: (v) => v * 100,
    fromCanonical: (v) => v / 100,
    formulaFromUnit: (t) => `m/s -> ${t}`,
  },
  'mm/s': {
    dimension: 'VELOCITY',
    canonicalUnit: 'cm/s',
    toCanonical: (v) => v / 10,
    fromCanonical: (v) => v * 10,
    formulaFromUnit: (t) => `mm/s -> ${t}`,
  },
  '°c': {
    dimension: 'TEMPERATURE',
    canonicalUnit: 'K',
    toCanonical: (v) => v + 273.15,
    fromCanonical: (v) => v - 273.15,
    formulaFromUnit: () => 'T(K) = T(°C) + 273.15',
  },
  c: {
    dimension: 'TEMPERATURE',
    canonicalUnit: 'K',
    toCanonical: (v) => v + 273.15,
    fromCanonical: (v) => v - 273.15,
    formulaFromUnit: () => 'T(K) = T(°C) + 273.15',
  },
  k: {
    dimension: 'TEMPERATURE',
    canonicalUnit: 'K',
    toCanonical: (v) => v,
    fromCanonical: (v) => v,
    formulaFromUnit: () => 'T(°C) = T(K) - 273.15',
  },
  kpa: {
    dimension: 'PRESSURE',
    canonicalUnit: 'kPa',
    toCanonical: (v) => v,
    fromCanonical: (v) => v,
    formulaFromUnit: () => 'kPa',
  },
  atm: {
    dimension: 'PRESSURE',
    canonicalUnit: 'kPa',
    toCanonical: (v) => v * 101.325,
    fromCanonical: (v) => v / 101.325,
    formulaFromUnit: () => 'P(kPa) = P(atm) * 101.325',
  },
  psi: {
    dimension: 'PRESSURE',
    canonicalUnit: 'kPa',
    toCanonical: (v) => v * 6.894757,
    fromCanonical: (v) => v / 6.894757,
    formulaFromUnit: () => 'P(kPa) = P(psi) * 6.894757',
  },
  '%': {
    dimension: 'PERCENTAGE',
    canonicalUnit: '%',
    toCanonical: (v) => v,
    fromCanonical: (v) => v,
    formulaFromUnit: () => 'identity (%)',
  },
  '% o2': {
    dimension: 'PERCENTAGE',
    canonicalUnit: '%',
    toCanonical: (v) => v,
    fromCanonical: (v) => v,
    formulaFromUnit: () => 'identity (% O2)',
  },
  kw: {
    dimension: 'HEAT_RELEASE_RATE',
    canonicalUnit: 'kW',
    toCanonical: (v) => v,
    fromCanonical: (v) => v,
    formulaFromUnit: () => 'identity (kW)',
  },
  w: {
    dimension: 'HEAT_RELEASE_RATE',
    canonicalUnit: 'kW',
    toCanonical: (v) => v / 1000,
    fromCanonical: (v) => v * 1000,
    formulaFromUnit: () => 'P(kW) = P(W) / 1000',
  },
  mm: {
    dimension: 'LENGTH',
    canonicalUnit: 'mm',
    toCanonical: (v) => v,
    fromCanonical: (v) => v,
    formulaFromUnit: () => 'identity (mm)',
  },
  cm: {
    dimension: 'LENGTH',
    canonicalUnit: 'mm',
    toCanonical: (v) => v * 10,
    fromCanonical: (v) => v / 10,
    formulaFromUnit: () => 'L(mm) = L(cm) * 10',
  },
  m: {
    dimension: 'LENGTH',
    canonicalUnit: 'mm',
    toCanonical: (v) => v * 1000,
    fromCanonical: (v) => v / 1000,
    formulaFromUnit: () => 'L(mm) = L(m) * 1000',
  },
};

export function normalizeUnitKey(unit: string | null | undefined): string {
  if (!unit) return '';
  return unit.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getUnitDimension(unit: string | null | undefined): PhysicalDimension {
  const key = normalizeUnitKey(unit);
  return UNIT_REGISTRY[key]?.dimension ?? 'UNKNOWN';
}

export interface UnitConversionResult {
  success: boolean;
  value: number | null;
  targetUnit: string | null;
  formula: string | null;
  error: string | null;
}

/**
 * Performs explicit, dimension-checked unit conversion.
 * Refuses to silently convert incompatible physical dimensions.
 */
export function convertMeasurementUnit(
  value: number | null,
  fromUnit: string | null,
  toUnit: string | null
): UnitConversionResult {
  if (value === null || !Number.isFinite(value)) {
    return {
      success: false,
      value: null,
      targetUnit: toUnit,
      formula: null,
      error: 'Missing or non-finite numeric value cannot be converted.',
    };
  }

  const fromKey = normalizeUnitKey(fromUnit);
  const toKey = normalizeUnitKey(toUnit);

  if (!fromKey || !toKey) {
    return {
      success: false,
      value: null,
      targetUnit: toUnit,
      formula: null,
      error: 'Both source unit and target unit must be specified.',
    };
  }

  if (fromKey === toKey) {
    return {
      success: true,
      value,
      targetUnit: toUnit,
      formula: `Identity (${fromUnit} -> ${toUnit})`,
      error: null,
    };
  }

  const fromDesc = UNIT_REGISTRY[fromKey];
  const toDesc = UNIT_REGISTRY[toKey];

  if (!fromDesc || !toDesc) {
    return {
      success: false,
      value: null,
      targetUnit: toUnit,
      formula: null,
      error: `Unsupported unit conversion between "${fromUnit}" and "${toUnit}". Original units preserved.`,
    };
  }

  if (fromDesc.dimension !== toDesc.dimension) {
    return {
      success: false,
      value: null,
      targetUnit: toUnit,
      formula: null,
      error: `Incompatible physical dimensions: ${fromDesc.dimension} (${fromUnit}) cannot be converted to ${toDesc.dimension} (${toUnit}).`,
    };
  }

  const canonical = fromDesc.toCanonical(value);
  const converted = Number(toDesc.fromCanonical(canonical).toFixed(6));

  return {
    success: true,
    value: converted,
    targetUnit: toUnit,
    formula: `${fromUnit} -> ${fromDesc.canonicalUnit} -> ${toUnit}`,
    error: null,
  };
}

export function formatNumericWithUnit(
  value: number | null | undefined,
  unit: string | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Not reported / Not verified';
  }
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(decimals);
  return unit ? `${formatted} ${unit}` : formatted;
}
