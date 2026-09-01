import type { HistogramDataArray } from '@gen3/core';
import type { TitleAndDescription } from '../../types';

export interface SummaryChart extends Partial<TitleAndDescription> {
  readonly chartType: string;
  readonly valueType?: 'count' | 'percent';
  readonly dataLabels?: Record<string, string>;
  label?: {
    show?: boolean;
  };
  showLegendInChart?: boolean;
  fixedData?: HistogramDataArray; // optional data override for chart
}

interface SummaryChartWithField extends SummaryChart {
  field: string;
}

export interface ChartProps {
  data: HistogramDataArray;
  total: number;
  valueType?: 'count' | 'percent';
  label?: {
    show?: boolean;
  };
  showLegendInChart?: boolean;
  labelTruncation?: number;
  showXTicks?: boolean;
  showYTicks?: boolean;
  xLabel?: string;
  yLabel?: string;
  maxBins?: number;
  color?: string;
  xLabelRotation?: number;
}

export interface CollapsableChartsPanelConfiguration {
  enabled: boolean;
  title?: string;
  showLegends?: {
    enabled: boolean;
    showSwitch?: boolean;
  };
  charts?: Record<string, SummaryChart>;
}
