import React from 'react';
import BarChart from './BarChart';
import PieChart from './echarts/PieChart';
import DonutChart from './echarts/DonutChart';
import { HistogramDataArray } from "@gen3/core";

export const createChart = (
    type: string,
    data: HistogramDataArray,
): React.ReactNode => {
    return (
        <React.Fragment>
            {
                {
                    bar: (
                        <BarChart data={data} />
                    ),
                    fullPie: (
                        <PieChart data={data} />
                    ),
                    donut: (
                        <DonutChart data={data} />
                    )
                }[type as string]
            }
        </React.Fragment>);
};
