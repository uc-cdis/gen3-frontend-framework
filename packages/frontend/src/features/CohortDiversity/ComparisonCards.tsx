import React from 'react';
import { Grid } from '@mantine/core';
import { AggregationsData } from '@gen3/core';
import { DiversityChart, GroundWithComparisonDatasets } from './types';
import { computeRowSpan } from '../../components/charts';
import ComparisonCard from './ComnparisonCard';

interface ComparisonCardssProps {
  data: Record<string, AggregationsData>;
  datasets: GroundWithComparisonDatasets;
  comparisonChartsConfig: Record<string, DiversityChart>;
  numColumns?: number;
  style?: 'tile' | 'box';
}

const ComparisonCharts: React.FC<ComparisonCardssProps> = ({
  data,
  datasets,
  comparisonChartsConfig,
  numColumns = 2,
  style = 'tile',
}) => {
  const ground = data[datasets.ground.dataset];
  const groundTitle = datasets.ground.label;
  const comparison = data[datasets.comparison[0].dataset];
  const comparisonTitle = datasets.comparison[0].label;

  const spans = computeRowSpan(
    Object.keys(comparisonChartsConfig).length,
    numColumns,
  );
  return (
    <Grid className="w-full">
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
                groundLabel={groundTitle}
                comparisonData={comparison}
                comparisonLabel={comparisonTitle}
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
