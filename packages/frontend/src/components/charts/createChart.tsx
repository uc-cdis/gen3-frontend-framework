import React from 'react';
import BarChart from './BarChart';
import PieChart from './echarts/PieChart';
import DonutChart from './echarts/DonutChart';
import HorizontalBarChart from './echarts/HorizontalBarChart';
import { ChartProps } from './types';

/** createChart selects which type of chart element to create depending on the
  * values in the exploration page config file.
  */
export const createChart = (
  type: string,
  chartProps: ChartProps
): React.ReactNode => {
    return (
        <React.Fragment>
            {
                {
                    bar: (
                        <BarChart {...chartProps} />
                    ),
                    horizontalStacked: (
                      <HorizontalBarChart {...chartProps} />
                    ),
                    fullPie: (
                        <PieChart {...chartProps}/>
                    ),
                    donut: (
                        <DonutChart {...chartProps} />
                    )
                }[type as string]
            }
        </React.Fragment>);
};
