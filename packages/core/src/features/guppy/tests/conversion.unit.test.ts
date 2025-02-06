import { flattenJson } from '../conversion';
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
