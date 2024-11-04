import { FilterSet, Operation } from '../types';
import {
  convertFilterSetToGqlFilter,
  convertGqlFilterToFilter,
  GQLFilter,
} from '../filters';

describe('convertFilterSetToGqlFilter', () => {
  it('should correctly convert a complex FilterSet with nested filters to GQLFilter', () => {
    // Arrange
    const filterSet: FilterSet = {
      mode: 'and',
      root: {
        'gen3_discovery.PatientSex': {
          operator: 'nested',
          path: 'gen3_discovery',
          operand: {
            operator: 'in',
            field: 'PatientSex',
            operands: ['Female', 'Male'],
          },
        },
        'gen3_discovery.BodyPartExamined': {
          operator: 'nested',
          path: 'gen3_discovery',
          operand: {
            operator: 'in',
            field: 'BodyPartExamined',
            operands: ['BREAST', 'PROSTATE', 'PORT CHEST'],
          },
        },
        'gen3_discovery.primary_site': {
          operator: 'nested',
          path: 'gen3_discovery',
          operand: {
            operator: 'in',
            field: 'primary_site',
            operands: ['Lung'],
          },
        },
      },
    };

    // Act
    const result = convertFilterSetToGqlFilter(filterSet);

    // Assert
    expect(result).toEqual({
      and: [
        {
          nested: {
            path: 'gen3_discovery',
            in: {
              PatientSex: ['Female', 'Male'],
            },
          },
        },
        {
          nested: {
            path: 'gen3_discovery',
            in: {
              BodyPartExamined: ['BREAST', 'PROSTATE', 'PORT CHEST'],
            },
          },
        },
        {
          nested: {
            path: 'gen3_discovery',
            in: {
              primary_site: ['Lung'],
            },
          },
        },
      ],
    });
  });

  it('should return empty AND filter for empty FilterSet', () => {
    // Arrange
    const emptyFilterSet: FilterSet = {
      mode: 'and',
      root: {},
    };

    // Act
    const result = convertFilterSetToGqlFilter(emptyFilterSet);

    // Assert
    expect(result).toEqual({
      and: [],
    });
  });

  it('should respect the mode parameter when converting FilterSet', () => {
    // Arrange
    const filterSet: FilterSet = {
      mode: 'and',
      root: {
        'gen3_discovery.PatientSex': {
          operator: 'nested',
          path: 'gen3_discovery',
          operand: {
            operator: 'in',
            field: 'PatientSex',
            operands: ['Female', 'Male'],
          },
        },
      },
    };

    // Act
    const resultWithOr = convertFilterSetToGqlFilter(filterSet, 'or');

    // Assert
    expect(resultWithOr).toEqual({
      or: [
        {
          nested: {
            path: 'gen3_discovery',
            in: {
              PatientSex: ['Female', 'Male'],
            },
          },
        },
      ],
    });
  });
});

