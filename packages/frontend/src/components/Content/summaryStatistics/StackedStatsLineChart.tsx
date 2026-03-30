import React, { useEffect, useState } from 'react';
import { Text } from '@mantine/core';

export type LineChartData = { name: string; count: number; pct: number };

interface StackedLinesProps {
  data: LineChartData;
  index: number;
}

const StatsLineChart = ({ data, index }: StackedLinesProps) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(data.pct), 300 + index * 70);
    return () => clearTimeout(t);
  }, [data.pct, index]);

  return (
    <div className="flex items-center justify-between py-[5px] border-b border-base-lighter last:border-b-0">
      <Text className="font-mono text-[11px] text-base-light">{data.name}</Text>
      <div className="flex items-center gap-3">
        <div className="w-16 h-[2px] bg-base-max rounded-full overflow-hidden">
          <div
            className="h-full bg-base-dark rounded-full transition-all duration-[1400ms] ease-out"
            style={{ width: `${width}%` }}
          />
        </div>
        <Text className="font-mono text-[10px] text-base-light w-9 text-right">
          {data.count}
        </Text>
      </div>
    </div>
  );
};

export const StackedStatsLineChart = ({
  data,
  label,
}: {
  data: LineChartData[];
  label: string;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Text className="font-mono text-[11px] text-base-light">{label}</Text>
      {data.map((d, i) => (
        <StatsLineChart key={d.name} data={d} index={i} />
      ))}
    </div>
  );
};

export default StackedStatsLineChart;
