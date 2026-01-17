import { AggregationsData, StatsData } from '../../types';

/**
 * Processes the histogram data from the given input object and returns an aggregated data object.
 *
 * @param {Record<string, unknown>} data - The input data object containing histogram information.
 * @returns {AggregationsData} An object containing the processed histogram data, structured as key-value pairs.
 */
export const processApiHistogramResponse = <
  T extends AggregationsData | StatsData,
>(
  data: Record<string, Array<{ value: string; count: number }>>,
): T => {
  const results = Object.entries(data).reduce((acc: T, [field, element]) => {
    acc[field] = [];
    element.forEach((x) => {
      acc[field] = [...acc[field], x];
    });
    return acc;
  }, {} as T);
  return results as T;
};
