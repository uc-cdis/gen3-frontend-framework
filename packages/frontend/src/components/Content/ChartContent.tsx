import React, { useMemo } from 'react';
import { createChart } from '../charts/createChart';
import { type ChartProps, type MultiTrackChartData } from '../charts';
import {
  Accessibility,
  EmptyFilterSet,
  MultiIndexFieldAggregationResponse,
  useGetGetMultiIndexAggregationQuery,
} from '@gen3/core';
import { LoadingOverlay } from '@mantine/core';
import { ErrorCard } from '../../index';

interface ChartContentProps {
  chartType?: string;
  parameters?: Record<string, any>;
  width?: string;
}

const convertToMultiTrackChartData = (
  data?: MultiIndexFieldAggregationResponse,
  colors?: string[],
): Array<MultiTrackChartData> => {
  if (!data) {
    return [];
  }

  const result: Array<MultiTrackChartData> = [];
  Object.keys(data).forEach((index) => {
    Object.keys(data[index]).forEach((field, idx) => {
      if (field === 'totalCount') return;
      result.push({
        data: data[index][field].histogram,
        label: field,
        color: colors?.[idx] ?? '#A200FF',
        total: data[index][field].totalCount,
      });
    });
  });
  return result;
};

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

  console.log('data', data, isFetching, isError);

  const chartData = useMemo(() => convertToMultiTrackChartData(data), [data]);

  console.log('chart data', chartData);
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
