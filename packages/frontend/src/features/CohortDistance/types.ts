import { JSONObject } from '@gen3/core';
import { SummaryChart } from '../../components/charts';
import { TitleAndDescription } from '../../types';
import { Gen3AppConfigData } from '../../lib/content/types';

export interface DistanceChart extends TitleAndDescription {
  chartType: string;
  valueLabel?: string;
  parameters?: JSONObject;
}

export interface DistanceData {
  dataset: string;
  label: string;
}

export interface GroundWithComparisonDatasets {
  ground: DistanceData;
  comparison: Array<DistanceData>;
}

export interface CohortDistanceConfig extends Gen3AppConfigData {
  datasets: GroundWithComparisonDatasets;
  fields: ReadonlyArray<string>;
  fieldsConfig?: Record<string, Partial<TitleAndDescription>>;
  charts: Record<string, SummaryChart>;
  comparisonCharts: Record<string, DistanceChart>;
  numberOfColumns?: number;
}
