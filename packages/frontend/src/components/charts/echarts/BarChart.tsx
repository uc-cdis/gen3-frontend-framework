import React, { useMemo } from 'react';
import { processLabel, truncateString } from '../utils';
import { ChartProps } from '../types';
import ReactECharts, { ReactEChartsProps } from './ReactECharts';
import { HistogramDataArray } from '@gen3/core';
import type { EChartsOption } from 'echarts';
import { graphic } from 'echarts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { isArray } from 'lodash';

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

  return data.slice(0, maxBins).map((d: any) => {
    const label = truncateString(
      typeof d.key === 'string' ? processLabel(d.key) : d.key.toString(),
      35,
    );
    if (d.count >= 0) return { value: d.count, name: label };

    // handle redacted data
    return {
      value: max,
      groupId: 'redacted',
      name: label,
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
        formatter: function (param) {
          const p: CallbackDataParams =
            isArray(param) && param.length > 0
              ? param[0]
              : (param as CallbackDataParams);

          const colorSquare = `<span style="display:inline-block; width:10px; height:10px; background-color:${p.color}; margin-right:5px;"></span>`;

          if ((p.data as any).groupId === 'redacted')
            return `${p.name}: <b>hidden</b`;

          return `${colorSquare}${p.name}: <b>${p.value}</b>`;

          // if ((p.data as any).groupId === 'redacted') return `${p.name} Hidden`;
          //return `${p.name} ${p.value}`;
        },
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
