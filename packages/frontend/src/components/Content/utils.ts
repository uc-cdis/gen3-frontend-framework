import { MultiIndexFieldAggregationResponse } from '@gen3/core';
import { MultiTrackChartData } from '../charts';

export const convertToMultiTrackChartData = (
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
