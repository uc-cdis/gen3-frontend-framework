import { AggregationsData, HistogramDataArray } from '@gen3/core';

export const convertToAggregateData = (
  data: Record<string, Record<string, Record<string, number>>>,
): Record<string, AggregationsData> => {
  const result: Record<string, AggregationsData> = {};

  for (const [sourceKey, sourceValue] of Object.entries(data)) {
    const aggData: AggregationsData = {};

    for (const [aggKey, aggValue] of Object.entries(sourceValue)) {
      const histogramDataArray: HistogramDataArray = [];

      for (const [key, count] of Object.entries(aggValue)) {
        histogramDataArray.push({ key, count });
      }

      aggData[aggKey] = histogramDataArray;
    }

    result[sourceKey] = aggData;
  }

  return result;
};
