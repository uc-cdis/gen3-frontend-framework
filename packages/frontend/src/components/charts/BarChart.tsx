import React, { useMemo } from 'react';
import { VictoryAxis, VictoryBar, VictoryChart,VictoryContainer, VictoryLabel, VictoryTheme } from 'victory';
import { processLabel, processRangeKeyLabel, truncateString } from "./utils";
import { HistogramDataArray, HistogramData, isHistogramDataArrayAnEnum, isHistogramDataArrayARange } from '@gen3/core';
import { ChartProps } from './types';


interface BarChartData {
    x: string;
    y: number;
    truncatedXName: string;
}

const EmptyResult : BarChartData[] = [];

const processBinnedChartData = (
    facetData: HistogramDataArray,
    maxBins = 100,
) : BarChartData[]  => {

    if (!facetData) {
        return EmptyResult;
    }

    const results = facetData.slice(0, maxBins)
        .map((d:any) => {
            const label = processRangeKeyLabel(d.key);
            return {
            x: label,
            truncatedXName: truncateString(label, 35),
            y: d.count,
        };
    }
    );
    return results;
};

const processChartData = (
    facetData: HistogramDataArray,
    maxBins = 100,
) : BarChartData[]  => {

    if (!facetData) {
        return EmptyResult;
    }

    console.log("facetData", facetData);
    if (isHistogramDataArrayARange(facetData))
      return processBinnedChartData(facetData, maxBins);

    else {

      const data = facetData.filter((d: HistogramData) => d.key !== '_missing');

      const results = data.slice(0, maxBins)
        .map((d: any) => ({
          x: processLabel(d.key),
          truncatedXName: truncateString(processLabel(d.key), 35),
          y: d.count,
        }));
      return results.reverse();
    }
};

const BarChart  = ({ data } : ChartProps) => {

    const chartData = useMemo(() => processChartData(data), [data]);

    return (
        <VictoryChart
            domainPadding={[data.length === 2 ? 100 : 28, 0]}
            theme={VictoryTheme.material} animate={{duration: 500}}
            containerComponent={<VictoryContainer responsive={true}/>}
        >
            <VictoryAxis
                tickLabelComponent={
                    <VictoryLabel
                        textAnchor={'middle'}
                        style={[{ fontSize: 12, fontFamily: 'Noto Sans, sans-serif' }]}
                        text={({ datum }) => chartData[datum - 1]?.truncatedXName}
                    />
                }
                style={{
                    grid: { stroke: 'none' },
                    ticks: { size: 0 },
                    axis: { strokeWidth: 0 },
                }}
            />


            <VictoryAxis
                dependentAxis
                style={{
                    grid: { stroke: 'none' },
                    axisLabel: { padding: 30, fontSize: 20, fontWeight: 'bold' },
                    tickLabels: { fontSize: 18 },
                }}
                tickCount={3}
                crossAxis={false}
            />

        <VictoryBar data={chartData} barRatio={1.1}/>
        </VictoryChart>
    );
};

export default BarChart;
