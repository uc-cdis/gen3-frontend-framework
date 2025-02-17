import { JSONObject } from '@gen3/core';
import { SummaryChart } from '../../components/charts';
import { TitleAndDescription } from '../../types';
import { Gen3AppConfigData } from '../../lib/content/types';

export interface SimilarityChart extends TitleAndDescription {
  chartType: string;
  valueLabel?: string;
  parameters?: JSONObject;
}

export interface SimilarityData {
  dataset: string;
  label: string;
}

export interface GroundWithComparisonDatasets {
  ground: SimilarityData;
  comparison: Array<SimilarityData>;
}

export interface CohortSimilarityConfig extends Gen3AppConfigData {
  datasets: GroundWithComparisonDatasets;
  fields: ReadonlyArray<string>;
  fieldsConfig?: Record<string, Partial<TitleAndDescription>>;
  charts: Record<string, SummaryChart>;
  comparisonCharts: Record<string, SimilarityChart>;
  numberOfColumns?: number;
}
