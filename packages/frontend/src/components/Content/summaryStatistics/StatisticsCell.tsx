import React, { useEffect, useState } from 'react';
import { Text } from '@mantine/core';

/** A single Statistics counter displayed in the top row. */
export interface StatisticsCellInfo {
  /** Short label shown above the number, e.g. "Total files" */
  label: string;
  /**
   * Raw numeric value used for the count-up animation.
   * Provide the actual number (e.g. 4_230_000), not a pre-formatted string.
   */
  value: number;
  /**
   * Optional custom formatter. Receives the current animated value and returns
   * the display string. Falls back to a compact K / M formatter when omitted.
   */
  format?: (n: number) => string;
  /** Subtitle beneath the number, e.g. "sequencing & imaging" */
  unit: string;
}

interface StatisticsCellProps {
  info: StatisticsCellInfo;
  index: number;
  total: number;
}

const compactFormat = (n: number): string =>
  n >= 1e6
    ? (n / 1e6).toFixed(1) + 'M'
    : n >= 1e3
      ? (n / 1e3).toFixed(0) + 'K'
      : n % 1 !== 0
        ? n.toFixed(1)
        : String(Math.round(n));

function useAnimatedCount(target: number, duration = 1600): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setValue(ease * target);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const StatisticsCell = ({ info, index, total }: StatisticsCellProps) => {
  const raw = useAnimatedCount(info.value, 1400 + index * 80);
  const fmt = info.format ?? compactFormat;

  return (
    <div
      className={[
        'flex flex-col gap-1 px-4 py-5',
        index < total - 1
          ? 'border-r border-neutral-200 dark:border-neutral-700'
          : '',
      ].join(' ')}
    >
      <Text className="font-mono text-[9px] tracking-widest uppercase text-base-contrast-darker">
        {info.label}
      </Text>
      <Text className="font-header text-3xl font-light tracking-tight leading-none text-base-contrast-darker">
        {fmt(raw)}
      </Text>
      <Text className="text-[11px] font-light text-base-contrast-lighter">
        {info.unit}
      </Text>
    </div>
  );
};

export default StatisticsCell;
