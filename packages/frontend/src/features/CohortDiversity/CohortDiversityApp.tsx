import React from 'react';
import { Stack, Accordion, rem } from '@mantine/core';
import { FaChartPie as SummaryChartIcon } from 'react-icons/fa';
import { Charts } from '../../components/charts';
import { getDiversityData } from './statistics/data/data';
import { CohortDiversityConfig } from './types';
import ComparisonCards from './ComparisonCards';
import StatisticsPanel from './statistics/StatisticsPanel';

const CohortDiversityApp = (config: CohortDiversityConfig) => {
  const diversityData = getDiversityData();

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
              data={diversityData[config.datasets.ground.dataset]}
              charts={config.charts}
              isSuccess={true}
              numCols={2}
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <ComparisonCards
        data={diversityData}
        comparisonChartsConfig={config.comparisonCharts}
        datasets={config.datasets}
      />
    </Stack>
  );
};

export default CohortDiversityApp;
