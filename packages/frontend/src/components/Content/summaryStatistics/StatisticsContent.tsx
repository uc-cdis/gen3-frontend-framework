import React, { useMemo } from 'react';
import StatisticsHeader from './StatisticsHeader';
import {
  Accessibility,
  EmptyFilterSet,
  fieldNameToLabel,
  QueryAggsParams,
  useGetGetMultiIndexAggregationQuery,
} from '@gen3/core';
import { StatisticsElement, SummaryStatisticConfiguration } from './types';
import { LoadingOverlay } from '@mantine/core';
import { convertToMultiTrackChartData } from '../utils';
import type { StatisticsCellInfo } from './StatisticsCell';
import StatisticsRow from './StatisticsRow';
import { labelToPlural } from '../../../utils/labels';

const StatisticsContent = ({
  title,
  subtitle,
  elements,
}: SummaryStatisticConfiguration) => {
  const indexAndFields = Object.keys(elements).reduce(
    (acc: Array<QueryAggsParams>, key) => {
      const fields = elements[key].map((x: StatisticsElement) => x.field);

      acc.push({
        type: key,
        filters: EmptyFilterSet,
        fields,
      });
      return acc;
    },
    [] as Array<QueryAggsParams>,
  );

  const { data, isFetching, isError } = useGetGetMultiIndexAggregationQuery({
    indexAndFields: indexAndFields,
    accessibility: Accessibility.ALL,
  });

  const chartData = useMemo(() => convertToMultiTrackChartData(data), [data]);

  const statsInfo: Array<StatisticsCellInfo> = Object.keys(elements).reduce(
    (acc, key) => {
      if (elements[key].length === 0) {
        return acc;
      }

      const s = elements[key].reduce((acc, x) => {
        if (!x?.type || x?.type === 'chart') {
          return acc;
        }

        acc.push({
          label: x.label ?? fieldNameToLabel(x.field),
          value: data?.[key]?.[x.field]?.totalCount ?? 0,
          unit: labelToPlural(x?.unit ?? key),
        });

        return acc;
      }, [] as Array<StatisticsCellInfo>);

      acc.push(...s);
      return acc;
    },
    [] as Array<StatisticsCellInfo>,
  );

  console.log(data);

  return (
    <div className="w-100 flex-col">
      <LoadingOverlay visible={isFetching} />
      <StatisticsHeader title={title} subtitle={subtitle} />
      {isError && <div>Error fetching data</div>}
      {chartData.length === 0 && <div>No data available</div>}
      {statsInfo.length > 0 && <StatisticsRow stats={statsInfo} />}
    </div>
  );
};

export default StatisticsContent;
