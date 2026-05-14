import React, { useState, useRef } from 'react';
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
  const [containerRef, rect] = useResizeObserver<HTMLDivElement>();
  const chartRef = useRef<HTMLDivElement>(null);

  useDeepCompareEffect(() => {
    let chart: ECharts | undefined;

    if (
      containerRef !== null &&
      rect.height !== 0 &&
      rect.width !== 0
    ) {
      chart = init(chartRef.current, null, {
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
    <div ref={containerRef} style={{ height, width, margin: '0 auto' }}>
      <div
        ref={chartRef}
        role="img"
      />
    </div>
  );
};

export default EChartWrapper;
