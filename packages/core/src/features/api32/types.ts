export interface Api32FilterDiscrete {
  name: string;
  values: ReadonlyArray<string>;
}

export interface Api32FilterContinuous {
  name: string;
  min: number;
  max: number;
}

export interface Api32Filters {
  discrete?: Array<Api32FilterDiscrete>;
  continuous?: Array<Api32FilterContinuous>;
}

export const isApi32FilterDiscrete = (x: unknown): x is Api32FilterDiscrete => {
  if (typeof x !== 'object' || x === null) return false;

  const o = x as Record<string, unknown>;

  return (
    typeof o.name === 'string' &&
    Array.isArray(o.values) &&
    o.values.every((v) => typeof v === 'string')
  );
};

export const isApi32FilterContinuous = (
  x: unknown,
): x is Api32FilterContinuous => {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.name === 'string' &&
    typeof o.min === 'number' &&
    typeof o.max === 'number'
  );
};

export const isApi32Filters = (x: unknown) => {
  if (typeof x !== 'object' || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    Array.isArray(o.discrete) &&
    o.discrete.every(isApi32FilterDiscrete) &&
    Array.isArray(o.continuous) &&
    o.continuous.every(isApi32FilterContinuous)
  );
};
