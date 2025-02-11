import React, { useMemo } from 'react';
import * as echarts from 'echarts';
import {
  processLabel,
  ReactECharts,
  truncateString,
} from '../../../components/charts';
import { ComparisonChartProps, DatasetWithLabel } from './types';
import type { SeriesOption } from 'echarts';
import { roundTo2AfterDecimal } from './utils';

const processComparisonData = (
  baseData: DatasetWithLabel,
  comparisonData: DatasetWithLabel,
): { data: SeriesOption[]; maxBase: number; maxComparison: number } => {
  const maxB = baseData.data.reduce((acc, curr) => {
    return Math.max(curr.count, acc);
  }, 0);
  const maxC = comparisonData.data.reduce((acc, curr) => {
    return Math.max(curr.count, acc);
  }, 0);
  return {
    data: [
      {
        type: 'radar',
        data: [
          {
            value: baseData.data.map((item) =>
              roundTo2AfterDecimal(item.count),
            ),
            name: baseData.label,
            itemStyle: { color: '#4e79a7' },
            areaStyle: { opacity: 0.3 },
          },
          {
            value: comparisonData.data.map((item) =>
              roundTo2AfterDecimal(item.count),
            ),
            name: comparisonData.label,
            itemStyle: { color: '#f28e2c' },
            areaStyle: { opacity: 0.3 },
          },
        ],
      },
    ],
    maxBase: maxB,
    maxComparison: maxC,
  };
};

const RadarComparison: React.FC<ComparisonChartProps> = ({
  baseDataset,
  comparisonDataset,
  title,
  yAxisLabel = 'percent',
}) => {
  const categories = baseDataset.data.map((d: any) =>
    truncateString(processLabel(d.key), 35),
  );

  const chartDefinition = useMemo(() => {
    const series = processComparisonData(baseDataset, comparisonDataset);
    const option: echarts.EChartsOption = {
      aria: {
        enabled: true,
      },
      title: {
        text: title,
        left: 'center',
      },
      legend: {
        data: [baseDataset.label, comparisonDataset.label],
        bottom: '5%',
      },
      radar: {
        indicator: categories.map((group) => ({
          name: group,
          max: Math.max(series.maxBase, series.maxComparison),
        })),
        axisLine: {
          lineStyle: {
            color: '#4e79a7',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#8c8989', '#8aa0ae'],
          },
        },
        center: ['50%', '50%'],
        radius: '65%',
      },
      series: series.data,
      tooltip: {
        trigger: 'item',
      },
    };

    return option;
  }, [baseDataset, categories, comparisonDataset, title, yAxisLabel]);

  return (
    <div
      role="region"
      aria-labelledby="radar-comparison-title"
      className="flex flex-col w-full h-96"
    >
      <ReactECharts
        option={chartDefinition}
        settings={{
          notMerge: true,
        }}
      />
    </div>
  );
};

export default RadarComparison;
