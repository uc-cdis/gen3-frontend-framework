import type { Meta, StoryObj } from '@storybook/react';

import AddToDataLibrary from './AddToDataLibrary';

const meta = {
  component: AddToDataLibrary,
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof AddToDataLibrary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    buttonConfig: {
      label: 'Add to List',
      tooltip: 'Add selections to list',
      type: 'addToDataLibrary',
    },
    selectedResources: [
      {
        __manifest: [
          {
            md5sum: 'a1890eb3da180416a3a1e2c4e4527356', // pragma: allowlist secret
            file_name: 'teach.sav',
            file_size: 1291786,
            object_id: 'dg.5555/8d84511c',
          },
          {
            md5sum: '32d8152b09a2ed05a0fde2f21ff46479', // pragma: allowlist secret
            file_name: 'Teaching.zip',
            file_size: 2565265,
            object_id: 'dg.5555/3ca7d38-',
          },
          {
            md5sum: 'dde1b1d86b3b4ed88fa5b42974ecfd79', // pragma: allowlist secret
            file_name: 'tutorial.zip',
            file_size: 94535,
            object_id: 'dg.5555/0c8df5e3',
          },
          {
            md5sum: '8f5b9b28004210865a0c1d7fc9834b1a', // pragma: allowlist secret
            file_name: 'teach.csv',
            file_size: 932272,
            object_id: 'dg.5555/03ed62aa',
          },
        ],
        dataset_id: '1010',
      },
    ],
    exportDataFields: {
      dataObjectField: '__manifest',
      datasetIdField: 'dataset_id',
      dataObjectIdField: 'object_id',
    },
  },
};
