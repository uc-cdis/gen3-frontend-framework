import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CheckoutSummary from './CheckoutSummary';
import { MantineProvider } from '@mantine/core';
import React, { useEffect } from 'react';
import {
  DataLibrarySelectionProvider,
  type ListMembers,
  useDataLibrarySelection,
} from '../selection/SelectionContext';
import type { DataLibrary } from '@gen3/core';
import dataLibraryContents from './data/test_list.json';

const meta = {
  component: CheckoutSummary,
} satisfies Meta<typeof CheckoutSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

const DemoDataLibrary = ({ Story }: { Story: React.ElementType }) => {
  const { updateSelections, gatherSelectedItems, selections } =
    useDataLibrarySelection();

  // Step 1: populate selections once on mount
  useEffect(() => {
    const library = dataLibraryContents as unknown as DataLibrary;
    for (const [listId, list] of Object.entries(library)) {
      const members: ListMembers = {};
      for (const [datasetId, dataset] of Object.entries(list.items)) {
        if ('members' in dataset) {
          members[datasetId] = {
            id: datasetId,
            objectIds: Object.fromEntries(
              Object.keys(dataset.members ?? {}).map((fileId) => [
                fileId,
                true,
              ]),
            ),
          };
        }
      }
      updateSelections(listId, members);
    }
  }, []);

  // Step 2: once selections are populated, gather the items
  useEffect(() => {
    if (Object.keys(selections).length > 0) {
      gatherSelectedItems(dataLibraryContents as unknown as DataLibrary);
    }
  }, [selections]);

  return <Story />;
};

export const Default: Story = {
  args: {
    actions: [],
  },
  decorators: [
    (Story) => (
      <MantineProvider>
        <DataLibrarySelectionProvider>
          <div className="p-10 flex justify-center bg-gray-20">
            <DemoDataLibrary Story={Story} />
          </div>
        </DataLibrarySelectionProvider>
      </MantineProvider>
    ),
  ],
};
