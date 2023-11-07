import React, { useMemo } from 'react';
import { VictoryAxis, VictoryPie, VictoryChart,VictoryContainer, VictoryLabel, VictoryTheme } from 'victory';
import {  processLabel, truncateString } from './utils';

interface PieChartProps {
    data: ReadonlyArray<Record<string, number>>;
}

interface PieChartData {
    x: string;
    y: number;
    label: string;
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
        .map((d:any, i:number) => ({
            x: i,
            y: d.count,
            label: truncateString(processLabel(d.key), 35),
        }));
    return results;
};


const PieChart : React.FC<PieChartProps> = ({ data } : PieChartProps) => {
    const chartData = useMemo(() => processChartData(data[0]), [data]);
    return (
            <VictoryPie theme={VictoryTheme.material} data={chartData} animate={{duration: 500}}/>
    );
};

export default PieChart;
