import React, { useMemo } from 'react';
import {
  processLabel,
  ReactECharts,
  ReactEChartsProps,
  truncateString,
} from '../../../components/charts';
import { type SeriesOption } from 'echarts';
import { ComparisonChartProps, DatasetWithLabel } from './types';
import { roundTo2AfterDecimal } from './utils';

const processComparisonData = (
  baseData: DatasetWithLabel,
  comparisonData: DatasetWithLabel,
): SeriesOption[] => {
  return [
    {
      name: baseData.label,
      type: 'bar',
      barGap: 0,
      itemStyle: { color: '#4e79a7' },
      data: baseData.data.map((item) => roundTo2AfterDecimal(item.count)),
      emphasis: {
        focus: 'series',
      },
    },
    {
      name: comparisonData.label,
      type: 'bar',
      itemStyle: { color: '#f28e2c' },
      data: comparisonData.data.map((item) => roundTo2AfterDecimal(item.count)),
      emphasis: {
        focus: 'series',
      },
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
      aria: {
        enabled: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      title: {
        text: title,
        left: 'center',
      },

      legend: {
        data: [baseDataset.label, comparisonDataset.label],
        bottom: '5%',
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisTick: { show: false },
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

export default BarComparison;
