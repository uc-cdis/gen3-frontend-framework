import React from 'react';
import { ChartProps, MultitrackChartProps } from './types';
import ChartRendererFactory, {
  MultitrackChartRendererFactory,
} from './ChartRendererFactory';

const MULTITRACK_CHART_TYPES = new Set(['multiTrackHorizontalBar']);

/** createChart selects which type of chart element to create depending on the
 * values in the exploration page config file.
 */
export const createChart = (
  type: string,
  chartProps: ChartProps | MultitrackChartProps,
  parameters?: Record<string, any>,
): React.ReactNode => {
  // TODO: add default chart chart for missing chart type

  if (MULTITRACK_CHART_TYPES.has(type)) {
    const element = MultitrackChartRendererFactory().getRenderer('chart', type);
    return element(
      {
        total: chartProps.total,
        valueType: chartProps.valueType,
        label: chartProps.label,
        data: chartProps.data as MultitrackChartProps['data'],
        showLegendInChart: chartProps.showLegendInChart,
      },
      parameters,
    );
  } else {
    const element = ChartRendererFactory().getRenderer('chart', type);
    return element(
      {
        total: chartProps.total,
        valueType: chartProps.valueType,
        label: chartProps.label,
        data: chartProps.data as ChartProps['data'],
        showLegendInChart: chartProps.showLegendInChart,
      },
      parameters,
    );
  }
};
