import React from 'react';
import { createChart } from '../charts/createChart';
import { ChartProps } from '../charts';
import {
  EmptyFilterSet,
  HistogramDataArray,
  useGetGetMultiIndexAggregationQuery,
} from '@gen3/core';
import { LoadingOverlay } from '@mantine/core';
import { ErrorCard } from '../../index';

interface ChartContentProps {
  chartType?: string;
  parameters?: Record<string, any>;
  width?: string;
}

const ChartContent = ({ chartType, parameters }: ChartContentProps) => {
  const chart: ChartProps = parameters?.chart;
  const dataFunctionParameters = parameters?.dataFetch;

  const processedDataFunctionParameters = dataFunctionParameters?.map(
    (props: any) => ({
      ...props,
      filters: EmptyFilterSet,
    }),
  );

  const { data, isFetching, isError } = useGetGetMultiIndexAggregationQuery(
    processedDataFunctionParameters,
    { skip: !processedDataFunctionParameters },
  );

  if (!chartType) {
    return <div>No chart type specified</div>;
  }

  if (isError) {
    return <ErrorCard message="Error fetching chart data" />;
  }

  const chartComponent = createChart(chartType, {
    data: data === undefined ? [] : (data as HistogramDataArray),
    total: 1,
    valueType: chart.valueType ?? 'count',
    label: chart.label,
    showLegendInChart: chart.showLegendInChart,
  });

  return (
    <div className="flex justify-center pt-2 items-center m-2">
      <LoadingOverlay visible={isFetching} />
      {chartComponent}
    </div>
  );
};

export default ChartContent;
