import React, { useState } from 'react';
import { ChartsSection } from '../types';
import { Accordion, Switch, Divider, Box } from '@mantine/core';
import { Charts } from '../../../components/charts';
import { SummaryChart } from '../../../components/charts/types';



const ChartsPanel = ({ config }: {config: ChartsSection}) => {
  const [showLegends, setShowLegends] = useState(config.showLegends?.enabled);
  if (!(config?.charts && config.charts.length > 0)) {
    console.error('Discovery Charts Section not setup properly');
    return;
  }
  const chartsProperties = () => {
    const chartDataTemp: Record<string, SummaryChart> = {};
    config?.charts?.forEach((chart, index)=>{
      chartDataTemp[`testName${index}`] = {//TODO use from data
        title: chart.title,
        chartType: chart.chartType,
        valueType: chart.valueType,
        dataLabels: chart.dataLabels //TODO get from code and not from setup
      };
    });
    return chartDataTemp;
  };
  return (
    <Accordion unstyled classNames={{
      root: 'mb-4 bg-base-max w-full rounded-lg',
      control: 'bg-secondary-lightest w-full px-4 py-2 rounded-lg data-active:rounded-b-none text-left group',
      label: 'pl-2 font-bold [text-shadow:_1px_0_#000]',
      chevron: 'rounded-full bg-secondary-dark text-white inline-block align-middle group-data-[active]:rotate-180 transition-all',
      panel: 'py-4'
    }}
    chevronPosition="left"
    defaultValue="chartsAccordion">
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
                onChange={(event) => setShowLegends(event.currentTarget.checked)}
              />
              <Divider my="sm"/>
            </React.Fragment>
          )}
          <Box px="md">
            <Charts
              showLegends={showLegends}
              style="box"
              index={'subjectsCharts'}
              charts={chartsProperties()}
              data={{
                'testName0':[{
                  key: 'a',
                  count: 11
                },
                {
                  key: 'b',
                  count: 9
                },
                {
                  key: 'c',
                  count: 3
                },
                {
                  key: 'd',
                  count: 1
                },
                {
                  key: 'e',
                  count: 0
                }],
                'testName1':[{
                  key: 'a',
                  count: 11
                },
                {
                  key: 'b',
                  count: 9
                },
                {
                  key: 'c',
                  count: 3
                }],
                'testName2':[{
                  key: 'a',
                  count: 11
                },
                {
                  key: 'b',
                  count: 9
                },
                {
                  key: 'c',
                  count: 3
                }],
                'testName3':[{
                  key: 'a',
                  count: 1
                },
                {
                  key: 'b',
                  count: 2
                },
                {
                  key: 'c',
                  count: 3
                },
                {
                  key: 'd',
                  count: 4
                },
                {
                  key: 'e',
                  count: 5
                },
                {
                  key: 'f',
                  count: 6
                },
                {
                  key: 'g',
                  count: 7
                },
                {
                  key: 'h',
                  count: 8
                },
                {
                  key: 'i',
                  count: 9
                },
                {
                  key: 'j',
                  count: 10
                },
                {
                  key: 'k',
                  count: 11
                }]
              }}
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

export default ChartsPanel;
