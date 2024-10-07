import React from 'react';
import { fieldNameToTitle, AggregationsData, HistogramDataArray } from '@gen3/core';
//import { MdClose as CloseIcon } from 'react-icons/md';
import { Icon } from '@iconify/react';
//import { useDeepCompareMemo } from 'use-deep-compare';

import { useDisclosure } from '@mantine/hooks';
import {
  // ActionIcon,
  Card,
  Grid,
  Group,
  Text,
  LoadingOverlay,
  Table,
  ColorSwatch,
  Modal,
  Button,
  useMantineTheme,
} from '@mantine/core';

import { createChart } from './createChart';
import { SummaryChart } from './types';

import { computeRowSpan } from './utils';

const DEFAULT_COLS = 3;
const MAX_LEGEND_ROWS = 4;

export type ChartDataConverter = (
  data: Record<string, number>,
) => Record<string, number>;

interface ChartsProps {
  charts: Record<string, SummaryChart>;
  counts?: number;
  data: AggregationsData;
  isSuccess: boolean;
  isError?: boolean;
  numCols?: number;
  style?: 'tile' | 'box';
  showLegends?: boolean;
}
//Colors grabbed from echarts src/model/globalDefault.ts
const chartColors = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc'
];

//The Charts component maps the data from ChartsProps into a grid of createChart() ReactNodes
const Charts = ({
  charts,
  data,
  counts,
  isSuccess,
  numCols = DEFAULT_COLS,
  style = 'tile',
  showLegends = false,
}: ChartsProps) => {
  const spans = computeRowSpan(charts, numCols);

  const chartCard = (field: string, indexNum: number) => {

    const LegendRows = ({ data }: { data:  HistogramDataArray }) => {
      const moreThanMaxRows = data.length > MAX_LEGEND_ROWS;
      const limitedRows = moreThanMaxRows ? data.slice(0,MAX_LEGEND_ROWS) : data;

      return limitedRows.map((element, elIndex) => (
        <Table.Tr key={elIndex}>
          <Table.Td><ColorSwatch className="inline-block mr-2 align-middle" size="1em" radius="xs" color={chartColors?.[elIndex % chartColors.length] || ''}/>{element.key}</Table.Td>
          <Table.Td className="text-right">{element.count}</Table.Td>
        </Table.Tr>
      ));
    };

    const LegendOverflow = ({ chart, data, chartTitle }: { chart: SummaryChart, data:  HistogramDataArray, chartTitle: string }) => {
      const [openedMoreRows, { open: openMoreRows, close: closeMoreRows }] = useDisclosure(false);
      const theme = useMantineTheme();
      return (
        <React.Fragment>
          <Modal opened={openedMoreRows} onClose={closeMoreRows} title={chartTitle} size="xl">
            <Grid>
              <Grid.Col span={6} key="modal-col-1">
                  {createChart(chart.chartType, {
                    data: data === undefined ? [] : data,
                    total: counts ?? 1,
                    valueType: chart.valueType ?? 'count',
                  })}
              </Grid.Col>
              <Grid.Col span={6} key="modal-col-2">
                <div className="border-solid border-[1px] border-[var(--mantine-color-gray-3)] h-full p-1">
                  <Table
                    withRowBorders={false}
                    classNames={{
                      table: '',
                      td: 'p-1 leading-3',
                    }}>
                    <Table.Tbody>
                      {data.map((element, elIndex) => (
                        <Table.Tr key={elIndex}>
                          <Table.Td><ColorSwatch className="inline-block mr-2 align-middle" size="1em" radius="xs" color={chartColors?.[elIndex % chartColors.length] || ''}/>{element.key}</Table.Td>
                          <Table.Td className="text-right">{element.count}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </Grid.Col>
            </Grid>
          </Modal>
          <Button variant="subtle" onClick={openMoreRows} leftSection={<Icon icon="gen3:open-in-modal" height={24} width={24} color={theme.colors.accent[5]}/>} className="text-black hover:text-black">{data.length - MAX_LEGEND_ROWS} more</Button>
        </React.Fragment>
      );
    };

    const dataKeys = Object.keys(data[field][0]);

    const chartTitle = charts[field].title ?? fieldNameToTitle(field);

    const moreThanMaxRows = data?.[field] && data[field].length > MAX_LEGEND_ROWS;

    return (<Grid.Col span={spans[indexNum]} key={`${index}-${indexNum}-charts-${field}-col`}>
      <Card shadow="md" withBorder={style === 'box'} className="h-full">
        <Card.Section inheritPadding py="xs" withBorder={style === 'box'}>
          <Group justify="space-between">
            <Text fw={900} className={`${style === 'box'?'font-bold [text-shadow:_1px_0_#000]':''}`}>
              {chartTitle}
            </Text>
            {/* // TODO: handle close/hide chart
            <ActionIcon>
              <CloseIcon size="1rem" />
            </ActionIcon>
             */}
          </Group>
        </Card.Section>
        <LoadingOverlay visible={!isSuccess} />
        {createChart(charts[field].chartType, {
          data: data === undefined ? [] : data[field],
          total: counts ?? 1,
          valueType: charts[field].valueType ?? 'count',
        })}
        {showLegends && (
        <Card.Section inheritPadding py="xs" withBorder={style === 'box'}>
          <Table
            withRowBorders={false}
            classNames={{
              td: 'p-1 leading-3',
              th: 'p-1 leading-3 [text-shadow:_1px_0_#000]',
              thead: 'border-b',
              tbody: 'before:content-[\'\'] before:block before:p-1',
            }}>
            <Table.Thead>
              <Table.Tr>
                {
                  dataKeys.map((el, i)=>(
                    <Table.Th className="last:text-right" key={i}>{charts[field]?.dataLabels?.[el] || <React.Fragment>&nbsp;</React.Fragment>}</Table.Th>
                  ))
                }
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data === undefined ? '' : <LegendRows data={data[field]}/>}
            </Table.Tbody>
          </Table>
        </Card.Section>)}
        {showLegends && moreThanMaxRows && (
        <Card.Section inheritPadding withBorder={style === 'box'} className="text-right p-1">
          <LegendOverflow chart={charts[field]} data={data[field]} chartTitle={chartTitle}/>
        </Card.Section>)}
      </Card>
    </Grid.Col>);
  };

  return (
    <Grid className="w-full">
      {data &&
        Object.keys(charts).map(chartCard)}
    </Grid>
  );
};

export default Charts;
