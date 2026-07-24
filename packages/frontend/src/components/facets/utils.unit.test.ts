import type { FacetDefinition, HistogramDataArray } from '@gen3/core';
import { classifyFacets, mapFacetSortToSortType } from './utils';
import type { FacetSortType } from './types';

jest.mock('@gen3/core', () => ({
  fieldNameToLabel: (field: string) => field,
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
  it('preserves the configured default sort on the facet definition', () => {
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
      },
    } satisfies Record<string, FacetDefinition>;

    const facets = classifyFacets(data, 'case', [], config);

    expect(facets.status.defaultSort).toBe('label-asc');
  });
});
