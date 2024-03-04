import React from 'react';
import { SummaryStatistics } from './types';
import StatisticRendererFactory from './StatisticsRendererFactory';

const BuildSummaryStatisticPanel = (summaries: SummaryStatistics = []) => {
  return summaries.map((summary) => {
    const { name, field, type } = summary;
    if (name && field && type) {
      // TODO replace 'default' with a real value
      const element = StatisticRendererFactory().getRenderer(
        'string',
        'default',
      );

      return ( element({
        value: summary.value ?? 'N/A',
        label: name,
        key: `stats-item-${name}-${field}-${type}`,
      }));
    }
  });
};

interface SummaryStatisticPanelProps {
  summaries: SummaryStatistics;
}

const SummaryStatisticPanel = ({ summaries }: SummaryStatisticPanelProps) => {
  return (
    <div className={`grid grid-cols-${summaries.length} grow shrink-0 divide-x-2 divide-accent`} >
      {BuildSummaryStatisticPanel(summaries)}
    </div>
  );
};

export default SummaryStatisticPanel;
