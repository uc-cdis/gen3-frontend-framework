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
): SeriesOption[] => {
  return [
    {
      type: 'radar',
      data: [
        {
          value: baseData.data.map((item) => roundTo2AfterDecimal(item.count)),
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
  ];
};

interface DataItem {
  name: string;
  [key: string]: number | string;
}

const RadarComparison: React.FC<ComparisonChartProps> = ({
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

  const chartDefinition = useMemo(() => {
    const option: echarts.EChartsOption = {
      title: {
        text: title,
        left: 'center',
      },
      legend: {
        data: ['Census', 'Study'],
        bottom: '5%',
      },
      radar: {
        indicator: ageGroups.map((group) => ({ name: group, max: 30 })),
        center: ['50%', '50%'],
        radius: '65%',
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: ageGroups.map((group) => data[0][group] as number),
              name: 'Census',
              itemStyle: { color: '#4e79a7' },
              areaStyle: { opacity: 0.3 },
            },
            {
              value: ageGroups.map((group) => data[1][group] as number),
              name: 'Study',
              itemStyle: { color: '#f28e2c' },
              areaStyle: { opacity: 0.3 },
            },
          ],
        },
      ],
      tooltip: {
        trigger: 'item',
      },
    };

    return option;
  }, []);

  return (
    <div
      role="region"
      aria-labelledby="radar-comparison-title"
      className="flex flex-col w-full h-96"
    >
      <ReactECharts option={chartDefinition} />
    </div>
  );
};

export default RadarComparison;
