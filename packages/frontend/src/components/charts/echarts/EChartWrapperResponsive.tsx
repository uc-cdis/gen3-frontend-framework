import React, { useEffect, useState } from 'react';
import { ECharts, EChartsOption, init } from 'echarts';
import { useDeepCompareEffect } from 'use-deep-compare';
import { useResizeObserver } from '@mantine/hooks';

export interface EChartWrapperResponsiveProps {
  readonly option: EChartsOption;
  readonly style?: React.CSSProperties;
  readonly onDimensionsChange?: (dimensions: {
    width: number;
    height: number;
  }) => void;
}

const EChartWrapperResponsive: React.FC<EChartWrapperResponsiveProps> = ({
  option,
  style,
  onDimensionsChange,
}: EChartWrapperResponsiveProps) => {
  //  const containerRef = useRef<HTMLDivElement>(null);
  const [chartRoot, setChartRoot] = useState<ECharts | undefined>(undefined);
  const [containerRef, rect] = useResizeObserver();

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const chart = init(node, null, { renderer: 'svg' });
    setChartRoot(chart);

    return () => {
      chart.dispose();
    };
  }, []);

  useDeepCompareEffect(() => {
    if (chartRoot) {
      //  const chart = getInstanceByDom(chartInstanceRef.current);
      chartRoot?.setOption(option);
    }
  }, [option]);

  // handle resize
  useDeepCompareEffect(() => {
    if (chartRoot && rect.height && rect.width) {
      chartRoot.resize();
      if (onDimensionsChange)
        onDimensionsChange({ width: rect.width, height: rect.height });
    }
  }, [rect]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        aspectRatio: '4 / 3',
        ...style,
      }}
      role="img"
    />
  );
};

export default EChartWrapperResponsive;
