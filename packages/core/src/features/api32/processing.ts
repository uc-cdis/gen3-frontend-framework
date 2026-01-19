import { AggregationsData } from '../../types';

/**
 * Processes the histogram data from the given input object and returns an aggregated data object.
 *
 * @param {Record<string, unknown>} data - The input data object containing histogram information.
 * @returns {AggregationsData} An object containing the processed histogram data, structured as key-value pairs.
 */
export const processApiHistogramResponse = (
  data: Record<string, Array<{ value: string; count: number }>>,
): AggregationsData => {
  return Object.entries(data).reduce<AggregationsData>(
    (acc, [field, element]) => {
      acc[field] = element.map((x) => ({ key: x.value, count: x.count }));
      return acc;
    },
    {},
  );
};
