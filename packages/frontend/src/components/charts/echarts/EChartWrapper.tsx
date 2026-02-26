import React, { useState } from 'react';
import { ECharts, EChartsOption, init } from 'echarts';
import { useDeepCompareEffect } from 'use-deep-compare';
import { useResizeObserver } from '@mantine/hooks';

export interface EChartWrapperProps {
  readonly option: EChartsOption;
  readonly chartRef?: React.MutableRefObject<HTMLElement>;
  readonly height: number;
  readonly width: number;
}

const EChartWrapper: React.FC<EChartWrapperProps> = ({
  option,
  height,
  width,
}: EChartWrapperProps) => {
  const [chartRoot, setChartRoot] = useState<ECharts | undefined>(undefined);
  const [containerRef, rect] = useResizeObserver();

  useDeepCompareEffect(() => {
    let chart: ECharts | undefined;

    if (
      containerRef.current !== null &&
      containerRef?.current?.clientHeight !== 0 &&
      containerRef?.current?.clientWidth !== 0
    ) {
      chart = init(containerRef.current, null, {
        renderer: 'svg',
        height,
        width,
      });

      chart.setOption(option);
      chart.resize();
      setChartRoot(chart);
    }

    return () => {
      chart?.dispose();
    };
  }, [containerRef, height, width, option]);

  useDeepCompareEffect(() => {
    if (chartRoot && rect.height && rect.width) {
      chartRoot.resize();
    }
  }, [rect]);

  return (
    <div
      ref={containerRef}
      style={{ height, width, margin: '0 auto' }}
      role="img"
    />
  );
};

export default EChartWrapper;
