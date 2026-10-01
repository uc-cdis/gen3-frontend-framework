import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CreateCredentialsApiKeyModalNew from './CreateCredentialsAPIKeyModalNew';

const meta: Meta<typeof CreateCredentialsApiKeyModalNew> = {
  component: CreateCredentialsApiKeyModalNew,
} satisfies Meta<typeof CreateCredentialsApiKeyModalNew>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    credentials: {
      // deepcode ignore HardcodedNonCryptoSecret: fake API key used only as Storybook fixture data
      api_key: 'LKFJWIREJFLDJFKLJWERWJEWLEJWLEJWLEJWLKEJWLEJWLKE', // pragma: allowlist secret
      key_id: 'test-api-key',
    },
    opened: true,
  },
};
