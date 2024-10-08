import { Card, Group, Text, SegmentedControl } from '@mantine/core';
import React, { useState, ReactNode } from 'react';
import { DiversityChart } from '../types';
import { AggregationsData, fieldNameToTitle } from '@gen3/core';
import DiversityChartsFactory, {
  DefaultComparisonChart,
} from './diversityChartsFactory';

DiversityChartsFactory();

const generateChart = (
  groundData: AggregationsData,
  groundLabel: string,
  comparisonData: AggregationsData,
  comparisonLabel: string,
  field: string,
  config: DiversityChart,
): ReactNode => {
  // Check if the field exists in the datasets
  if (!(field in groundData) || !(field in comparisonData)) {
    console.error(`Field ${field} does not exist in provided data.`);
    return <span>Error: Data field missing</span>;
  }

  const chartRenderer = DiversityChartsFactory().getRenderer(
    'comparison',
    config.chartType,
  );

  console.log(chartRenderer, config.chartType);

  // Check if renderer is the DefaultItemRenderer to log a warning
  if (chartRenderer === DefaultComparisonChart) {
    console.warn(
      `No specific renderer found for ${config.chartType}. Using default renderer.`,
    );
  }

  return chartRenderer({
    baseDataset: { data: groundData[field], label: groundLabel },
    comparisonDataset: { data: comparisonData[field], label: comparisonLabel },
    title: fieldNameToTitle(field),
  });
};

interface ChartCardProps {
  style: string;
  config: DiversityChart;
  groundData: AggregationsData;
  groundLabel: string;
  comparisonData: AggregationsData;
  comparisonLabel: string;
  field: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  style,
  config,
  groundData,
  groundLabel,
  comparisonData,
  comparisonLabel,
  field,
}) => {
  const [chartType, setChartType] = useState<string>(config.chartType);

  return (
    <Card shadow="md" withBorder={style === 'box'} className="h-full">
      <Card.Section inheritPadding py="xs" withBorder={style === 'box'}>
        <Group justify="space-between">
          <Text
            fw={900}
            className={`${style === 'box' ? 'font-bold [text-shadow:_1px_0_#000]' : ''}`}
          >
            {config.title}
          </Text>
          <SegmentedControl
            value={chartType}
            onChange={setChartType}
            data={[
              { label: 'Bar', value: 'barComparison' },
              { label: 'Radar', value: 'radarComparison' },
            ]}
          />
        </Group>
      </Card.Section>
      {generateChart(
        groundData,
        groundLabel,
        comparisonData,
        comparisonLabel,
        field,
        {
          ...config,
          chartType: chartType,
        },
      )}
    </Card>
  );
};

export default ChartCard;
