import type { Meta, StoryObj } from '@storybook/nextjs';

import MultiSelectValueFacet from './MultiSelectValueFacet';

const meta = {
  component: MultiSelectValueFacet,
} satisfies Meta<typeof MultiSelectValueFacet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    field: 'facet',
    description: 'multiselect fields',
    facetName: 'Test Facet',
    width: '100px',
    hooks: {
      useClearFilter: () => (/* field */ _field?: string) => {
        // mock clear filter
      },
      useUpdateFacetFilters:
        () => (/* field */ _field?: string, /* value */ _value?: unknown) => {
          // mock update facet filters
        },
      useGetFacetFilters: (_field?: string) => {
        // mock current facet filter value
        return {
          operands: ['A'],
          operator: 'in',
          field: 'facet',
        };
      },
      useFieldNameToLabel:
        () =>
        (_field: string, _sections: number | undefined = undefined) =>
          'Facet',
      useGetFacetData: (/* field */ _field?: string) => {
        // mock facet data
        return {
          data: {
            'Alpha Product - North Region': 12,
            'Alpha Product - South Region': 8,
            'Alpha Product - West Region': 5,
            'Alpha Service - North Region': 14,
            'Alpha Service - South Region': 7,
            'Beta Product - North Region': 9,
            'Beta Product - East Region': 4,
            'Beta Service - Global Tier 1': 11,
            'Beta Service - Global Tier 2': 6,
            'Gamma Product - Trial Plan': 3,
            'Gamma Product - Starter Plan': 5,
            'Gamma Product - Enterprise Plan': 15,
            'Gamma Service - Starter Plan': 4,
            'Gamma Service - Enterprise Plan': 13,
            'Delta Cloud - Standard Package': 10,
            'Delta Cloud - Premium Package': 18,
            'Delta Cloud - Enterprise Package': 21,
            'Epsilon Analytics - Basic Tier': 7,
            'Epsilon Analytics - Professional Tier': 16,
            'Epsilon Analytics - Enterprise Tier': 20,
            'Omega Suite - Core Module': 9,
            'Omega Suite - Reporting Module': 6,
            'Omega Suite - Automation Module': 11,
            'Omega Suite - Integration Module': 8,
            'Omega Suite - Security Module': 5,
            'Zeta Platform - Onboarding Flow': 3,
            'Zeta Platform - Billing Flow': 4,
            'Zeta Platform - Retention Flow': 6,
            'Theta Tools - Developer Edition': 7,
            'Theta Tools - Team Edition': 10,
            'Theta Tools - Enterprise Edition': 13,
            'Lambda Labs - Experimental Feature': 2,
          },
          isSuccess: true,
          isFetching: false,
          isError: false,
        };
      },
      useFilterExpanded: (/* field */ _field?: string) => {
        // mock expanded state
        return true;
      },
    },
  },
};
