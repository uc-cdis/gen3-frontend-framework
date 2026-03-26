import React from 'react';
import { processLabel, truncateString } from '../utils';
import { MultiTrackChartData, MultitrackChartProps } from '../types';
import ReactECharts, { ReactEChartsProps } from './ReactECharts';
import { fieldNameToLabel, HistogramData } from '@gen3/core';
import {
  CallbackDataParams,
  GridOption,
  SeriesOption,
  XAXisOption,
  YAXisOption,
} from 'echarts/types/dist/shared';
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

interface ChartDefinition {
  xAxes: XAXisOption[];
  yAxes: YAXisOption[];
  grids: GridOption[];
  series: SeriesOption[];
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
  data: Array<MultiTrackChartData>,
  valueType = 'count',
  maxBins = 100,
): ChartDefinition => {
  if (!data || data.length === 0) {
    return {
      xAxes: [],
      yAxes: [],
      grids: [],
      series: [],
    };
  }
  // create x and y axis for each track

  const xAxes: XAXisOption[] = data.map(
    (g: MultiTrackChartData, idx: number) => ({
      id: `x${idx}`,
      type: 'value',
      min: 0,
      max: g.total,
      show: false, // only show tick labels on the first axis
      gridIndex: idx,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#222222', fontSize: 11 },
      splitLine: { lineStyle: { color: g.color } },
    }),
  );

  const yAxes: YAXisOption[] = data.map(
    (g: MultiTrackChartData, idx: number) => ({
      id: `y${idx}`,
      type: 'category',
      data: [truncateString(fieldNameToLabel(g.label), 35)],
      gridIndex: idx,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#000000',
        fontSize: 13,
        fontWeight: 'bold',
        margin: 12,
      },
      splitLine: { show: false },
    }),
  );

  const grids: GridOption[] = data.map(
    (g: MultiTrackChartData, idx: number) => ({
      left: 110,
      right: 24,
      top: 16 + idx * 56,
      height: 56,
    }),
  );

  // create a color palette for each track for 10 tracks
  const palette = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
  ];

  const dataExtractor =
    valueType === 'count' ? ExtractDataCount : ExtractDataPercent;

  const series = [] as SeriesOption[];
  data.forEach((g, gi) => {
    g.data.forEach((item, ki) => {
      series.push({
        name: truncateString(processLabel(item.key.toLocaleString()), 35),
        type: 'bar',
        stack: `stack${gi}`, // stacks within the same group only
        xAxisIndex: gi,
        yAxisIndex: gi,
        data: [dataExtractor(item, g.total)] as number[],
        itemStyle: { color: palette[ki] },
        barMaxWidth: 48,
        label: {
          show: true,
        },
      });
    });
  });

  return {
    xAxes,
    yAxes,
    grids,
    series,
  };
};

const MultiTrackHorizontalBarChart = ({
  data,
  valueType,
  total,
  showLegendInChart = true,
}: MultitrackChartProps) => {
  const { xAxes, yAxes, grids, series } = processChartData(
    data,
    valueType,
    total,
  );

  console.log('series: ', series);
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
        grid: grids,
        xAxis: xAxes,
        yAxis: yAxes,
        series: series as any,
      };
    }, [xAxes, yAxes, grids, series, showLegendInChart]);

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
