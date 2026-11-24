import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import AdvancedSearchPanel from './AdvancedSearchPanel';
import type { AdvancedSearchProps } from './AdvancedSearch';
import { type AdvancedSearchTerms, SearchCombination } from './types';
import type { KeyValueSearchFilter } from '../types';

const toValueDisplayNames = (values: string[]): Record<string, string> =>
  Object.fromEntries(values.map((value) => [value, value]));

const filters: KeyValueSearchFilter[] = [
  {
    key: 'Study Type',
    valueDisplayNames: toValueDisplayNames([
      'Basic Research',
      'Business Development',
      'Clinical Research',
      'Epidemiologic Research',
      'Implementation Research',
      'Post-market Research',
      'Pre-Clinical Research',
      'Pre-Research/Protocol Development',
    ]),
  },
  {
    key: 'Data Type',
    valueDisplayNames: toValueDisplayNames([
      'Biochemical',
      'Biophysical',
      'Genomic',
      'Imaging',
      'Interview/Focus Group',
      'Proteomic',
      'Questionnaire/Survey/Assessment',
    ]),
  },
];

const AdvancedSearchPanelDemo = ({
  advSearchFilters,
  opened,
}: Omit<AdvancedSearchProps, 'setAdvancedSearchFilters'>) => {
  const [terms, setTerms] = useState<AdvancedSearchTerms>({
    operation: SearchCombination.and,
    filters: {},
  });
  return (
    <div className="flex items-start gap-4">
      <AdvancedSearchPanel
        advSearchFilters={advSearchFilters}
        opened={opened}
        setAdvancedSearchFilters={setTerms}
      />
      <div>
        <h3>Selected Items:</h3>
        <pre className="text-xs bg-base-max p-2 rounded-md">
          {JSON.stringify(terms, null, 2)}
        </pre>
      </div>
    </div>
  );
};

const meta = {
  component: AdvancedSearchPanel,
  args: {
    advSearchFilters: filters,
    opened: true,
    setAdvancedSearchFilters: () => {},
  },
  decorators: [
    (Story) => (
      <MantineProvider>
        <div className="bg-base-lightest p-4">
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
} satisfies Meta<typeof AdvancedSearchPanel>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ advSearchFilters, opened }) => (
    <AdvancedSearchPanelDemo
      advSearchFilters={advSearchFilters}
      opened={opened}
    />
  ),
};
