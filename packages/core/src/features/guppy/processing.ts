import { AggregationsData } from '../../types';
import { JSONPath } from 'jsonpath-plus';

/**
 * Processes the histogram data from the given input object and returns an aggregated data object.
 *
 * @param {Record<string, unknown>} data - The input data object containing histogram information.
 * @returns {AggregationsData} An object containing the processed histogram data, structured as key-value pairs.
 */
export const processHistogramResponse = (
  data: Record<string, unknown>,
): AggregationsData => {
  const valueData = JSONPath({
    json: data,
    path: '$..histogram',
    resultType: 'value',
  });

  const pointerData = JSONPath({
    json: data,
    path: '$..histogram',
    resultType: 'pointer',
  });

  const results = pointerData.reduce(
    (acc: AggregationsData, element: Record<string, any>, idx: number) => {
      const key = element
        .slice(1)
        .replace(/\/histogram/g, '')
        .replace(/\//g, '.');
      return {
        ...acc,
        [key]: valueData[idx],
      };
    },
    {} as AggregationsData,
  );
  return results as AggregationsData;
};

/**
 * Adjusts histogram data in the provided object by rounding counts below a specified minimum value.
 *
 * This function traverses the input object for histogram data and updates it such that all count values
 * falling below the defined `minValue` are set to `-1`. By default, the `minValue` is set to `100`.
 *
 * @param {Record<string, unknown>} origData - The original input data containing histogram structures to modify.
 * @param {number} [minValue=100] - The minimum value of histogram counts. Counts below this value are replaced with `-1`.
 * @returns {Record<string, unknown>} - A new object containing the modified histogram data while preserving other properties.
 */
export const roundHistogramResponse = (
  origData: Record<string, unknown>,
  minValue: number = 100,
): Record<string, unknown> => {
  const data = { ...origData };

  const pointerData = JSONPath({
    json: data,
    path: '$..histogram',
    resultType: 'pointer',
  });

  if (pointerData.length === 0) {
    return {};
  }

  pointerData.forEach((element: Record<string, any>) => {
    const key = element.slice(1).replace(/\//g, '.');
    const histogramData = JSONPath({
      json: data,
      path: key,
      resultType: 'value',
    });
    histogramData[0].forEach((x: any) => {
      x.count = x.count < minValue ? -1 : x.count;
    });
  });

  return data;
};
