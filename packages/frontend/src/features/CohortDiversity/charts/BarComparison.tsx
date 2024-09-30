import React, { useState, useEffect, useMemo } from 'react';
import {
  processLabel,
  ReactECharts,
  ReactEChartsProps,
  truncateString,
} from '../../../components/charts';
import { HistogramDataArray } from '@gen3/core';

interface DatasetWithLabel {
  data: HistogramDataArray;
  title: string;
}

const processComparisonData = (
  baseData: DatasetWithLabel,
  comparisonData: DatasetWithLabel,
) => {
  return [
    {
      name: baseData.title,
      type: 'bar',
      data: baseData.data.map((item) => item.count),
    },
    {
      name: baseData.title,
      type: 'bar',
      data: comparisonData.data.map((item) => item.count),
    },
  ];
};

interface BarComparisonProps {
  baseDataset: DatasetWithLabel;
  comparisonDataset: DatasetWithLabel;
  title: string;
  yAxisLabel?: string;
}

const BarComparison: React.FC<BarComparisonProps> = ({
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
        data: ['Census Population', 'Study Population'],
      },
      xAxis: {
        type: 'category',
        data: categories,
      },
      yAxis: {
        type: 'value',
      },
      series: series,
    };
  }, [categories, series, title]);

  return (
    <div className="w-full h-64">
      <ReactECharts option={chartDefinition} />
    </div>
  );
};

export default BarComparison;
