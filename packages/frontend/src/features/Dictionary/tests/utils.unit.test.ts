import data_dictionary from '../data/dictionary.json';
import { getPropertyCount, SnakeCaseToLabel } from '../utils';
import { describe, expect, test } from '@jest/globals';

// note the use of data_dictionary will change to a mock data dictionary at some point
// TODO create a mock data dictionary and use that instead of the real one

it('get total number of properties in data dictionary', () => {
  const result = getPropertyCount(
    [
      'data_file',
      'biospecimen',
      'medical_history',
      'administrative',
      'data_observations',
    ],
    data_dictionary,
  );
  expect(result).toEqual(1432);
});

describe('SnakeCaseToLabel function', () => {
  test("should return 'undefined' when input is not a string or is empty", () => {
    expect(SnakeCaseToLabel(undefined)).toBe('undefined');
    expect(SnakeCaseToLabel(123 as unknown as string)).toBe('undefined');
    expect(SnakeCaseToLabel('')).toBe('undefined');
  });

  test('should convert snake_case to label format', () => {
    expect(SnakeCaseToLabel('hello_world')).toBe('Hello World');
    expect(SnakeCaseToLabel('ILove_javascript')).toBe('ILove Javascript');
  });

  test('should handle leading/trailing/multiple underscores correctly', () => {
    expect(SnakeCaseToLabel('__hello__world__')).toBe('Hello World');
    expect(SnakeCaseToLabel('_____hello_world')).toBe('Hello World');
    expect(SnakeCaseToLabel('hello_______world')).toBe('Hello World');
    expect(SnakeCaseToLabel('hello_world_____')).toBe('Hello World');
  });
});
