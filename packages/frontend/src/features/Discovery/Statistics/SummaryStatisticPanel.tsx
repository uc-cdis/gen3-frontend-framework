import React from 'react';
import { SummaryStatistics } from './types';
import StatisticRendererFactory from './StatisticsRendererFactory';

// TODO remove this once stats are working
const SAMPLE_VALUES = [1023, 2392];

const BuildSummaryStatisticPanel = (summaries: SummaryStatistics = []) => {
  return summaries.map((summary) => {
    const { name, field, type } = summary;
    if (name && field && type) {
      // TODO replace 'default' with a real value
      const element = StatisticRendererFactory().getRenderer(
        'string',
        'default',
      );

      return element({
        value: summary.value ?? 'N/A',
        label: name,
        key: `stats-item-${name}-${field}-${type}`,
        className:
          summaries.length > 1
            ? 'px-5 border-accent-darker first:border-r-2 last:border-right-0'
            : 'px-5',
      });
    }
  });
};

interface SummaryStatisticPanelProps {
  summaries: SummaryStatistics;
}

const SummaryStatisticPanel = ({ summaries }: SummaryStatisticPanelProps) => {
  return (
    <div className="flex items-center">
      {BuildSummaryStatisticPanel(summaries)}
    </div>
  );
};

export default SummaryStatisticPanel;
