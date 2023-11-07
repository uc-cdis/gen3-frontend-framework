import { HistogramDataArray } from '@gen3/core';

export interface SummaryChart {
  readonly title: string;
  readonly chartType: string;
}

export interface ChartProps {
  data: HistogramDataArray;
}
