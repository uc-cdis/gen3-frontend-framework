import { capitalize, computeRowSpan } from '../utils';
import { SummaryChart } from '../types';

describe('capitalize', () => {
  // Should capitalize the first letter of each word in a string
  it('should capitalize the first letter of each word in a string', () => {
    const result = capitalize('hello world');
    expect(result).toBe('Hello World');
  });

  // Should return an empty string when given an empty string
  it('should return an empty string when given an empty string', () => {
    const result = capitalize('');
    expect(result).toBe('');
  });

  // Should throw an error when given undefined
  it('should throw an error when given undefined', () => {
    expect(() => {
      // need to ignore this error because we are testing the error
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      capitalize(undefined);
    }).toThrowError('capitalize: original is undefined');
  });

  // Should handle strings with only spaces
  it('should handle strings with only spaces', () => {
    const result = capitalize('   ');
    expect(result).toBe('   ');
  });
});

describe('computeRowSpan', () => {
  it('computes the correct row span', () => {
    const charts: Record<string, SummaryChart> = {
      chart1: { title: 'Chart 1', chartType: 'bar' },
      chart2: { title: 'Chart 2', chartType: 'line', valueType: 'count' },
      chart3: { title: 'Chart 3', chartType: 'pie', valueType: 'percent' },
    };

    const numCols = 2;

    const expectedRowSpan = [6, 6, 12];

    expect(computeRowSpan(charts, numCols)).toEqual(expectedRowSpan);
  });

  it('handles edge case where number of charts is divisible by number of columns', () => {
    const charts: Record<string, SummaryChart> = {
      chart1: { title: 'Chart 1', chartType: 'bar' },
      chart2: { title: 'Chart 2', chartType: 'line', valueType: 'count' },
    };

    const numCols = 2;

    const expectedRowSpan = [6, 6];

    expect(computeRowSpan(charts, numCols)).toEqual(expectedRowSpan);
  });
});
