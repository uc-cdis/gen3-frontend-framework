import React, { useRef, useState } from 'react';
import { useDeepCompareEffect } from 'use-deep-compare';
import { init, getInstanceByDom } from 'echarts';
import type { CSSProperties } from 'react';
import type { EChartsOption, ECharts, SetOptionOpts } from 'echarts';
import { useResizeObserver } from '@mantine/hooks';

export interface ReactEChartsProps {
  option: EChartsOption;
  style?: CSSProperties;
  settings?: SetOptionOpts;
  loading?: boolean;
  theme?: 'light' | 'dark';
}

const ReactECharts = ({
  option,
  style,
  settings,
  loading,
  theme,
}: ReactEChartsProps): JSX.Element => {
  const [chartRoot, setChartRoot] = useState<ECharts | undefined>(undefined);
  const [chartRef, rect] = useResizeObserver();
  useDeepCompareEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      chart = init(chartRef.current, theme);
    }
    setChartRoot(chart);
  }, [theme]);

  useDeepCompareEffect(() => {
    // Update chart
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
    }
  }, [loading]);

  useDeepCompareEffect(() => {
    chartRoot?.resize();
  }, [rect]);

  return (
    <div ref={chartRef} style={{ width: '100%', height: '100%', ...style }} />
  );
};

export default ReactECharts;
