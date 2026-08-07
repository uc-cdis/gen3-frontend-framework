import type { FacetDefinition, HistogramDataArray } from '@gen3/core';
import {
  classifyFacets,
  mapFacetSortToSortType,
  updateFacetEnum,
} from './utils';
import type { FacetSortType } from './types';

jest.mock('@gen3/core', () => ({
  extractEnumFilterValue: (filter: { operands: Array<string | number> }) =>
    filter.operands,
  fieldNameToLabel: (field: string) => field,
  isOperatorWithFieldAndArrayOfOperands: (filter: unknown) =>
    typeof filter === 'object' && filter !== null && 'operands' in filter,
}));

describe('mapFacetSortToSortType', () => {
  test.each([
    ['value-asc', { type: 'value', direction: 'asc' }],
    ['value-dsc', { type: 'value', direction: 'dsc' }],
    ['label-asc', { type: 'alpha', direction: 'asc' }],
    ['label-desc', { type: 'alpha', direction: 'dsc' }],
  ] as Array<[FacetSortType, ReturnType<typeof mapFacetSortToSortType>]>)(
    'maps %s to the enum list sort state',
    (configuredSort, expectedSort) => {
      expect(mapFacetSortToSortType(configuredSort)).toEqual(expectedSort);
    },
  );

  it('uses the existing value-descending default for an invalid value', () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    expect(mapFacetSortToSortType('invalid' as FacetSortType)).toStrictEqual({
      type: 'value',
      direction: 'dsc',
    });
    expect(consoleWarn).toHaveBeenCalled();

    consoleWarn.mockRestore();
  });
});

describe('classifyFacets', () => {
  it('preserves configured enum display options on the facet definition', () => {
    const data = {
      status: [
        { key: 'True', count: 2 },
        { key: 'False', count: 3 },
      ],
    } as Record<string, HistogramDataArray>;
    const config = {
      status: {
        field: 'status',
        index: 'case',
        type: 'enum',
        defaultSort: 'label-asc',
        showMatchModeSelector: true,
      },
    } satisfies Record<string, FacetDefinition>;

    const facets = classifyFacets(data, 'case', [], config);

    expect(facets.status.defaultSort).toBe('label-asc');
    expect(facets.status.showMatchModeSelector).toBe(true);
  });
});

describe('updateFacetEnum', () => {
  it('continues to combine selected values with OR by default', () => {
    const updateFacetFilters = jest.fn();
    const clearFilters = jest.fn();

    updateFacetEnum(
      'status',
      ['active', 'inactive'],
      updateFacetFilters,
      clearFilters,
    );

    expect(updateFacetFilters).toHaveBeenCalledWith('status', {
      operator: 'in',
      field: 'status',
      operands: ['active', 'inactive'],
    });
    expect(clearFilters).not.toHaveBeenCalled();
  });

  it('creates an intersection when match-all mode is selected', () => {
    const updateFacetFilters = jest.fn();
    const clearFilters = jest.fn();

    updateFacetEnum(
      'criteria',
      ['criterion 1', 'criterion 2'],
      updateFacetFilters,
      clearFilters,
      'and',
    );

    expect(updateFacetFilters).toHaveBeenCalledWith('criteria', {
      operator: 'and',
      operands: [
        {
          operator: 'in',
          field: 'criteria',
          operands: ['criterion 1'],
        },
        {
          operator: 'in',
          field: 'criteria',
          operands: ['criterion 2'],
        },
      ],
    });
    expect(clearFilters).not.toHaveBeenCalled();
  });
});
