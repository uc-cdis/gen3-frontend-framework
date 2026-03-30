import React from 'react';
import { Text } from '@mantine/core';

export interface StatisticsFooterProps {
  footerStats: { label: string; value: string }[];
}

const StatisticsFooter = ({ footerStats }: StatisticsFooterProps) => {
  return (
    <div
      className="grid border-x border-b border-neutral-200 dark:border-neutral-700 divide-x divide-neutral-200 dark:divide-neutral-700"
      style={{
        gridTemplateColumns: `repeat(${footerStats.length}, minmax(0, 1fr))`,
      }}
    >
      {footerStats.map((s) => (
        <div key={s.label} className="flex items-baseline gap-2 px-4 py-3">
          <Text className="text-lg font-light tracking-tight">{s.value}</Text>
          <Text className="text-[11px] font-light text-neutral-400">
            {s.label}
          </Text>
        </div>
      ))}
    </div>
  );
};

export default StatisticsFooter;
