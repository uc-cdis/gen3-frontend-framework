import React, { useState } from 'react';
import { Accordion, Box, Center, Divider, Switch } from '@mantine/core';
import Charts from './Charts';
import { CollapsableChartsPanelConfiguration } from './types';
import { AggregationsData } from '@gen3/core';
import { ErrorCard } from '../../components/MessageCards';

interface ChartsPanelProps {
  config: CollapsableChartsPanelConfiguration;
  data?: AggregationsData;
  isFetching?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
}

const CollapsableCharts = ({ config, data }: ChartsPanelProps) => {
  const [showLegends, setShowLegends] = useState(config.showLegends?.enabled);

  if (!(config?.charts && Object.keys(config.charts).length > 0)) {
    return (
      <Center>
        <ErrorCard message="Charts Section not setup properly" />
      </Center>
    );
  }

  if (!data) return null;

  return (
    <Accordion
      unstyled
      classNames={{
        root: 'mb-4 bg-base-max w-full rounded-lg',
        control:
          'bg-secondary-lightest w-full px-4 py-2 rounded-lg data-active:rounded-b-none text-left group',
        label: 'pl-2 font-bold [text-shadow:_1px_0_#000]',
        chevron:
          'rounded-full bg-secondary-dark text-white inline-block align-middle group-data-[active]:rotate-180 transition-all',
        panel: 'py-4',
      }}
      chevronPosition="left"
      defaultValue="chartsAccordion"
    >
      <Accordion.Item value={'chartsAccordion'}>
        <Accordion.Control>{config.title || ''}</Accordion.Control>
        <Accordion.Panel>
          {config.showLegends?.enabled && config.showLegends?.showSwitch && (
            <React.Fragment>
              <Switch
                color="accent"
                labelPosition="left"
                label="Show legends"
                size="xs"
                px="md"
                checked={showLegends}
                onChange={(event) =>
                  setShowLegends(event.currentTarget.checked)
                }
              />
              <Divider my="sm" />
            </React.Fragment>
          )}
          <Box px="md">
            <Charts
              showLegends={showLegends}
              style="box"
              charts={config.charts}
              data={data}
              counts={2}
              isSuccess={true}
              numCols={4}
            />
          </Box>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

export default CollapsableCharts;
