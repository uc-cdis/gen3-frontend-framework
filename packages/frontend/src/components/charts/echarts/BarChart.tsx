import React, { useMemo } from 'react';
import { processLabel, truncateString } from '../utils';
import { ChartProps } from '../types';
import ReactECharts, { ReactEChartsProps } from './ReactECharts';
import { HistogramDataArray } from '@gen3/core';

interface BarChartData {
  value: number;
  name: string;
}

const filterMissing = (facetData: any) =>
  facetData.filter((d: any) => d.key !== '_missing');

const processChartData = (
  facetData: HistogramDataArray,
  maxBins = 100,
): BarChartData[] => {
  if (!facetData) {
    return [];
  }
  const data = filterMissing(facetData);

  const results = data.slice(0, maxBins).map((d: any) => ({
    value: d.count,
    name: truncateString(processLabel(d.key), 35),
  }));
  return results;
};

const processAxis = (facetData: HistogramDataArray, maxBins = 100) => {
  const data = filterMissing(facetData);
  const categories = data
    .slice(0, maxBins)
    .map((d: any) => truncateString(processLabel(d.key), 35));
  return {
    yAxis: [
      {
        type: 'value',
      },
    ],
    xAxis: [
      {
        type: 'category',
        axisTick: { show: false },
        data: categories,
      },
    ],
  };
};

const BarChart = ({ data }: ChartProps) => {
  const chartDefinition = useMemo((): ReactEChartsProps['option'] => {
    return {
      grid: [
        {
          show: false,
          left: '1%',
          top: 10,
          right: '1%',
          bottom: 7,
          containLabel: true,
        },
      ],
      tooltip: {
        trigger: 'item',
      },
      ...processAxis(data),
      series: [{ type: 'bar', data: processChartData(data) }],
    };
  }, [data]);

  return (
    <div className="w-full h-64">
      <ReactECharts option={chartDefinition} />
    </div>
  );
};

export default BarChart;
