import React from 'react';

export interface StatisticsHeaderProps {
  title: string;
  subtitle?: string;
}

const StatisticsHeader = ({ title, subtitle }: StatisticsHeaderProps) => {
  return (
    <div className="mb-10">
      <h1 className="text-4xl font-light tracking-tight leading-[1.18] mb-3">
        {title}
      </h1>
      <p className="text-[13px] font-light text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-lg">
        {subtitle}
      </p>
    </div>
  );
};

export default StatisticsHeader;
