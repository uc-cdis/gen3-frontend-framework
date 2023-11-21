
import {
  fieldNameToTitle,
  AggregationsData
} from '@gen3/core';
import { MdClose as CloseIcon } from 'react-icons/md';
import { ActionIcon, Card, Grid, Group, Text,  LoadingOverlay } from '@mantine/core';
import {createChart} from './createChart';
import { SummaryChart } from './types';

export type ChartDataConverter = (
  data: Record<string, number>
) => Record<string, number>;

interface ChartsProps {
  index: string;
  charts: Record<string, SummaryChart>
  counts?: number;
  data: AggregationsData;
    isSuccess: boolean;
    isError?: boolean;
}

const Charts = ({ index, charts, data, counts,  isSuccess }: ChartsProps) => {
  console.log("Charts", index, charts, data, counts, isSuccess);
  return (
    <Grid>
      {data &&  Object.keys(charts).map((field) => (
        <Grid.Col span="auto" key={`${index}-charts-${field}-col`}>
          <Card shadow={'md'}>
            <Card.Section inheritPadding py="xs">
              <Group position="apart">
                <Text weight={500}>{charts[field].title ?? fieldNameToTitle(field)}</Text>
                    <ActionIcon>
                      <CloseIcon size="1rem" />
                    </ActionIcon>
              </Group>
            </Card.Section>
          <LoadingOverlay visible={!isSuccess} />
            { createChart(charts[field].chartType, {
                data: data===undefined ? [] : data[field],
                total: counts ?? 1,
                valueType: charts[field].valueType ?? 'count',
            }
            )}
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default Charts;
