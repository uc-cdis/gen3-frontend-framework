import { HistogramDataArray } from '@gen3/core';
import { TitleAndDescription } from '../../types';

export interface SummaryChart extends Partial<TitleAndDescription> {
  readonly chartType: string;
  readonly valueType?: 'count' | 'percent';
  readonly dataLabels?: Record<string, string>;
}

export interface ChartProps {
  data: HistogramDataArray;
  total: number;
  valueType?: 'count' | 'percent';
}
