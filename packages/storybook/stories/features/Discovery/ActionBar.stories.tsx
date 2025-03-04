import type { Meta, StoryObj } from '@storybook/react';
import { ActionBar } from '@gen3/frontend';

/*


 type:
    | 'manifest'
    | 'zip'
    | 'download'
    | 'link'
    | 'externalLink'
    | 'addToDataLibrary';
  label?: string; // label for the action button
  icon?: string;
  requiresLogin?: boolean; // set to true if the action requires login
  tooltip?: string; // tooltip text
  disabled?: boolean;

 */

const meta = {
  title: 'Features/Discovery/ActionBar',
  component: ActionBar,
  argTypes: {
    buttons: [
      {
        label: {
          control: 'text',
        },
      },
      {
        tooltip: {
          control: 'text',
        },
      },
      {
        icon: {
          control: 'text',
        },
      },
      {
        disabled: {
          control: 'boolean',
        },
      },
      {
        requiresLogin: {
          control: 'boolean',
        },
      },
      {
        type: {
          control: 'select',
          options: [
            'manifest',
            'zip',
            'download',
            'link',
            'externalLink',
            'addToDataLibrary',
          ],
          description: 'Overwritten description',
        },
      },
    ],
  },
} satisfies Meta<typeof ActionBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selectedResources: [],
    exportDataFields: {
      dataObjectFieldName: '',
      datesetIdFieldName: '',
      dataObjectIdField: '__manifest',
    },
    buttons: [
      {
        type: 'manifest',
        label: 'Manifest',
      },
      {
        type: 'addToDataLibrary',
      },
    ],
  },
};
