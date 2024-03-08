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

const columns = [
  'grid-cols-0',
  'grid-cols-1',
  'grid-cols-2',
  'grid-cols-3',
  'grid-cols-4',
  'grid-cols-5',
  'grid-cols-6',
  'grid-cols-7',
  'grid-cols-8',
  'grid-cols-9',
  'grid-cols-10',
];

const SummaryStatisticPanel = ({ summaries }: SummaryStatisticPanelProps) => {
  return (
    <div className={`grid ${columns[summaries.length]} grow shrink-0 divide-x-2 divide-accent`} >
      {BuildSummaryStatisticPanel(summaries)}
    </div>
  );
};

export default SummaryStatisticPanel;
