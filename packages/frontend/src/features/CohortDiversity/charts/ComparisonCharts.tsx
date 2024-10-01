import React, { useEffect, useState } from 'react';
import { Stack } from '@mantine/core';
import { AggregationsData, fieldNameToTitle } from '@gen3/core';
import { DiversityChart, GroundWithComparisonDatasets } from '../types';
import DiversityChartsFactory from './diversityChartsFactory';

DiversityChartsFactory();

const createCharts = (
  data: Record<string, AggregationsData>,
  datasets: GroundWithComparisonDatasets,
  comparisonChartsConfig: Record<string, DiversityChart>,
) => {
  const ground = data[datasets.ground.dataset];
  const groundTitle = datasets.ground.label;
  const comparison = data[datasets.comparison[0].dataset];
  const comparisonTitle = datasets.comparison[0].label;

  const charts = Object.entries(comparisonChartsConfig).map(
    ([field, config]) => {
      const chart = DiversityChartsFactory().getRenderer(
        'comparison',
        config.chartType,
      );
      return chart({
        baseDataset: { data: ground[field], label: groundTitle },
        comparisonDataset: { data: comparison[field], label: comparisonTitle },
        title: fieldNameToTitle(field),
      });
    },
  );

  return charts;
};

interface ComparisonChartsProps {
  data: Record<string, AggregationsData>;
  datasets: GroundWithComparisonDatasets;
  comparisonChartsConfig: Record<string, DiversityChart>;
}

const ComparisonCharts: React.FC<ComparisonChartsProps> = ({
  data,
  datasets,
  comparisonChartsConfig,
}) => {
  return <Stack>{createCharts(data, datasets, comparisonChartsConfig)}</Stack>;
};

export default ComparisonCharts;
