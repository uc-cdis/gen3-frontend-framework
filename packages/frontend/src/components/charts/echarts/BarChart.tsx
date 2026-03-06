import React, { useCallback, useMemo, useRef } from 'react';
import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { processLabel, truncateString } from '../utils';
import { ChartProps } from '../types';
import ReactECharts, {
  ReactEChartsHandle,
  ReactEChartsProps,
} from './ReactECharts';
import { HistogramDataArray } from '@gen3/core';
import type { EChartsOption } from 'echarts';
import { graphic } from 'echarts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { isArray } from 'lodash';
import { filterMissing } from './utils';

interface BarChartData {
  value: number;
  name: string;
}

const processChartData = (
  facetData: HistogramDataArray,
  maxBins = 100,
  truncateLength = 35,
): BarChartData[] => {
  if (!facetData) {
    return [];
  }
  const data = filterMissing(facetData);

  if (data.length === 0) return [];

  // get max value in data

  let max = Math.max(...data.map((d: any) => d.count));
  if (max < 0) {
    max = 1;
  }

  const results = data.slice(0, maxBins).map((d: any) => {
    if (d.count >= 0)
      return {
        value: d.count,
        name: truncateString(processLabel(d.key), truncateLength),
      };

    // handle redacted data
    return {
      value: max,
      groupId: 'redacted',
      name: truncateString(processLabel(d.key), 35),
      itemStyle: {
        opacity: 0.5,
        color: new graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#0264ff00' },
          { offset: 1, color: '#0264ff' },
        ]),
        decal: {
          symbolSize: 1.15,
          dashArrayX: [2, 1],
          dashArrayY: [2, 1],
        },
      },
    };
  });
  return results;
};

const processAxis = (
  facetData: HistogramDataArray,
  maxBins = 100,
  truncateLength = 35,
  xAxisLabel: string | undefined = undefined,
  yAxisLabel: string | undefined = undefined,
  showXAxisTicks = true,
  showYAxisTicks = true,
  xLabelRotation = 0,
) => {
  const data = filterMissing(facetData);

  const categories = data
    .slice(0, maxBins)
    .map((d: any) => truncateString(processLabel(d.key), truncateLength));
  return {
    yAxis: [
      {
        type: 'value',
        name: yAxisLabel,
        axisTick: { show: showYAxisTicks },
        axisLine: { show: false },
        nameLocation: 'middle',
        nameGap: 35,
        nameRotate: 90,
      },
    ],
    xAxis: [
      {
        label: { show: !!xAxisLabel, name: xAxisLabel },
        type: 'category',
        data: categories,
        name: xAxisLabel,
        axisLabel: {
          rotate: xLabelRotation,
          width: 80,
          overflow: 'truncate', // 'truncate' | 'break' | 'breakAll'
          ellipsis: '...',
        },
        axisTick: { show: showXAxisTicks },
        axisLine: { show: false },
      },
    ],
  } as EChartsOption;
};

interface BarChartDownloadProps {
  /** Enable the download menu on the chart */
  enableDownload?: boolean;
  /** Base filename for downloads (without extension) */
  downloadFileName?: string;
}

const BarChart = ({
  data,
  maxBins = 100,
  labelTruncation = 35,
  showXTicks = false,
  showYTicks = true,
  xLabel = undefined,
  yLabel = undefined,
  color = undefined,
  xLabelRotation = 0,
  enableDownload = false,
  downloadFileName = 'bar-chart',
}: ChartProps & BarChartDownloadProps) => {
  const chartRef = useRef<ReactEChartsHandle>(null);

  const handleDownloadPNG = useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;

    const url = instance.getDataURL({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    });

    const a = document.createElement('a');
    a.href = url;
    a.download = `${downloadFileName}.png`;
    a.click();
  }, [downloadFileName]);

  const handleDownloadSVG = useCallback(() => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;

    const url = instance.getDataURL({
      type: 'svg',
      pixelRatio: 2,
      backgroundColor: '#fff',
    });

    const a = document.createElement('a');
    a.href = url;
    a.download = `${downloadFileName}.svg`;
    a.click();
  }, [downloadFileName]);

  const jsonData = useMemo(() => {
    if (!data) return [];
    return filterMissing(data).map((d: any) => ({
      label: processLabel(d.key),
      value: d.count,
    }));
  }, [data]);

  const chartDefinition = useMemo((): ReactEChartsProps['option'] => {
    return {
      grid: [
        {
          show: false,
          left: '9%',
          top: '5%',
          right: '1%',
          bottom: 7,
          containLabel: true,
        },
      ],
      tooltip: {
        trigger: 'item',
        formatter: function (param) {
          const p: CallbackDataParams =
            isArray(param) && param.length > 0
              ? param[0]
              : (param as CallbackDataParams);

          const colorSquare = `<span style="display:inline-block; width:10px; height:10px; background-color:${p.color}; margin-right:5px;"></span>`;

          if ((p.data as any).groupId === 'redacted')
            return `${p.name}: <b>hidden</b`;

          return `${colorSquare}${p.name}: <b>${p.value}</b>`;
        },
      },
      ...processAxis(
        data,
        maxBins,
        labelTruncation,
        xLabel,
        yLabel,
        showXTicks,
        showYTicks,
        xLabelRotation,
      ),
      series: [
        {
          type: 'bar',
          ...(color
            ? {
                itemStyle: {
                  color: color,
                },
                data: processChartData(data, maxBins, labelTruncation),
              }
            : {}),
        },
      ],
    };
  }, [
    color,
    data,
    labelTruncation,
    maxBins,
    showXTicks,
    showYTicks,
    xLabel,
    yLabel,
    xLabelRotation,
  ]);

  return (
    <div className="w-full h-64 relative">
      {enableDownload && (
        <div className="absolute top-0 right-0 z-10 mt--2">
          <Menu>
            <Menu.Target>
              <Tooltip label="Download image or data" withArrow position="left">
                <ActionIcon
                  variant="outline"
                  size="sm"
                  aria-label="Download chart"
                >
                  ⬇
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={handleDownloadPNG}>PNG</Menu.Item>
              <Menu.Item onClick={handleDownloadSVG}>SVG</Menu.Item>
              <Menu.Item
                component="a"
                href={`data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(jsonData, null, 2),
                )}`}
                download={`${downloadFileName}.json`}
              >
                JSON
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      )}
      <ReactECharts ref={chartRef} option={chartDefinition} />
    </div>
  );
};

export default BarChart;
