import React, {useMemo} from 'react';
import {processLabel, truncateString} from '../utils';
import ReactECharts, { ReactEChartsProps} from './ReactECharts';
import { ChartProps } from '../types';


interface PieChartData {
    value: number;
    name: string;
}

const processChartData = (
    facetData: Record<string, any>,
    maxBins = 100,
) : PieChartData[]  => {

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

const PieChart : React.FC<ChartProps> = ({ data } : ChartProps) => {
    const chartDefinition = useMemo(() : ReactEChartsProps['option'] => {
        return {
            label: {
                show: true
            },
            emphasis: {
                label: {
                    show: true
                }
            },
                tooltip: {
                    trigger: 'item'
                },
                series: [
                    { type: 'pie', radius: '60%',  data: processChartData(data[0]) }
                ]

        }; }, [data]);

    return (
        <div className="w-full h-64">
            <ReactECharts option={chartDefinition} />
        </div>
    );
};

export default PieChart;
