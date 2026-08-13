import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { MantineProvider } from '@mantine/core';
import { DiscoveryContext } from '../../DiscoveryProvider';
import { DataAccessCellRenderer } from './DataAccessCellRenderer';
import { MRT_Cell, MRT_Row } from 'mantine-react-table-open';
import { JSONObject } from '@gen3/core';
import { AccessLevel } from '../../../../utils';

const mockDiscoveryConfig = {
  minimalFieldMapping: {
    authzField: 'authz',
  },
  features: {
    exportFromDiscovery: {
      exportDataFields: {},
    },
  },
};

const meta = {
  component: DataAccessCellRenderer,
  decorators: [
    (Story) => (
      <MantineProvider>
        <DiscoveryContext.Provider
          value={
            {
              discoveryConfig: mockDiscoveryConfig as any,
            } as any
          }
        >
          <div className="p-10 flex justify-center bg-gray-20">
            <Story />
          </div>
        </DiscoveryContext.Provider>
      </MantineProvider>
    ),
  ],
} satisfies Meta<typeof DataAccessCellRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

const createMockProps = (value: number | number[], authz = '/study/123') => ({
  cell: {
    getValue: () => value,
  } as unknown as MRT_Cell<JSONObject>,
  row: {
    original: {
      authz: authz,
    },
  } as unknown as MRT_Row<JSONObject>,
});

export const Accessible: Story = {
  args: createMockProps(AccessLevel.ACCESSIBLE) as any,
};

export const Unaccessible: Story = {
  args: createMockProps(AccessLevel.UNACCESSIBLE, '/restricted/data') as any,
};

export const Waiting: Story = {
  args: createMockProps(AccessLevel.WAITING) as any,
};

export const NoData: Story = {
  args: createMockProps(undefined as any, '') as any,
};

export const MixedAccess: Story = {
  args: createMockProps(AccessLevel.MIXED) as any,
};
export const Other: Story = {
  args: createMockProps(AccessLevel.OTHER) as any,
};
