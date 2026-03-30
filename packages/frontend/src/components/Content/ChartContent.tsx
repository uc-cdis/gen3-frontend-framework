import React, { useMemo } from 'react';
import { createChart } from '../charts/createChart';
import { type ChartProps } from '../charts';
import {
  Accessibility,
  EmptyFilterSet,
  useGetGetMultiIndexAggregationQuery,
} from '@gen3/core';
import { LoadingOverlay } from '@mantine/core';
import { ErrorCard } from '../../index';
import { convertToMultiTrackChartData } from './utils';

interface ChartContentProps {
  chartType?: string;
  parameters?: Record<string, any>;
  width?: string;
}

const ChartContent = ({ chartType, parameters }: ChartContentProps) => {
  const chart: ChartProps = parameters?.chart;
  const dataFunctionParameters = parameters?.dataFetch;

  const processedDataFunctionParameters =
    dataFunctionParameters?.indexAndFields?.map((props: any) => ({
      ...props,
      filters: EmptyFilterSet,
    }));

  const { data, isFetching, isError } = useGetGetMultiIndexAggregationQuery(
    {
      indexAndFields: processedDataFunctionParameters,
      accessibility: dataFunctionParameters?.accessibility ?? Accessibility.ALL,
    },
    { skip: !processedDataFunctionParameters },
  );

  const chartData = useMemo(() => convertToMultiTrackChartData(data), [data]);

  const chartComponent = createChart(chartType ?? 'not set', {
    ...chart,
    data: chartData,
    total: 1,
  });

  if (!chartType) {
    return <div>No chart type specified</div>;
  }

  if (isError) {
    return <ErrorCard message="Error fetching chart data" />;
  }

  return (
    <div className="flex justify-center pt-2 items-center m-2">
      <LoadingOverlay visible={isFetching} />
      {chartComponent}
    </div>
  );
};

export default ChartContent;
