import React, { useEffect, useState } from 'react';
import { Stack, Accordion, rem } from '@mantine/core';
import { FaChartPie as SummaryChartIcon } from 'react-icons/fa';
import { Charts } from '../../components/charts';
import { getDiversityData } from './statistics/data/data';
import { CohortDiversityConfig } from './types';
import ComparisonCharts from './charts/ComparisonCharts';

const CohortDiversityApp = (config: CohortDiversityConfig) => {
  const diversityData = getDiversityData();

  return (
    <Stack classNames={{ root: 'w-full border-1 border-gray-200' }}>
      <Accordion variant="contained">
        <Accordion.Item value="photos">
          <Accordion.Control
            icon={
              <SummaryChartIcon
                style={{
                  color: 'var(--mantine-color-red-6',
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
            />
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <ComparisonCharts
        data={diversityData}
        comparisonChartsConfig={config.comparisonCharts}
        datasets={config.datasets}
      />
    </Stack>
  );
};

export default CohortDiversityApp;
