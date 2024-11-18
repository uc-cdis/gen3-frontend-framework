import { HistogramDataArray } from '@gen3/core';
import { TitleAndDescription } from '../../types';

export interface SummaryChart extends Partial<TitleAndDescription> {
  chartType: string;
  valueType?: 'count' | 'percent';
  dataLabels?: Record<string, string>;
  tierLevel?: number;
}

export interface ChartProps {
  data: HistogramDataArray;
  total: number;
  valueType?: 'count' | 'percent';
}
