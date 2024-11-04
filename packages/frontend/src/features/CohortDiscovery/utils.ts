import { HistogramData } from '@gen3/core';
import { data } from 'autoprefixer';

export const EnumFacetToHistogramArray = (
  data?: Record<string, number>,
): Array<HistogramData> => {
  if (!data) return [];

  return Object.entries(data).reduce((acc, [key, count]) => {
    acc.push({ key, count });
    return acc;
  }, [] as Array<HistogramData>);
};
