import React from 'react';
import type { Preview } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import '../src/styles/globals.css';
import { initialize, mswLoader } from 'msw-storybook-addon';
import theme from '../src/mantineTheme';
import '../src/styles/globals.css';
import '@fontsource/montserrat';
import '@fontsource/source-sans-pro';
import '@fontsource/poppins';
import { Gen3Provider } from '@gen3/frontend';

/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize();

const icons = [
  {
    prefix: 'gen3',
    lastModified: 0,
    icons: {},
    width: 0,
    height: 0,
  },
];
const sessionConfig = {};
const modalsConfig = {};

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
      <MantineProvider theme={theme}>
        <Gen3Provider
          icons={icons}
          sessionConfig={sessionConfig}
          modalsConfig={modalsConfig}
        >
          <Story />
        </Gen3Provider>
      </MantineProvider>
    ),
  ],
  loaders: [mswLoader], // 👈 Adds the MSW loader to all stories
};

export default preview;
