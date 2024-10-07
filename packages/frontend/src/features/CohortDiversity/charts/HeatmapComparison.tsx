import React, { useMemo } from 'react';
import * as echarts from 'echarts';
import { ReactECharts } from '../../../components/charts';

interface DataItem {
  name: string;
  [key: string]: number | string;
}

const HeatmapComparison: React.FC = () => {
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

    const heatmapData = ageGroups.map((group, i) => {
      const diff = (data[1][group] as number) - (data[0][group] as number);
      return [1, i, diff];
    });

    const option: echarts.EChartsOption = {
      tooltip: {
        position: 'top',
        formatter: (params: any) => {
          const value = params.data[2];
          return `${params.name}<br>Difference: ${value.toFixed(2)}%`;
        },
      },
      grid: {
        height: '50%',
        top: '10%',
      },
      xAxis: {
        type: 'category',
        data: ['Census', 'Study'],
        splitArea: {
          show: true,
        },
      },
      yAxis: {
        type: 'category',
        data: ageGroups,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        min: -20,
        max: 20,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%',
        inRange: {
          color: ['#3060cf', '#ffffff', '#c1232b'],
        },
      },
      series: [
        {
          name: 'Cohort Diversity',
          type: 'heatmap',
          data: heatmapData,
          label: {
            show: true,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    return option;
  }, []);

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

export default HeatmapComparison;
