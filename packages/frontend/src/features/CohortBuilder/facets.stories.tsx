import React from 'react';
import { Text } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react';
import { useFacetDictionary } from '@gen3/core';

const FacetList = () => {
  const { data, isFetching, isError, error } = useFacetDictionary();

  console.log(data);

  return (
    <div className="flex flex-col">
      <Text>{isFetching}</Text>
    </div>
  );
};

const meta = {
  title: 'Features/CohortBuilder/FacetList',
  component: FacetList,
  parameters: {
    deepControls: { enabled: true },
  },
} satisfies Meta<typeof FacetList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'Facets from Dictionary',
    tooltip: 'Navigation link in the TopBar component',
    leftIcon: 'gen3:download',
    rightIcon: 'gen3:send',
  },
};
