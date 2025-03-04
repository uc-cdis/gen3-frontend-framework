import React from 'react';
import type { Preview } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import { Gen3Provider } from '@gen3/frontend';
import '../src/styles/globals.css';
import { initialize, mswLoader } from 'msw-storybook-addon';

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

// TODO att option to configure the storybook per commons
const config = {
  icons: [
    {
      prefix: 'gen3',
      lastModified: 0,
      icons: {},
      width: 0,
      height: 0,
    },
  ],
  modalsConfig: {},
  sessionConfig: {},
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MantineProvider>
        <Gen3Provider
          icons={config.icons}
          sessionConfig={config.sessionConfig}
          modalsConfig={config.modalsConfig}
        >
          <Story />
        </Gen3Provider>
      </MantineProvider>
    ),
  ],
  loaders: [mswLoader], // 👈 Adds the MSW loader to all stories
};

export default preview;
