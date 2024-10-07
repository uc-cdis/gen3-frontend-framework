import React, { useMemo } from 'react';
import * as echarts from 'echarts';
import { ReactECharts } from '../../../components/charts';
import { DatasetWithLabel } from './types';
import type { SeriesOption } from 'echarts';
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
      data: baseData.data.map((item) => roundTo2AfterDecimal(item.count)),
      emphasis: {
        focus: 'series',
      },
    },
    {
      name: comparisonData.label,
      type: 'bar',
      data: comparisonData.data.map((item) => roundTo2AfterDecimal(item.count)),
      emphasis: {
        focus: 'series',
      },
    },
  ];
};

interface DataItem {
  name: string;
  [key: string]: number | string;
}

const RadarComparison: React.FC = () => {
  const chartDefinition = useMemo(() => {
    const data: DataItem[] = [
      {
        name: 'Census',
        '0-4 Years': 6,
        '5-11 Years': 8.7,
        '12-15 Years': 5.1,
        '16-17 Years': 2.5,
        '18-29 Years': 16.4,
        '30-39 Years': 13.5,
        '40-49 Years': 12.3,
        '50-64 Years': 19.2,
        '65-74 Years': 9.6,
        '75-84 Years': 4.9,
        '85+ Years': 2,
      },
      {
        name: 'Study',
        '0-4 Years': 0.7702843814,
        '5-11 Years': 0.4176894181,
        '12-15 Years': 0.3295406773,
        '16-17 Years': 0.3295406773,
        '18-29 Years': 6.8023705231,
        '30-39 Years': 9.4020803103,
        '40-49 Years': 11.2721897503,
        '50-64 Years': 25.9889610654,
        '65-74 Years': 17.3029197575,
        '75-84 Years': 11.8539714398,
        '85+ Years': 15.5304519996,
      },
    ];

    const ageGroups = [
      '0-4 Years',
      '5-11 Years',
      '12-15 Years',
      '16-17 Years',
      '18-29 Years',
      '30-39 Years',
      '40-49 Years',
      '50-64 Years',
      '65-74 Years',
      '75-84 Years',
      '85+ Years',
    ];

    const option: echarts.EChartsOption = {
      title: {
        text: 'Cohort Diversity: Census vs Study',
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
