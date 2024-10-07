import { HistogramDataArray } from '@gen3/core';

export interface SummaryChart {
  readonly title: string;
  readonly chartType: 'bar' | 'horizontalStacked' | 'fullPie' | 'donut';
  readonly valueType?: 'count' | 'percent';
  readonly dataLabels?: Record<string, string>;
}

export interface ChartProps {
  data: HistogramDataArray;
  total: number;
  valueType?: 'count' | 'percent';
}
