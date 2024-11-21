import React, { useMemo } from 'react';
import { processLabel, truncateString } from '../utils';
import { ChartProps } from '../types';
import ReactECharts, { ReactEChartsProps } from './ReactECharts';
import { HistogramDataArray } from '@gen3/core';
import type { EChartsOption } from 'echarts';
import { graphic } from 'echarts';

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

  if (data.length === 0) return [];

  // get max value in data

  let max = Math.max(...data.map((d: any) => d.count));
  if (max < 0) {
    max = 1;
  }

  const results = data.slice(0, maxBins).map((d: any) => {
    if (d.count >= 0)
      return { value: d.count, name: truncateString(processLabel(d.key), 35) };

    return {
      value: max,
      name: truncateString(processLabel(d.key), 35),
      itemStyle: {
        opacity: 0.5,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#0264ff00' },
          { offset: 1, color: '#0264ff' },
        ]),
        decal: {
          symbolSize: 1.15,
          dashArrayX: [2, 1],
          dashArrayY: [2, 1],
        },
      },
    };
  });
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
        data: categories,
      },
    ],
  } as EChartsOption;
};

const BarChart = ({ data }: ChartProps) => {
  const chartDefinition = useMemo((): ReactEChartsProps['option'] => {
    return {
      grid: [
        //TODO: make this configurable
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
