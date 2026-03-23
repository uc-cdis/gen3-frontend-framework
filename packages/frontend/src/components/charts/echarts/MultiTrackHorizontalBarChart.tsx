import React from 'react';
import { processLabel, truncateString } from '../utils';
import { ChartProps } from '../types';
import ReactECharts, { ReactEChartsProps } from './ReactECharts';
import { HistogramData, HistogramDataArray } from '@gen3/core';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { isArray } from 'lodash';
import { useDeepCompareMemo } from 'use-deep-compare';

export interface BarChartData {
  data: number[];
  name: string;
  type: 'bar';
  stack: string;
  label: {
    show: boolean;
  };
}

interface MultiTrackHorizontalBarChartData {
  data: HistogramDataArray;
  color: string;
  label: string;
  total: number;
}

export interface MultitrackHorizontalBarChartProps extends Omit<
  ChartProps,
  'data'
> {
  data: MultiTrackHorizontalBarChartData;
  valueType?: 'count' | 'percent';
  showLegendInChart?: boolean;
  labelTruncation?: number;
  showXTicks?: boolean;
  showYTicks?: boolean;
  xLabel?: string;
  yLabel?: string;
  maxBins?: number;
}

const ExtractDataCount = (
  d: HistogramData,
  _: number | undefined = undefined,
): number => d.count;
const ExtractDataPercent = (d: HistogramData, total?: number): number =>
  total
    ? Math.round(((d.count / total) * 100.0 + Number.EPSILON) * 100) / 100
    : 0;

const processChartData = (
  facetData: HistogramDataArray,
  valueType = 'count',
  total?: number,
  maxBins = 100,
): BarChartData[] => {
  if (!facetData) {
    return [];
  }
  const data = facetData.filter((d: any) => d.key !== '_missing');

  const dataExtractor =
    valueType === 'count' ? ExtractDataCount : ExtractDataPercent;

  const results = data.slice(0, maxBins).map((d: any) => ({
    // TODO: fix type of d
    data: [dataExtractor(d, total)] as number[],
    name: truncateString(processLabel(d.key), 35),
    type: 'bar' as const,
    stack: 'value',
    label: {
      show: true,
      moveOverlap: true,
    },
  }));
  return results;
};

const MultiTrackHorizontalBarChart = ({
  data,
  valueType,
  total,
  showLegendInChart = true,
}: MultitrackHorizontalBarChartProps) => {
  const chartData = processChartData(data, valueType, total);

  const chartDefinition =
    useDeepCompareMemo((): ReactEChartsProps['option'] => {
      return {
        tooltip: {
          trigger: 'item',
          confine: true,
          formatter: function (param) {
            const p: CallbackDataParams =
              isArray(param) && param.length > 0
                ? param[0]
                : (param as CallbackDataParams);

            const colorSquare = `<span style="display:inline-block; width:10px; height:10px; background-color:${p.color}; margin-right:5px;"></span>`;
            return `${colorSquare}${p.seriesName}: <b>${p.value}</b>`;
          },
        },
        legend: {
          orient: 'vertical',
          left: '73%',
          type: 'scroll',
          right: 15,
          show: showLegendInChart,
        },
        grid: {
          left: '0%',
          right: showLegendInChart ? '30%' : '3%',
          bottom: '25%',
          containLabel: true,
          height: '50%',
        },
        xAxis: {
          type: 'value',
          max: 'dataMax',
          axisLine: {
            lineStyle: {
              color: '--mantine-color-base-9',
            },
          },
        },
        yAxis: {
          type: 'category',
          data: [''],
        },
        series: chartData,
      };
    }, [chartData, showLegendInChart]);

  return (
    <div className="w-full h-64">
      <ReactECharts
        option={chartDefinition}
        settings={{
          notMerge: true,
          lazyUpdate: false,
        }}
      />
    </div>
  );
};

export default MultiTrackHorizontalBarChart;
