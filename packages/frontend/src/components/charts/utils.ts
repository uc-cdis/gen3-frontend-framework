import { AggregationsData, HistogramData } from '@gen3/core';

export const capitalize = (original: string): string => {
  if (original === undefined) {
    console.warn('capitalize input is undefined');
    return '';
  }
  if (original.length === 0) {
    return original;
  }
  return original
    .split(' ')
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
};

export const truncateString = (str: string, n: number): string => {
  if (str.length > n) {
    return str.substring(0, n) + '...';
  } else {
    return str;
  }
};

// from https://stackoverflow.com/questions/33053310/remove-value-from-object-without-mutation
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const removeKey = (key: any, { [key]: _, ...rest }) => rest;

export const processLabel = (label: string): string => {
  return capitalize(label);
};

export const createLabelFromHistogramData = (
  histogramData: HistogramData,
): string => {
  if (typeof histogramData.key === 'string')
    return capitalize(histogramData.key);

  const [start, end] = histogramData.key;
  return `${start}-${end}`;
};

export const processRangeKeyLabel = (key: [number, number]): string => {
  return `${key[0]}-${key[1]}`;
};

/**
 * Computes the row span for each item in the charts object.
 *
 * @param { number } numItems - The charts object containing summary charts.
 * @param {number} [numCols=2] - The number of columns per row.
 * @returns {number[]} - An array of row spans for each item in the charts object.
 */
export const computeRowSpan = (
  numItems: number,
  numCols: number = 2,
): Array<number> => {
  // compute the row span for the last row
  const numLastRow = numItems % numCols;

  // oxlint-disable-next-line unicorn/no-new-array
  let spans = new Array(numItems - numLastRow).fill(Math.floor(12 / numCols));
  // oxlint-disable-next-line unicorn/no-new-array
  spans = spans.concat(new Array(numLastRow).fill(Math.floor(12 / numLastRow)));
  return spans;
};

/**
 * Filters the keys from the provided aggregation data based on a given list of keys to remove.
 *
 * This function processes an `AggregationsData` object by iterating through its properties.
 * It removes elements from the data that match any of the keys specified in the `keysToRemove` array.
 * The filtering applies specifically to elements with a valid `key` property of type == string.
 * If the `key` is empty or matches one of the `keysToRemove`, it is excluded from the resulting object.
 *
 * @param {AggregationsData} data - The aggregation data object to filter. Expected to have properties that
 *                                  are arrays of items containing a `key` property.
 * @param {Array<string>} keysToRemove - Array of string keys that should be removed from the aggregation data.
 * @returns {AggregationsData} A new `AggregationsData` object with filtered entries,
 *                             omitting the specified keys.
 */
export const filterAggregationsDataKeys = (
  data: AggregationsData,
  keysToRemove: Array<string>,
) => {
  if (!data || typeof data !== 'object') {
    return {} as AggregationsData;
  }

  return Object.entries(data).reduce(
    (acc: AggregationsData, [key, chartData]) => {
      if (Array.isArray(chartData)) {
        acc[key] = chartData.filter(
          (x) =>
            x && typeof x.key === 'string' && !keysToRemove.includes(x.key),
        );
      }
      return acc;
    },
    {} as AggregationsData,
  );
};
