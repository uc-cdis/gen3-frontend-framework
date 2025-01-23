import { getNextSize, formatDate } from '../utils';
import '@jest/globals';

// Start test suite
describe('FormatDate Function', () => {
  it('should format a date string correctly', () => {
    const inputDate = '2024-01-01T12:30:45Z';
    const expectedFormat = 'Jan-1-2024 12:30:45';
    expect(formatDate(inputDate)).toEqual(expectedFormat);
  });

  it('should throw an error when an invalid date string is supplied', () => {
    const invalidDate = 'This is not a date string';
    expect(() => {
      formatDate(invalidDate);
    }).toThrowError(new Error('Invalid date string'));
  });
});

describe('getNextSize function', () => {
  it('should return the value of the next size', () => {
    const sizeMap = {
      small: 5,
      medium: 10,
      large: 15,
    };

    expect(getNextSize<number>('small', sizeMap)).toBe(10);
  });

  it('should return the value of the first size if the current size is not found', () => {
    const sizeMap = {
      small: 5,
      medium: 10,
      large: 15,
    };

    expect(getNextSize<number>('default', sizeMap)).toBe(5);
  });

  it('should return the value of the last size if the current size is the last', () => {
    const sizeMap = {
      small: 5,
      medium: 10,
      large: 15,
    };

    expect(getNextSize<number>('large', sizeMap)).toBe(15);
  });
});
