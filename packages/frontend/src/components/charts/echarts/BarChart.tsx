import React, {useMemo} from 'react';
import {processLabel, truncateString} from '../utils';
import { ChartProps } from '../types';
import ReactECharts, { ReactEChartsProps} from './ReactECharts';
import { HistogramDataArray } from '@gen3/core';


interface BarChartData {
    value: number;
    name: string;
}

const processChartData = (
    facetData: HistogramDataArray,
    maxBins = 100,
) : BarChartData[]  => {

    if (!facetData) {
        return [];
    }
    const data =facetData.filter((d:any) => d.key !== '_missing');

    const results = data.slice(0, maxBins)
        .map((d:any) => ({
            value: d.count,
            name: truncateString(processLabel(d.key), 35),
        }));
    return results;
};

const BarChart  = ({ data } : ChartProps) => {
    const chartDefinition = useMemo(() : ReactEChartsProps['option'] => {
        return {

                tooltip: {
                    trigger: 'item'
                },
                series: [
                    { type: 'bar',  data: processChartData(data) }
                ]

        }; }, [data]);

    return (
        <div className="w-full h-64">
            <ReactECharts option={chartDefinition} />
        </div>
    );
};

export default BarChart;
