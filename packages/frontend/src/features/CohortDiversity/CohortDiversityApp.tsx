import React, { useMemo } from 'react';
import {
  Stack,
  Accordion,
  rem,
  LoadingOverlay,
  AccordionControlProps,
  Center,
  Text,
} from '@mantine/core';
import { FaChartPie as SummaryChartIcon } from 'react-icons/fa';
import { Charts } from '../../components/charts';
import { CohortDiversityConfig } from './types';
import ComparisonCards from './ComparisonCards';
import ErrorCard from '../../components/ErrorCard';
import { getStaticDiversityData } from './statistics/data/data';
import { AggregationsData, useGeneralGQLQuery } from '@gen3/core';
import { createDiversityQuery } from './statistics/queries';
import {
  processHistogramResponseAsPercentage,
  normalizeAgeOfIndex,
  alignData,
} from './statistics/data/utils';

const SummaryChartAccordionControl = (props: AccordionControlProps) => {
  return (
    <Center>
      <Accordion.Control {...props} />
    </Center>
  );
};

const CohortDiversityApp = (config: CohortDiversityConfig) => {
  const groundDataset = getStaticDiversityData(config.datasets.ground.dataset);

  const gqlQuery = createDiversityQuery(); // TODO: add field mapping

  const {
    data: rawComparisonDataset,
    isLoading: isComparisonLoading,
    isError: isComparisonError,
    isSuccess: isComparisonSuccess,
  } = useGeneralGQLQuery({
    query: gqlQuery.query,
    variables: JSON.parse(gqlQuery.variables),
  });

  const comparisonDataset = useMemo(() => {
    if (rawComparisonDataset) {
      const results = processHistogramResponseAsPercentage(
        rawComparisonDataset.data as Record<string, unknown>,
      );
      return alignData(normalizeAgeOfIndex(results), groundDataset);
    }

    return undefined;
  }, [groundDataset, rawComparisonDataset]);

  if (isComparisonError) {
    return <ErrorCard message={'Unable to get data'} />;
  }

  if (isComparisonLoading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <Stack classNames={{ root: 'w-full m-4 mb-2' }}>
      <Accordion variant="filled" chevronPosition="left">
        <Accordion.Item value="summaryCharts">
          <Accordion.Control>
            <div className="flex items-center justify-start space-x-2 text-accent">
              <SummaryChartIcon
                style={{
                  color: 'secondary.4',
                  width: rem(32),
                  height: rem(32),
                }}
              />
              <Text fw={600}>Summary Charts</Text>
            </div>
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
        comparison={(comparisonDataset as unknown as AggregationsData) ?? {}}
        comparisonLabel={config.datasets.comparison[0].label}
        comparisonChartsConfig={config.comparisonCharts}
        numberOfColumns={config?.numberOfColumns}
      />
    </Stack>
  );
};

export default CohortDiversityApp;
