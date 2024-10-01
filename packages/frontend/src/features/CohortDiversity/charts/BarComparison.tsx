import React, { useMemo } from 'react';
import {
  processLabel,
  ReactECharts,
  ReactEChartsProps,
  truncateString,
} from '../../../components/charts';
import { type SeriesOption } from 'echarts';

import { ComparisonChartProps, DatasetWithLabel } from './types';

const processComparisonData = (
  baseData: DatasetWithLabel,
  comparisonData: DatasetWithLabel,
): SeriesOption[] => {
  return [
    {
      name: baseData.title,
      type: 'bar',
      data: baseData.data.map((item) => item.count),
    },
    {
      name: comparisonData.title,
      type: 'bar',
      data: comparisonData.data.map((item) => item.count),
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
    <div className="w-full h-64">
      <ReactECharts option={chartDefinition} />
    </div>
  );
};

export default BarComparison;
