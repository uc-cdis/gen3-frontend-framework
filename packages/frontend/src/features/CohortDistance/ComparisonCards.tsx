import React from 'react';
import { Grid } from '@mantine/core';
import { AggregationsData } from '@gen3/core';
import { DistanceChart, GroundWithComparisonDatasets } from './types';
import { computeRowSpan } from '../../components/charts';
import ComparisonCard from './ComnparisonCard';
import comparisonCharts from './charts/ComparisonCharts';

interface ComparisonCardssProps {
  ground: AggregationsData;
  groundLabel: string;
  comparison: AggregationsData;
  comparisonLabel: string;
  comparisonChartsConfig: Record<string, DistanceChart>;
  numberOfColumns?: number;
  style?: 'tile' | 'box';
}

const ComparisonCharts: React.FC<ComparisonCardssProps> = ({
  ground,
  groundLabel,
  comparison,
  comparisonLabel,
  comparisonChartsConfig,
  numberOfColumns = 2,
  style = 'tile',
}) => {
  const spans = computeRowSpan(
    Object.keys(comparisonChartsConfig).length,
    numberOfColumns,
  );
  return (
    <Grid className="w-full p-4">
      {Object.entries(comparisonChartsConfig).map(
        ([field, config], indexNum) => {
          return (
            <Grid.Col
              span={spans[indexNum]}
              key={`${indexNum}-charts-${field}-col`}
            >
              <ComparisonCard
                config={config}
                groundData={ground}
                groundLabel={groundLabel}
                comparisonData={comparison}
                comparisonLabel={comparisonLabel}
                field={field}
              />
            </Grid.Col>
          );
        },
      )}
    </Grid>
  );
};

export default ComparisonCharts;
