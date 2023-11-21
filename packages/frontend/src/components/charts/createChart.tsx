import React from 'react';
import BarChart from './BarChart';
import PieChart from './echarts/PieChart';
import DonutChart from './echarts/DonutChart';
import HorizontalBarChart from './echarts/HorizontalBarChart';
import { ChartProps } from './types';


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
