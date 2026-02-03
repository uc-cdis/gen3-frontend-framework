import { FacetDefinition, NumericFromTo } from '@gen3/core';

export interface CustomInterval {
  readonly interval: number;
  readonly min: number;
  readonly max: number;
}

export type NamedFromTo = NumericFromTo & {
  name: string;
};

export type ContinuousCustomBinnedData = CustomInterval | NamedFromTo[];

export type CategoricalBins = Record<string, number | Record<string, number>>;

export type ChartTypes = 'histogram' | 'survival' | 'boxqq';

export type SelectedFacet = { value: string; numCases: number };

export type DataDimension =
  | 'Years'
  | 'Days'
  | 'Kilograms'
  | 'Centimeters'
  | 'Unset';

export type DisplayData = {
  displayName: string;
  key: string;
  count: number;
}[];

export type CustomBinData = CategoricalBins | any[] | CustomInterval | null;

export const isCategoricalBins = (value: unknown): value is CategoricalBins => {
  // Early exit for non-objects
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  // TypeScript already knows this is an object at this point
  // We just need to check if it's a valid Record<string, number | Record<string, number>>
  // Since Object.entries gives us string keys by default, we only need to validate values

  for (const val of Object.values(value)) {
    if (typeof val === 'number') {
      continue; // Valid: number
    }

    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      // Quick check: if it's an object, assume it's Record<string, number>
      // TypeScript's structural typing will catch type mismatches at compile time
      continue; // Valid: assumed Record<string, number>
    }

    return false; // Invalid: not number or object
  }

  return true;
};

interface ClinicalDataFacet extends FacetDefinition {
  cardType: 'categorical' | 'continuous';
  facetDefinition?: FacetDefinition;
}

interface ClinicalDataTab {
  label: string;
  facets: ClinicalDataFacet;
  color?: string | null;
}

export interface ClinicalDataConfiguration {
  tabs: ClinicalDataTab;
}
