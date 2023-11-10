import React, {useMemo} from 'react';
import {processLabel, truncateString} from '../utils';
import ReactECharts, { ReactEChartsProps} from './ReactECharts';
import { HistogramDataArray, HistogramData } from '@gen3/core';
import { ChartProps } from '../types';


interface DonutChartData {
    value: number;
    name: string;
}

const processChartData = (
    facetData: HistogramDataArray,
    maxBins = 100,
) : DonutChartData[]  => {

    if (!facetData) {
        return [];
    }
    const data =facetData.filter((d:HistogramData) => d.key !== '_missing');

    const results = data.slice(0, maxBins)
        .map((d:any) => ({
            value: d.count,
            name: truncateString(processLabel(d.key), 35),
        }));
    return results;
};

const DonutChart = ({ data } : ChartProps) => {
    const chartDefinition = useMemo(() : ReactEChartsProps['option'] => {
        return {
                legend: {
                    orient: 'horizontal',
                    top: '5%',
                    left: 'barMinHeight'
                },
                tooltip: {
                    trigger: 'item'
                },
            label: {
                show: false,
                position: 'center'
            },
                series: [
                    {
                        type: 'pie',
                        radius: ['30%','60%'],
                        data: processChartData(data),
                        labelLine: {
                            show: false
                        },
                    }
                ]

        }; }, [data]);

    return (
        <div className="w-64 h-64">
            <ReactECharts option={chartDefinition} />
        </div>
    );
};

export default DonutChart;
