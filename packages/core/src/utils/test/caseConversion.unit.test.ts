// caseConversion.unit.test.ts
import { toCamelCase, toSnakeCase } from '../caseConversion';
import { expect } from '@jest/globals';

describe('toCamelCase', () => {
  it('should convert object keys to camelCase', () => {
    const input = {
      some_key: 'value',
      another_key: { nested_key: 'nestedValue' },
    };
    const expected = {
      someKey: 'value',
      anotherKey: { nestedKey: 'nestedValue' },
    };
    expect(toCamelCase(input)).toEqual(expected);
  });

  it('should handle arrays of objects and convert their keys to camelCase', () => {
    const input = [{ some_key: 'value' }, { another_key: 'value2' }];
    const expected = [{ someKey: 'value' }, { anotherKey: 'value2' }];
    expect(toCamelCase(input)).toEqual(expected);
  });

  it('should return primitive values as-is', () => {
    expect(toCamelCase(42)).toBe(42);
    expect(toCamelCase('string')).toBe('string');
    expect(toCamelCase(true)).toBe(true);
    expect(toCamelCase(null)).toBeNull();
  });

  it('should handle empty objects', () => {
    expect(toCamelCase({})).toEqual({});
  });

  it('should handle an empty array', () => {
    expect(toCamelCase([])).toEqual([]);
  });

  it('should leave already camelCased keys untouched', () => {
    const input = {
      camelCaseKey: 'value',
      anotherKey: { nestedCamelCase: 'nestedValue' },
    };
    expect(toCamelCase(input)).toEqual(input);
  });
});

describe('toSnakeCase', () => {
  it('should convert object keys to snake_case', () => {
    const input = { firstName: 'John', lastName: 'Doe' };
    const expected = { first_name: 'John', last_name: 'Doe' };
    expect(toSnakeCase(input)).toEqual(expected);
  });

  it('should convert nested object keys to snake_case', () => {
    const input = { userDetails: { firstName: 'John', lastName: 'Doe' } };
    const expected = { user_details: { first_name: 'John', last_name: 'Doe' } };
    expect(toSnakeCase(input)).toEqual(expected);
  });

  it('should convert array of objects keys to snake_case', () => {
    const input = [{ firstName: 'John' }, { lastName: 'Doe' }];
    const expected = [{ first_name: 'John' }, { last_name: 'Doe' }];
    expect(toSnakeCase(input)).toEqual(expected);
  });

  it('should handle non-object values without modification', () => {
    expect(toSnakeCase('string')).toBe('string');
    expect(toSnakeCase(42)).toBe(42);
    expect(toSnakeCase(null)).toBe(null);
    expect(toSnakeCase(undefined)).toBeUndefined();
    expect(toSnakeCase(true)).toBe(true);
  });

  it('should handle an empty object', () => {
    expect(toSnakeCase({})).toEqual({});
  });

  it('should handle an empty array', () => {
    expect(toSnakeCase([])).toEqual([]);
  });
});
