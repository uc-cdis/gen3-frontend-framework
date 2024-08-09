import { fieldNameToTitle, AggregationsData } from '@gen3/core';
//import { MdClose as CloseIcon } from 'react-icons/md';
//import { useDeepCompareMemo } from 'use-deep-compare';

import {
  // ActionIcon,
  Card,
  Grid,
  Group,
  Text,
  LoadingOverlay,
} from '@mantine/core';
import { createChart } from './createChart';
import { SummaryChart } from './types';

import { computeRowSpan } from './utils';

const DEFAULT_COLS = 3;

export type ChartDataConverter = (
  data: Record<string, number>,
) => Record<string, number>;

interface ChartsProps {
  index: string;
  charts: Record<string, SummaryChart>;
  counts?: number;
  data: AggregationsData;
  isSuccess: boolean;
  isError?: boolean;
  numCols?: number;
}

//The Charts component maps the data from ChartsProps into a grid of createChart() ReactNodes
const Charts = ({
  index,
  charts,
  data,
  counts,
  isSuccess,
  numCols = DEFAULT_COLS,
}: ChartsProps) => {
  const spans = computeRowSpan(charts, numCols);

  return (
    <Grid className="w-full mx-2">
      {data &&
        Object.keys(charts).map((field, index) => (
          <Grid.Col span={spans[index]} key={`${index}-charts-${field}-col`}>
            <Card shadow={'md'}>
              <Card.Section inheritPadding py="xs">
                <Group position="apart">
                  <Text weight={900}>
                    {charts[field].title ?? fieldNameToTitle(field)}
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
            </Card>
          </Grid.Col>
        ))}
    </Grid>
  );
};

export default Charts;
