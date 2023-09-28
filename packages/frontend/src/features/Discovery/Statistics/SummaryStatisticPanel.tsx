import React, { ReactNode } from 'react';
import { SummaryStatisticsConfig } from './types';
import StatisticRendererFactory from './StatisticsRendererFactory';

const BuildSummaryStatisticPanel = (
  aggregations: SummaryStatisticsConfig[] = [],
) => {
  return aggregations.map((aggregation) => {
    const { name, field, type } = aggregation;
    if (name && field && type) {
      // TODO replace 'default' with a real value
      const element = StatisticRendererFactory().getRenderer(
        'string',
        'default',
      );
      return element({
        value: 'test',
        label: name,
        key: `stats-item-${name}-${field}-${type}`,
        className:
          'px-5 border-accent-darker first:border-r-2 last:border-right-0',
      });
    }
  });
};

interface SummaryStatisticPanelProps {
  aggregations: SummaryStatisticsConfig[];
}

const SummaryStatisticPanel = ({
  aggregations,
}: SummaryStatisticPanelProps) => {
  return (
    <div className="flex items-center">
      {BuildSummaryStatisticPanel(aggregations)}
    </div>
  );
};

export default SummaryStatisticPanel;
