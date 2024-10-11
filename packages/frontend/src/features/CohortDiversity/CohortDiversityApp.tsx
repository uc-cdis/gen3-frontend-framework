import React from 'react';
import { Stack, Accordion, rem, LoadingOverlay } from '@mantine/core';
import { FaChartPie as SummaryChartIcon } from 'react-icons/fa';
import { Charts } from '../../components/charts';
import { useGetDatasetQuery } from './diversityApi';
import { CohortDiversityConfig } from './types';
import ComparisonCards from './ComparisonCards';
import ErrorCard from '../../components/ErrorCard';

const CohortDiversityApp = (config: CohortDiversityConfig) => {
  const {
    data: groundDataset,
    isLoading: isGroundLoading,
    isError: isGroundError,
    isSuccess: isGroundSuccess,
  } = useGetDatasetQuery({ dataset: config.datasets.ground.dataset });

  const {
    data: comparisonDataset,
    isLoading: isComparisonLoading,
    isError: isComparisonError,
    isSuccess: isComparisonSuccess,
  } = useGetDatasetQuery({ dataset: config.datasets.comparison[0].dataset });

  if (isComparisonError || isGroundError) {
    return <ErrorCard message={'Unable to get data'} />;
  }

  if (isGroundLoading || isComparisonLoading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <Stack classNames={{ root: 'w-full border-1 border-gray-200 m-4' }}>
      <Accordion variant="contained">
        <Accordion.Item value="summaryCharts">
          <Accordion.Control
            icon={
              <SummaryChartIcon
                style={{
                  color: 'accent.4',
                  width: rem(20),
                  height: rem(20),
                }}
              />
            }
          >
            Summary Charts
          </Accordion.Control>
          <Accordion.Panel>
            <Charts
              data={groundDataset ?? {}}
              charts={config.charts}
              isSuccess={true}
              numCols={2}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <ComparisonCards
        ground={groundDataset ?? {}}
        groundLabel={config.datasets.ground.label}
        comparison={comparisonDataset ?? {}}
        comparisonLabel={config.datasets.comparison[0].label}
        comparisonChartsConfig={config.comparisonCharts}
        numberOfColumns={config?.numberOfColumns}
      />
    </Stack>
  );
};

export default CohortDiversityApp;
