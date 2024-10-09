import React, { useState } from 'react';
import { DiversityChart } from './types';
import { AggregationsData, fieldNameToTitle } from '@gen3/core';
import { generateChart } from './charts/ChartCard';
import { Card, Group, SegmentedControl, Text } from '@mantine/core';
import StatisticsCard from './statistics/StatisticsCard';

interface ComparisonChartProps {
  style?: string;
  config: DiversityChart;
  groundData: AggregationsData;
  groundLabel: string;
  comparisonData: AggregationsData;
  comparisonLabel: string;
  field: string;
  chartType: string;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  config,
  groundData,
  groundLabel,
  comparisonData,
  comparisonLabel,
  field,
  chartType,
}) => {
  return generateChart(
    groundData,
    groundLabel,
    comparisonData,
    comparisonLabel,
    field,
    {
      ...config,
      chartType: chartType,
    },
    false,
  );
};

interface ComparisonCardProps {
  config: DiversityChart;
  groundData: AggregationsData;
  groundLabel: string;
  comparisonData: AggregationsData;
  comparisonLabel: string;
  field: string;
  style?: 'box' | 'tile';
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({
  config,
  groundData,
  groundLabel,
  comparisonData,
  comparisonLabel,
  field,
  style = 'box',
}) => {
  const [viewType, setViewType] = useState<string>(config.chartType);

  return (
    <Card shadow="xs" withBorder={style === 'box'} className="h-full">
      <Card.Section inheritPadding py="xs" withBorder={style === 'box'}>
        <Group justify="space-between">
          <Text fw={600}>{fieldNameToTitle(field)}</Text>
          <SegmentedControl
            value={viewType}
            onChange={setViewType}
            data={[
              { label: 'Bar', value: 'barComparison' },
              { label: 'Radar', value: 'radarComparison' },
              { label: 'Statistics', value: 'statisticsComparison' },
            ]}
          />
        </Group>
      </Card.Section>
      {viewType == 'statisticsComparison' ? (
        <div className="h-96 m-2">
          <StatisticsCard
            baseData={groundData[field]}
            comparisonData={comparisonData[field]}
          />
        </div>
      ) : (
        <ComparisonChart
          config={config}
          groundData={groundData}
          groundLabel={groundLabel}
          comparisonData={comparisonData}
          comparisonLabel={comparisonLabel}
          field={field}
          chartType={viewType}
        />
      )}
    </Card>
  );
};

export default ComparisonCard;
