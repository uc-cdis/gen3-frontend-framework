import type { CSSProperties } from 'react';
import React, { JSX, useImperativeHandle, useState, useRef } from 'react';
import { useDeepCompareEffect } from 'use-deep-compare';
import type { ECharts, EChartsOption, SetOptionOpts } from 'echarts';
import { getInstanceByDom, init } from 'echarts';
import { useResizeObserver } from '@mantine/hooks';

export interface ReactEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: 'light' | 'dark' | 'gen3';
  events?: { [key: string]: (e: any) => void };
  ref?:  React.RefObject<ReactEChartsHandle | null>;
}

export interface ReactEChartsHandle {
  getEchartsInstance: () => ECharts | undefined;
  getContainerElement: () => HTMLDivElement | null;
}

const ReactECharts = (
  {
    option,
    style,
    settings,
    loading,
    theme = 'gen3',
    events,
    ref
  } : ReactEChartsProps ): JSX.Element => {
  const [chartRoot, setChartRoot] = useState<ECharts | undefined>(undefined);
  const [containerRef, rect] = useResizeObserver<HTMLDivElement>();
  const chartRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getEchartsInstance: () => {
      if (chartRef.current) {
        return getInstanceByDom(chartRef.current);
      }
      return undefined;
    },
    getContainerElement: () => chartRef.current,
  }));

  useDeepCompareEffect(() => {
    let chart: ECharts | undefined;
    if (chartRoot === undefined && chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    }
    setChartRoot(chart);
  }, [theme]);

  useDeepCompareEffect(() => {
    // Update chart if theme, options, or settings change
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart?.setOption(option, settings);
    }
  }, [option, settings, theme]);

  useDeepCompareEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      loading === true ? chart?.showLoading() : chart?.hideLoading();

      // Bind events
      if (events) {
        Object.keys(events).forEach((eventName) => {
          chart?.off(eventName);
          chart?.on(eventName, events[eventName]);
        });
      }
    }
  }, [loading]);

  useDeepCompareEffect(() => {
    if (chartRoot && rect.height && rect.width) {
      chartRoot.resize();
    }
  }, [rect]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <div
        style={{ width: '100%', height: '100%', ...style }}
        role="figure"
        aria-label="Data Chart"
        ref={chartRef}
      />
    </div>
  );
};

export default ReactECharts;
