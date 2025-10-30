// write unit test for buildNestedCountsQuery
const cleanString = (str: string) => {
  return str.replace(/\s/g, ''); // The \s matches any whitespace character, and g ensures all occurrences are replaced.
};

import {
  buildAliasedNestedCountsQuery,
  buildRangeFilters,
  buildRangeQuery,
} from '../range';

const createParams = (field: string, rangeName: string = 'range_0') => {
  return {
    type: 'case',
    field,
    rangeName,
  };
};

describe('build range queries', () => {
  it('should build a query with all parameters', () => {
    const params = createParams('data_type');
    const result = buildAliasedNestedCountsQuery(params);
    expect(cleanString(result)).toContain(
      cleanString(
        'range_0 : case (accessibility: $accessibility filter: $range_0) { data_type { histogram { count } } }',
      ),
    );
  });

  it('should build a query with nested values with all parameters', () => {
    const params = createParams('demographic.race');

    const result = buildAliasedNestedCountsQuery(params);
    expect(result).toContain(
      'range_0 : case (accessibility: $accessibility filter: $range_0) { demographic { race { histogram { count } } } }',
    );
  });
});

describe('build range filters', () => {
  it('should bea set of query filters for ranges', () => {
    const ranges = [
      {
        from: 0,
        to: 6574,
      },
      {
        from: 6574,
        to: 13148,
      },
      {
        from: 13148,
        to: 19723,
      },
      {
        from: 19723,
        to: 26297,
      },
      {
        from: 26297,
        to: 32873,
      },
    ];

    const result = buildRangeFilters('data_type', ranges, 'range');

    expect(result).toEqual({
      range_0: {
        operands: [
          {
            field: 'data_type',
            operand: 0,
            operator: '>=',
          },
          {
            field: 'data_type',
            operand: 6574,
            operator: '<',
          },
        ],
        operator: 'and',
      },
      range_1: {
        operands: [
          {
            field: 'data_type',
            operand: 6574,
            operator: '>=',
          },
          {
            field: 'data_type',
            operand: 13148,
            operator: '<',
          },
        ],
        operator: 'and',
      },
      range_2: {
        operands: [
          {
            field: 'data_type',
            operand: 13148,
            operator: '>=',
          },
          {
            field: 'data_type',
            operand: 19723,
            operator: '<',
          },
        ],
        operator: 'and',
      },
      range_3: {
        operands: [
          {
            field: 'data_type',
            operand: 19723,
            operator: '>=',
          },
          {
            field: 'data_type',
            operand: 26297,
            operator: '<',
          },
        ],
        operator: 'and',
      },
      range_4: {
        operands: [
          {
            field: 'data_type',
            operand: 26297,
            operator: '>=',
          },
          {
            field: 'data_type',
            operand: 32873,
            operator: '<',
          },
        ],
        operator: 'and',
      },
    });
  });
});

describe('build range queries', () => {
  it('should build a query with all parameters', () => {
    const ranges = [
      {
        from: 0,
        to: 6574,
      },
      {
        from: 6574,
        to: 13148,
      },
      {
        from: 13148,
        to: 19723,
      },
      {
        from: 19723,
        to: 26297,
      },
      {
        from: 26297,
        to: 32873,
      },
    ];
    const results = buildRangeQuery(
      'files.data_type',
      ranges,
      'range',
      'case',
      'CaseCentric_',
    );

    expect(cleanString(results.query)).toContain(
      cleanString(`query rangeQuery ($accessibility: Accessibility, $range_0: JSON,$range_1: JSON,$range_2: JSON,$range_3: JSON,$range_4: JSON ) { CaseCentric__aggregation {range_0 : CaseCentric_case (accessibility: $accessibility filter: $range_0) { files { data_type { histogram { count } } } }\n
range_1 : CaseCentric_case (accessibility: $accessibility filter: $range_1) { files { data_type { histogram { count } } } }\n
range_2 : CaseCentric_case (accessibility: $accessibility filter: $range_2) { files { data_type { histogram { count } } } }\n
range_3 : CaseCentric_case (accessibility: $accessibility filter: $range_3) { files { data_type { histogram { count } } } }\n
range_4 : CaseCentric_case (accessibility: $accessibility filter: $range_4) { files { data_type { histogram { count } } } }\n
}}`),
    );
    expect(results.filters).toEqual({
      range_0: {
        operands: [
          {
            operand: {
              field: 'data_type',
              operand: 0,
              operator: '>=',
            },
            operator: 'nested',
            path: 'files',
          },
          {
            operand: {
              field: 'data_type',
              operand: 6574,
              operator: '<',
            },
            operator: 'nested',
            path: 'files',
          },
        ],
        operator: 'and',
      },
      range_1: {
        operands: [
          {
            operand: {
              field: 'data_type',
              operand: 6574,
              operator: '>=',
            },
            operator: 'nested',
            path: 'files',
          },
          {
            operand: {
              field: 'data_type',
              operand: 13148,
              operator: '<',
            },
            operator: 'nested',
            path: 'files',
          },
        ],
        operator: 'and',
      },
      range_2: {
        operands: [
          {
            operand: {
              field: 'data_type',
              operand: 13148,
              operator: '>=',
            },
            operator: 'nested',
            path: 'files',
          },
          {
            operand: {
              field: 'data_type',
              operand: 19723,
              operator: '<',
            },
            operator: 'nested',
            path: 'files',
          },
        ],
        operator: 'and',
      },
      range_3: {
        operands: [
          {
            operand: {
              field: 'data_type',
              operand: 19723,
              operator: '>=',
            },
            operator: 'nested',
            path: 'files',
          },
          {
            operand: {
              field: 'data_type',
              operand: 26297,
              operator: '<',
            },
            operator: 'nested',
            path: 'files',
          },
        ],
        operator: 'and',
      },
      range_4: {
        operands: [
          {
            operand: {
              field: 'data_type',
              operand: 26297,
              operator: '>=',
            },
            operator: 'nested',
            path: 'files',
          },
          {
            operand: {
              field: 'data_type',
              operand: 32873,
              operator: '<',
            },
            operator: 'nested',
            path: 'files',
          },
        ],
        operator: 'and',
      },
    });
  });
});
