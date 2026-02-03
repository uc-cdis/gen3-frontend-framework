import {
  buildAliasedNestedCountsQuery,
  buildRangeFilters,
  buildRangeQuery,
} from '../utils';
import { Operation } from '../../filters/types';

const case_filters = {
  operator: 'in',
  field: 'file.data_category',
  operands: ['test'],
} as Operation;

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
    expect(result).toContain(
      'range_0 : case (accessibility: $accessibility filter: $range_0) { data_type ( histogram { count } } }',
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

    const result = buildRangeFilters(
      'data_type',
      case_filters,
      ranges,
      'range',
    );

    expect(result).toEqual({
      range_0: {
        operands: [
          {
            field: 'file.data_category',
            operands: ['test'],
            operator: 'in',
          },
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
            field: 'file.data_category',
            operands: ['test'],
            operator: 'in',
          },
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
            field: 'file.data_category',
            operands: ['test'],
            operator: 'in',
          },
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
            field: 'file.data_category',
            operands: ['test'],
            operator: 'in',
          },
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
            field: 'file.data_category',
            operands: ['test'],
            operator: 'in',
          },
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
      case_filters,
      ranges,
      'range',
      'case',
      'CaseCentric_',
    );

    expect(results.query).toContain(
      'query rangeQuery ($accessibility: Accessibility, $range_0: JSON,$range_1: JSON,$range_2: JSON,$range_3: JSON,$range_4: JSON ) { CaseCentric__aggregation {range_0 : case (accessibility: $accessibility filter: $range_0) { data_type { _totalCount } } \nrange_1 : case (accessibility: $accessibility filter: $range_1) { data_type { _totalCount } } \nrange_2 : case (accessibility: $accessibility filter: $range_2) { data_type { _totalCount } } \nrange_3 : case (accessibility: $accessibility filter: $range_3) { data_type { _totalCount } } \nrange_4 : case (accessibility: $accessibility filter: $range_4) { data_type { _totalCount } } \n}}',
    );
    expect(results.variables).toEqual({
      range_0: {
        operator: 'and',
        operands: [
          {
            operator: 'in',
            field: 'file.data_category',
            operands: ['test'],
          },
          {
            operator: '>=',
            field: 'data_type',
            operand: 0,
          },
          {
            operator: '<',
            field: 'data_type',
            operand: 6574,
          },
        ],
      },
      range_1: {
        operator: 'and',
        operands: [
          {
            operator: 'in',
            field: 'file.data_category',
            operands: ['test'],
          },
          {
            operator: '>=',
            field: 'data_type',
            operand: 6574,
          },
          {
            operator: '<',
            field: 'data_type',
            operand: 13148,
          },
        ],
      },
      range_2: {
        operator: 'and',
        operands: [
          {
            operator: 'in',
            field: 'file.data_category',
            operands: ['test'],
          },
          {
            operator: '>=',
            field: 'data_type',
            operand: 13148,
          },
          {
            operator: '<',
            field: 'data_type',
            operand: 19723,
          },
        ],
      },
      range_3: {
        operator: 'and',
        operands: [
          {
            operator: 'in',
            field: 'file.data_category',
            operands: ['test'],
          },
          {
            operator: '>=',
            field: 'data_type',
            operand: 19723,
          },
          {
            operator: '<',
            field: 'data_type',
            operand: 26297,
          },
        ],
      },
      range_4: {
        operator: 'and',
        operands: [
          {
            operator: 'in',
            field: 'file.data_category',
            operands: ['test'],
          },
          {
            operator: '>=',
            field: 'data_type',
            operand: 26297,
          },
          {
            operator: '<',
            field: 'data_type',
            operand: 32873,
          },
        ],
      },
    });
  });
});
