import type { Meta, StoryObj } from '@storybook/nextjs';

import { createFacetCard } from './createFacetCard';

const meta = {
  component: createFacetCard,
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof createFacetCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    facetDefinition: {
      field: 'demographic',
      index: 'cases',
      type: 'enum',
      description: 'aaa',
    },
    hooks: {
      useClearFilter: (() => {}) as any,
      usefieldNameToLabel: ((field: string) => field) as any,
      useUpdateFacetFilters: (() => {}) as any,
      useGetFacetFilters: (() => {}) as any,
      useGetFacetData: (() => ({
        data: { white: 50 },
        isFetching: false,
        isSuccess: true,
      })) as any,
    } as any,
    valueLabel: 'cases',
    idPrefix: 'cohort-builder',
    facetNameFormatter: (name) => name,
  },
};
