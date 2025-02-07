import React from 'react';
import { AggregationsData, fieldNameToTitle } from '@gen3/core';
import { DistanceChart, GroundWithComparisonDatasets } from '../types';
import { Card, Grid, Text } from '@mantine/core';
import { computeRowSpan } from '../../../components/charts';
import StatisticsCard from './StatisticsCard';

interface StatisticsPanelProps {
  data: Record<string, AggregationsData>;
  datasets: GroundWithComparisonDatasets;
  comparisonChartsConfig: Record<string, DistanceChart>;
  numColumns?: number;
  style?: 'tile' | 'box';
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({
  data,
  datasets,
  comparisonChartsConfig,
  numColumns = 2,
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
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Text size="lg" fw={700} mb="md">
                {fieldNameToTitle(field)}
              </Text>
              <StatisticsCard
                baseData={ground[field]}
                comparisonData={comparison[field]}
              />
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
};

export default StatisticsPanel;
