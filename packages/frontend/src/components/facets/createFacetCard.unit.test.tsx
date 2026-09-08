import React, { isValidElement, ReactElement, ReactNode } from 'react';
import type { FacetDefinition } from '@gen3/core';
import { createFacetCard } from './createFacetCard';
import type { EnumFacetDataHooks, FacetCardProps } from './types';

jest.mock('./EnumFacet', () => ({ __esModule: true, default: () => null }));
jest.mock('./RangeFacet', () => ({ __esModule: true, default: () => null }));
jest.mock('./ToggleFacet', () => ({ __esModule: true, default: () => null }));
jest.mock('./MultiSelectValueFacet', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./ExactValueFacet', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./UploadFacet', () => ({ __esModule: true, default: () => null }));
jest.mock('./NumericRangeFacet', () => ({
  __esModule: true,
  default: () => null,
}));

const hooks = {
  useClearFilter: () => jest.fn(),
  useFieldNameToLabel: () => (field: string) => field,
  useUpdateFacetFilters: () => jest.fn(),
  useGetFacetFilters: jest.fn(),
  useGetFacetData: () => ({
    data: {},
    isSuccess: true,
    isFetching: false,
  }),
  useGetCombineMode: () => 'or' as const,
  useUpdateCombineMode: jest.fn(),
} satisfies EnumFacetDataHooks;

const getEnumFacet = (showMatchModeSelector?: boolean) => {
  const facetDefinition: FacetDefinition = {
    field: 'risk_criteria',
    index: 'case',
    type: 'enum',
    showMatchModeSelector,
  };

  const card = createFacetCard({
    facetDefinition,
    hooks,
    idPrefix: 'test',
    valueLabel: 'cases',
    facetNameFormatter: (field) => field,
  });

  expect(isValidElement(card)).toBe(true);
  return (card as ReactElement<{ children: ReactNode }>).props
    .children as ReactElement<FacetCardProps<EnumFacetDataHooks>>;
};

describe('createFacetCard', () => {
  it('shows the match-mode settings only when the enum facet opts in', () => {
    expect(getEnumFacet(true).props.showSettings).toBe(true);
    expect(getEnumFacet().props.showSettings).toBeUndefined();
  });
});
