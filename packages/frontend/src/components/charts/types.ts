import { HistogramDataArray } from '@gen3/core';

export interface SummaryChart {
  readonly title: string;
  readonly chartType: string;
  readonly valueType?: 'count' | 'percent';
}

export interface ChartProps {
  data: HistogramDataArray;
  total: number;
  valueType?: 'count' | 'percent';
}
