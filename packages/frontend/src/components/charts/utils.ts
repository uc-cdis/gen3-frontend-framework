// import { BinGuru } from 'binguru';

import { SummaryChart } from './types';

export const capitalize = (original: string): string => {
  if (original === undefined) {
    throw new Error('capitalize: original is undefined');
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

export const processRangeKeyLabel = (key: [number, number]): string => {
  return `${key[0]}-${key[1]}`;
};

/**
 * Computes the row span for each item in the charts object.
 *
 * @param { Record<string, SummaryChart>} charts - The charts object containing summary charts.
 * @param {number} [numCols=3] - The number of columns per row.
 * @returns {number[]} - An array of row spans for each item in the charts object.
 */
export const computeRowSpan = (
  charts: Record<string, SummaryChart>,
  numCols = 3,
) => {
  const numItems = Object.keys(charts).length;
  // compute the number of rows
  const numRows = Math.ceil(numItems / numCols);
  // compute the row span for the last row
  const numLastRow = numItems % numCols;

  let spans = new Array(numItems - numLastRow).fill(Math.floor(12 / numCols));
  spans = spans.concat(new Array(numLastRow).fill(Math.floor(12 / numLastRow)));
  return spans;
};
