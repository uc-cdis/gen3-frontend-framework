import React, {useMemo} from 'react';
import {processLabel, truncateString} from '../utils';
import ReactECharts, { ReactEChartsProps} from './ReactECharts';

interface DonutChartProps {
    data: ReadonlyArray<Record<string, number>>;
}

interface DonutChartData {
    value: number;
    name: string;
}

const processChartData = (
    facetData: Record<string, any>,
    maxBins = 100,
) : DonutChartData[]  => {

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

const DonutChart : React.FC<DonutChartProps> = ({ data } : DonutChartProps) => {
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
                        data: processChartData(data[0]),
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
