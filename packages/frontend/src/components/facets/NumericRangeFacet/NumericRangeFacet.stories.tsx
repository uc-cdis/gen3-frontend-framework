import type { Meta, StoryObj } from '@storybook/nextjs';

import NumericRangeFacet from './index';
import { NumericFacetCardProps } from '../types';

const meta = {
  component: NumericRangeFacet,
} satisfies Meta<typeof NumericRangeFacet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    field: 'age_at_index',
    facetName: 'Age At Index',
    rangeDatatype: 'age',
    description: 'Age range panel',
    hooks: {
      useClearFilter: (() => {}) as any,
      useFieldNameToLabel: ((field: string) => field) as any,
      useUpdateFacetFilters: (() => {}) as any,
      useGetFacetFilters: (() => {}) as any,
      useGetFacetData: (() => ({
        data: { white: 50 },
        isFetching: false,
        isSuccess: true,
      })) as any,
    } as any,
    valueLabel: 'cases',
  } as Readonly<NumericFacetCardProps>,
};
