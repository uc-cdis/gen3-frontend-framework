import { HistogramDataArray } from '@gen3/core';

export interface DatasetWithLabel {
  data: HistogramDataArray;
  title: string;
}

export interface ComparisonChartProps {
  baseDataset: DatasetWithLabel;
  comparisonDataset: DatasetWithLabel;
  title: string;
  yAxisLabel?: string;
}
