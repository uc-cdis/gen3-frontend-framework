import { FilterSet, Operation } from '../types';
import {
  buildNestedFilterForOperation,
  buildNestedGQLFilter,
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

  it('should create a nested filter for a GQLFilter', () => {
    const result = buildNestedGQLFilter('cases.genes.gene_id', {
      '=': { gene_id: 'test' },
    });

    const expected = {
      nested: {
        nested: {
          '=': {
            gene_id: 'test',
          },
          path: 'cases.genes',
        },
        path: 'cases',
      },
    };

    expect(result).toEqual(expected);
  });

  it('should create a nested filter for a Operation', () => {
    const result = buildNestedFilterForOperation('cases.genes.gene_symbol', {
      operator: '=',
      field: 'gene_symbol',
      operand: 'KRAS',
    });

    const expected = {
      operand: {
        operand: {
          field: 'gene_symbol',
          operand: 'KRAS',
          operator: '=',
        },
        operator: 'nested',
        path: 'cases.genes',
      },
      operator: 'nested',
      path: 'cases',
    };

    expect(result).toEqual(expected);
  });

  it('should not create a nested filter for fields without "."', () => {
    const result = buildNestedFilterForOperation('gene_symbol', {
      operator: '=',
      field: 'to_set',
      operand: 'KRAS',
    });

    const expected = {
      field: 'gene_symbol',
      operand: 'KRAS',
      operator: '=',
    };

    expect(result).toEqual(expected);
  });

  it('text range filters as nested', () => {
    const result = buildNestedFilterForOperation('demographic.age', {
      operator: 'and',
      operands: [
        {
          field: 'demographic.age',
          operator: '>=',
          operand: 40,
        },
        {
          field: 'demographic.age',
          operator: '<',
          operand: 50,
        },
      ],
    });
    const expected = {
      operator: 'nested',
      path: 'demographic',
      operand: {
        operator: 'and',
        operands: [
          {
            field: 'age',
            operator: '>=',
            operand: 40,
          },
          {
            field: 'age',
            operator: '<',
            operand: 50,
          },
        ],
      },
    };
    expect(result).toEqual(expected);
  });
});

describe('buildNestedFilterForOperation with compound leaf', () => {
  it('uses field names relative to the nested path inside a range (and) leaf', () => {
    const range: Operation = {
      operator: 'and',
      operands: [
        { operator: '>=', field: 'Testing.age_at_normalized', operand: 2 },
        { operator: '<=', field: 'Testing.age_at_normalized', operand: 106 },
      ],
    };
    expect(
      buildNestedFilterForOperation('Testing.age_at_normalized', range),
    ).toEqual({
      operator: 'nested',
      path: 'Testing',
      operand: {
        operator: 'and',
        operands: [
          { operator: '>=', field: 'age_at_normalized', operand: 2 },
          { operator: '<=', field: 'age_at_normalized', operand: 106 },
        ],
      },
    });
  });

  it('produces the relative GQL payload for a range', () => {
    const range: Operation = {
      operator: 'and',
      operands: [
        { operator: '>=', field: 'Testing.age_at_normalized', operand: 2 },
        { operator: '<=', field: 'Testing.age_at_normalized', operand: 106 },
      ],
    };
    const gql = convertFilterSetToGqlFilter({
      mode: 'and',
      root: {
        'Testing.age_at_normalized': buildNestedFilterForOperation(
          'Testing.age_at_normalized',
          range,
        ),
      },
    });
    expect(gql).toEqual({
      and: [
        {
          nested: {
            path: 'Testing',
            and: [
              { '>=': { age_at_normalized: 2 } },
              { '<=': { age_at_normalized: 106 } },
            ],
          },
        },
      ],
    });
  });

  it('handles doubly nested paths', () => {
    const range: Operation = {
      operator: 'and',
      operands: [
        { operator: '>=', field: 'a.b.c', operand: 1 },
        { operator: '<=', field: 'a.b.c', operand: 9 },
      ],
    };
    expect(buildNestedFilterForOperation('a.b.c', range)).toEqual({
      operator: 'nested',
      path: 'a',
      operand: {
        operator: 'nested',
        path: 'a.b',
        operand: {
          operator: 'and',
          operands: [
            { operator: '>=', field: 'c', operand: 1 },
            { operator: '<=', field: 'c', operand: 9 },
          ],
        },
      },
    });
  });
});
