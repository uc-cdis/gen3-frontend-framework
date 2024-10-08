import React from 'react';
import { AggregationsData, fieldNameToTitle } from '@gen3/core';
import { DiversityChart, GroundWithComparisonDatasets } from '../types';
import { Grid } from '@mantine/core';
import ChartCard from '../charts/ChartCard';
import { computeRowSpan } from '../../../components/charts';
import StatisticsCard from './StatisticsCard';

interface StatisticsPanelProps {
  data: Record<string, AggregationsData>;
  datasets: GroundWithComparisonDatasets;
  comparisonChartsConfig: Record<string, DiversityChart>;
  numColumns?: number;
  style?: 'tile' | 'box';
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  data,
  datasets,
  comparisonChartsConfig,
  numColumns = 2,
  style = 'tile',
}) => {
  const spans = computeRowSpan(
    Object.keys(comparisonChartsConfig).length,
    numColumns,
  );
  const ground = data[datasets.ground.dataset];
  const comparison = data[datasets.comparison[0].dataset];

  return (
    <Grid className="w-full">
      {Object.keys(comparisonChartsConfig).map((field, indexNum) => {
        return (
          <Grid.Col
            span={spans[indexNum]}
            key={`${indexNum}-charts-${field}-col`}
          >
            <StatisticsCard
              baseData={ground[field]}
              comparisonData={comparison[field]}
              title={fieldNameToTitle(field)}
            />
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export default StatisticsPanel;
