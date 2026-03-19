import React, { useCallback, useMemo, useRef } from 'react';
import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { processLabel } from '../utils';
import { ChartProps } from '../types';
import ReactECharts, {
  ReactEChartsHandle,
  ReactEChartsProps,
} from './ReactECharts';
import { HistogramDataArray } from '@gen3/core';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { isArray } from 'lodash';
import { filterMissing } from './utils';
import { ErrorCard } from '../../../index';
import { processAxis, processChartData } from './BarChart';

interface ComparisonBarChartProps extends Omit<ChartProps, 'data' | 'color'> {
  data: Array<HistogramDataArray>;
  labels: string[];
  colors?: string[];
}

interface BarChartDownloadProps {
  /** Enable the download menu on the chart */
  enableDownload?: boolean;
  /** Base filename for downloads (without extension) */
  downloadFileName?: string;
}

const ComparisonBarChart = ({
  data,
  labels,
  colors,
  maxBins = 100,
  labelTruncation = 35,
  showXTicks = false,
  showYTicks = true,
  xLabel = undefined,
  yLabel = undefined,
  xLabelRotation = 0,
  enableDownload = false,
  downloadFileName = 'bar-chart',
}: ComparisonBarChartProps & BarChartDownloadProps) => {
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
        data[0],
        maxBins,
        labelTruncation,
        xLabel,
        yLabel,
        showXTicks,
        showYTicks,
        xLabelRotation,
      ),
      series: data.map((d: HistogramDataArray, i: number) => ({
        name: labels[i],
        type: 'bar',
        itemStyle: {
          color: colors ? colors[i] : undefined,
        },
        data: processChartData(d, maxBins, labelTruncation),
      })),
    };
  }, [
    colors,
    data,
    labelTruncation,
    maxBins,
    showXTicks,
    showYTicks,
    xLabel,
    yLabel,
    xLabelRotation,
  ]);

  if (!data || data.length === 0)
    return <ErrorCard message="No data available" />;

  if (data.length !== labels.length)
    throw new Error(
      'ComparisonBarChart: data and labels must be arrays of the same length',
    );

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

export default ComparisonBarChart;
