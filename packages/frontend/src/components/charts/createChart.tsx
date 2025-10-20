import React from 'react';
import { ChartProps } from './types';
import ChartRendererFactory from './ChartRendererFactory';

/** createChart selects which type of chart element to create depending on the
 * values in the exploration page config file.
 */
export const createChart = (
  type: string,
  chartProps: ChartProps,
  parameters?: Record<string, any>,
): React.ReactNode => {
  // TODO: add default chart chart for missing chart type
  const element = ChartRendererFactory().getRenderer('chart', type);
  return element(
    {
      total: chartProps.total,
      valueType: chartProps.valueType,
      label: chartProps.label,
      data: chartProps.data,
      showLegendInChart: chartProps.showLegendInChart,
    },
    parameters,
  );
};
