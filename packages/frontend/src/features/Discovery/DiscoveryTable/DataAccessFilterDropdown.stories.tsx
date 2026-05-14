import type { Meta, StoryObj } from '@storybook/nextjs';
import React, { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { DiscoveryContext } from '../DiscoveryProvider';
import { AccessLevel } from '../../../utils';
import DataAccessFilterDropdown from './DataAccessFilterDropdown';

const DataAccessFilterDropdownWrapper = (initialLevels: number[] = []) => {
  const DecoratorComponent = (Story: React.ComponentType) => {
    const [selectedAccessLevels, setSelectedAccessLevels] =
      useState<number[]>(initialLevels);
    return (
      <MantineProvider>
        <DiscoveryContext.Provider
          value={{
            discoveryConfig: {} as any,
            selectedTags: {},
            setSelectedTags: () => {},
            selectedAccessLevels,
            setSelectedAccessLevels,
          }}
        >
          <div className="bg-base-lighter p-4 h-96 flex items-center justify-center">
            <Story />
          </div>
        </DiscoveryContext.Provider>
      </MantineProvider>
    );
  };
  DecoratorComponent.displayName = 'DataAccessFilterDropdownWrapper';
  return DecoratorComponent;
};

const meta = {
  component: DataAccessFilterDropdown,
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof DataAccessFilterDropdown>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [DataAccessFilterDropdownWrapper([])],
};

export const PreSelected: Story = {
  decorators: [
    DataAccessFilterDropdownWrapper([
      AccessLevel.ACCESSIBLE,
      AccessLevel.WAITING,
    ]),
  ],
};
