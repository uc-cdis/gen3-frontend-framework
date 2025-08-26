import React from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { BarChartIcon, SurvivalChartIcon } from '../types/icons';
import { SegmentedControlItem, Tooltip } from '@mantine/core';
import SegmentedControl from './SegmentedControl';

const chartButtons: SegmentedControlItem[] = [
  {
    value: 'histogram',
    label: (
      <Tooltip label="Histogram" position="bottom-end" withArrow arrowSize={7}>
        <div
          data-testid="button-histogram-plot"
          role="button"
          aria-label={`Select test histogram plot`}
        >
          <BarChartIcon size={20} aria-hidden="true" />
        </div>
      </Tooltip>
    ),
  },
  {
    value: 'survival',
    label: (
      <Tooltip label={'Survival Plot'} withArrow arrowSize={7}>
        <div
          data-testid="button-survival-plot"
          role="button"
          aria-label={`Select test survival plot`}
        >
          <SurvivalChartIcon size={20} aria-hidden="true" />
        </div>
      </Tooltip>
    ),
  },
];

const meta = {
  component: SegmentedControl,
  decorators: [
    (Story) => (
      <div className="bg-base-lightest p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: 1,
    data: chartButtons,
  },
};
