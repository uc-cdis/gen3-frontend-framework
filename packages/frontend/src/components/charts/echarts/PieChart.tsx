import React, { useMemo } from 'react';
import { processLabel, truncateString } from '../utils';
import ReactECharts, { ReactEChartsProps } from './ReactECharts';
import { ChartProps } from '../types';

interface PieChartData {
  value: number;
  name: string;
}

const processChartData = (
  facetData: Record<string, any>,
  maxBins = 100,
): PieChartData[] => {
  if (!facetData) {
    return [];
  }

  const data = facetData.filter((d: any) => d.key !== '_missing');

  const results = data.slice(0, maxBins).map((d: any) => ({
    value: d.count,
    name: truncateString(processLabel(d.key), 35),
  }));
  return results;
};

const PieChart = ({ data, label }: ChartProps) => {
  const chartDefinition = useMemo((): ReactEChartsProps['option'] => {
    return {
      emphasis: {
        label: {
          show: true,
          fontSize: '14',
        },
      },
      tooltip: {
        trigger: 'item',
      },
      legend: {
        top: '5%',
        left: 'center',
        height: '40%',
        type: 'scroll',
        orient: 'vertical',
      },
      series: [
        {
          type: 'pie',
          top: '45%',
          radius: '80%',
          data: processChartData(data),
          label: {
            show: false,
          },
        },
      ],
    };
  }, [data]);

  return (
    <div className="w-full h-64">
      <ReactECharts option={chartDefinition} />
    </div>
  );
};

export default PieChart;
