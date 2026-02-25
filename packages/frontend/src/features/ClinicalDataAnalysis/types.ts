import { FacetDefinition, NumericFromTo } from '@gen3/core';
import { Gen3AppConfigData } from '../../lib/content/types';

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

export type SelectedFacet = { value: string; count: number };

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
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  for (const val of Object.values(value)) {
    if (typeof val === 'number') {
      continue; // Valid: number
    }

    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      continue;
    }
    return false;
  }
  return true;
};

export interface ClinicalContinuousStatsData {
  readonly min: number;
  readonly max: number;
  readonly mean: number;
  readonly std_dev: number;
  readonly iqr: number;
  readonly median: number;
  readonly q1: number;
  readonly q3: number;
}

export interface DataDimensionUnitAndToggle {
  unit: DataDimension;
  toggleUnit?: DataDimension;
}

export type CDaveCardType = 'categorical' | 'continuous';

export interface ClinicalDataFacet extends FacetDefinition {
  cardType: CDaveCardType;
  dataDimension?: DataDimensionUnitAndToggle;
  allowQQPlot?: boolean;
}

export interface ClinicalDataFacetProps extends ClinicalDataFacet {
  color: string;
  dataTypename: string;
  uniqueIdField: string;
}

export interface ClinicalDataTab {
  label: string;
  facets: Array<ClinicalDataFacet>;
  color: string;
}

export interface ClinicalDataConfiguration extends Gen3AppConfigData {
  tabs: Array<ClinicalDataTab>;
  index: string; // index name
  uniqueIdField: string; // the primary key field of the index (e.g. case_id)
  dataTypename: string; // the data type of the index (e.g. case)
  indexPrefix?: string;
  initialFields: Array<string>;
}

export type DownloadType = 'svg' | 'png' | null;
