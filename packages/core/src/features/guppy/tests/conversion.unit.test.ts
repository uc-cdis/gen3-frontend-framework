import { flattenJson, flattenObject } from '../conversion';
import { JSONObject } from '../../../types';
import { describe, expect, it } from '@jest/globals';

describe('flattenJson function', () => {
  it('should flatten a deeply nested JSON object skipping the first level', () => {
    //mock the flatten function

    const mockJSONObject: JSONObject = {
      a: {
        b: { c: 3, d: 4 },
        e: [5, 6],
      },
      f: 'g',
    };

    const expectedResult: JSONObject[] = [
      {
        b_c: 3,
        b_d: 4,
        e_0: 5,
        e_1: 6,
      },
      {
        '0': 'g',
      },
    ];

    expect(flattenJson(mockJSONObject)).toEqual(expectedResult);
  });
});

describe('flattenObject function', () => {
  it('flattens nested objects and arrays with the delimiter', () => {
    expect(flattenObject({ a: { b: [1, { c: 2 }] }, d: 'x' })).toEqual({
      a_b_0: 1,
      a_b_1_c: 2,
      d: 'x',
    });
  });

  it('supports a custom delimiter', () => {
    expect(flattenObject({ a: { b: 1 } }, '.')).toEqual({ 'a.b': 1 });
  });

  it('keeps empty objects, arrays, null and undefined as values', () => {
    expect(flattenObject({ a: {}, b: [], c: null, d: undefined })).toEqual({
      a: {},
      b: [],
      c: null,
      d: undefined,
    });
  });

  it('keeps non-plain objects such as Date intact', () => {
    const date = new Date(0);
    expect(flattenObject({ a: date })).toEqual({ a: date });
  });

  it('returns an empty object for null, undefined and numbers', () => {
    expect(flattenObject(null)).toEqual({});
    expect(flattenObject(undefined)).toEqual({});
    expect(flattenObject(5)).toEqual({});
  });

  it('does not pollute Object.prototype via __proto__ keys', () => {
    const malicious = JSON.parse('{"__proto__":{"polluted":true},"a":1}');
    const result = flattenObject(malicious);
    expect(result).toEqual({ a: 1 });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
});