describe('convertGqlFilterToFilter', () => {
  it('should convert  GQLFilter without nested filters to Operation', () => {
    const gqlFilter: GQLFilter = {
      and: [
        {
          in: {
            PatientSex: ['Female', 'Male'],
          },
        },
        {
          in: {
            BodyPartExamined: ['BREAST', 'PROSTATE', 'PORT CHEST'],
          },
        },
        {
          in: {
            primary_site: ['Lung'],
          },
        },
      ],
    };

    // Act
    const result = convertGqlFilterToFilter(gqlFilter);

    // Assert
    const expected: Operation = {
      operator: 'and',
      operands: [
        {
          field: 'PatientSex',
          operands: ['Female', 'Male'],
          operator: 'in',
        },
        {
          field: 'BodyPartExamined',
          operands: ['BREAST', 'PROSTATE', 'PORT CHEST'],
          operator: 'in',
        },
        {
          field: 'primary_site',
          operands: ['Lung'],
          operator: 'in',
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('should convert complex GQLFilter with nested filters to Operation', () => {
    // Arrange
    const gqlFilter: GQLFilter = {
      and: [
        {
          nested: {
            path: 'gen3_discovery',
            in: {
              PatientSex: ['Female', 'Male'],
            },
          },
        },
        {
          nested: {
            path: 'gen3_discovery',
            in: {
              BodyPartExamined: ['BREAST', 'PROSTATE', 'PORT CHEST'],
            },
          },
        },
        {
          nested: {
            path: 'gen3_discovery',
            in: {
              primary_site: ['Lung'],
            },
          },
        },
      ],
    };

    // Act
    const result = convertGqlFilterToFilter(gqlFilter);

    // Assert
    const expected: Operation = {
      operator: 'and',
      operands: [
        {
          operator: 'nested',
          path: 'gen3_discovery',
          operand: {
            operator: 'in',
            field: 'PatientSex',
            operands: ['Female', 'Male'],
          },
        },
        {
          operator: 'nested',
          path: 'gen3_discovery',
          operand: {
            operator: 'in',
            field: 'BodyPartExamined',
            operands: ['BREAST', 'PROSTATE', 'PORT CHEST'],
          },
        },
        {
          operator: 'nested',
          path: 'gen3_discovery',
          operand: {
            operator: 'in',
            field: 'primary_site',
            operands: ['Lung'],
          },
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('should convert simple comparison operators', () => {
    // Arrange
    const testCases: Array<{ input: GQLFilter; expected: Operation }> = [
      {
        input: { '=': { age: 25 } },
        expected: { operator: '=', field: 'age', operand: 25 },
      },
      {
        input: { '!=': { status: 'pending' } },
        expected: { operator: '!=', field: 'status', operand: 'pending' },
      },
      {
        input: { '>': { score: 90 } },
        expected: { operator: '>', field: 'score', operand: 90 },
      },
      {
        input: { '>=': { rating: 4.5 } },
        expected: { operator: '>=', field: 'rating', operand: 4.5 },
      },
      {
        input: { '<': { priority: 3 } },
        expected: { operator: '<', field: 'priority', operand: 3 },
      },
      {
        input: { '<=': { threshold: 100 } },
        expected: { operator: '<=', field: 'threshold', operand: 100 },
      },
    ];

    // Act & Assert
    testCases.forEach(({ input, expected }) => {
      const result = convertGqlFilterToFilter(input);
      expect(result).toEqual(expected);
    });
  });

  it('should convert array operators (in, exclude, excludeifany)', () => {
    // Arrange
    const testCases: Array<{ input: GQLFilter; expected: Operation }> = [
      {
        input: { in: { status: ['active', 'pending'] } },
        expected: {
          operator: 'in',
          field: 'status',
          operands: ['active', 'pending'],
        },
      },
      {
        input: { exclude: { category: ['test', 'demo'] } },
        expected: {
          operator: 'excludes',
          field: 'category',
          operands: ['test', 'demo'],
        },
      },
      {
        input: { excludeifany: { tags: ['temp', 'draft'] } },
        expected: {
          operator: 'excludeifany',
          field: 'tags',
          operands: ['temp', 'draft'],
        },
      },
    ];

    // Act & Assert
    testCases.forEach(({ input, expected }) => {
      const result = convertGqlFilterToFilter(input);
      expect(result).toEqual(expected);
    });
  });

  it('should convert logical operators (and, or)', () => {
    // Arrange
    const gqlFilter: GQLFilter = {
      or: [{ '=': { status: 'active' } }, { '=': { status: 'pending' } }],
    };

    // Act
    const result = convertGqlFilterToFilter(gqlFilter);

    // Assert
    const expected: Operation = {
      operator: 'or',
      operands: [
        { operator: '=', field: 'status', operand: 'active' },
        { operator: '=', field: 'status', operand: 'pending' },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('should convert nested filters', () => {
    // Arrange
    const gqlFilter: GQLFilter = {
      nested: {
        path: 'metadata',
        '=': { 'metadata.type': 'document' },
      },
    };

    // Act
    const result = convertGqlFilterToFilter(gqlFilter);

    // Assert
    const expected: Operation = {
      operator: 'nested',
      path: 'metadata',
      operand: {
        operator: '=',
        field: 'metadata.type',
        operand: 'document',
      },
    };

    expect(result).toEqual(expected);
  });
});
