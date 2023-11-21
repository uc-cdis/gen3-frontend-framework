import React, {useMemo} from 'react';
import {processLabel, truncateString} from '../utils';
import { ChartProps } from '../types';
import ReactECharts, { ReactEChartsProps} from './ReactECharts';
import { HistogramData, HistogramDataArray } from "@gen3/core";

interface BarChartData {
  data: number[];
  name: string;
  type: 'bar';
  stack: string;
  label: {
    show: boolean;
  };
}

const ExtractDataCount = (d:HistogramData, _:number | undefined = undefined) : number => d.count;
const ExtractDataPercent = (d:HistogramData, total?:number) : number => total? d.count / total : 0;

const processChartData = (
  facetData: HistogramDataArray,
  valueType = 'count',
  total?: number,
  maxBins = 100,
) : BarChartData[]  => {

  if (!facetData) {
    return [];
  }
  const data =facetData.filter((d:any) => d.key !== '_missing');

  const dataExtractor = valueType === 'count' ? ExtractDataCount : ExtractDataPercent;

  const results = data.slice(0, maxBins)
    .map((d:any) => ({ // TODO: fix type of d
      data: [dataExtractor(d, total)] as number[],
      name: truncateString(processLabel(d.key), 35),
      type: 'bar' as const,
      stack: 'value',
      label: {
        show: true
      },
    }));
  return results;
};

const HorizontalBarChart  = ({ data, valueType, total } : ChartProps) => {
  const chartData = processChartData(data, valueType, total);

  const chartDefinition = useMemo(() : ReactEChartsProps['option'] => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          // Use axis to trigger tooltip
          type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
        }
      },
      legend: {
        orient: 'vertical',
        left: '75%',
      },
      grid: {
        left: '0%',
        right: '30%',
        bottom: '25%',
        containLabel: true,
        height: '50%',
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: ['']
      },
      series: chartData,

    }; }, [chartData]);

  return (
    <div className="w-full h-64">
      <ReactECharts option={chartDefinition} />
    </div>
  );
};

export default HorizontalBarChart;
