import React, { useMemo } from 'react';
import { Text } from '@mantine/core';
import {
  processLabel,
  ReactECharts,
  ReactEChartsProps,
  truncateString,
} from '../../../components/charts';
import { type SeriesOption } from 'echarts';
import { ComparisonChartProps, DatasetWithLabel } from './types';

const roundTo2AfterDecimal = (number: number) => {
  return Math.round((number + Number.EPSILON) * 100) / 100;
};

const processComparisonData = (
  baseData: DatasetWithLabel,
  comparisonData: DatasetWithLabel,
): SeriesOption[] => {
  return [
    {
      name: baseData.label,
      type: 'bar',
      data: baseData.data.map((item) => roundTo2AfterDecimal(item.count)),
    },
    {
      name: comparisonData.label,
      type: 'bar',
      data: comparisonData.data.map((item) => roundTo2AfterDecimal(item.count)),
    },
  ];
};

const BarComparison: React.FC<ComparisonChartProps> = ({
  baseDataset,
  comparisonDataset,
  title,
  yAxisLabel = 'percent',
}) => {
  const categories = baseDataset.data.map((d: any) =>
    truncateString(processLabel(d.key), 35),
  );

  const series = useMemo(
    () => processComparisonData(baseDataset, comparisonDataset),
    [baseDataset, comparisonDataset],
  );

  const chartDefinition = useMemo((): ReactEChartsProps['option'] => {
    return {
      tooltip: {
        trigger: 'item',
      },
      title: {
        text: title,
      },
      legend: {
        data: [baseDataset.label, comparisonDataset.label],
      },
      xAxis: {
        type: 'category',
        data: categories,
      },
      yAxis: {
        type: 'value',
        name: yAxisLabel,
      },
      series: series as SeriesOption[],
    };
  }, [
    baseDataset.label,
    categories,
    comparisonDataset.label,
    series,
    title,
    yAxisLabel,
  ]);

  return (
    <div
      role="region"
      aria-labelledby="bar-comparison-title"
      className="flex flex-col w-full h-64"
    >
      <ReactECharts option={chartDefinition} />
    </div>
  );
};

export default BarComparison;
