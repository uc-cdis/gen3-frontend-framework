import React from 'react';
import type { Preview } from '@storybook/nextjs-vite';
import { MantineProvider } from '@mantine/core';
import { GEN3_API, GEN3_AUTHZ_API, GEN3_FENCE_API } from '@gen3/core';
import { Gen3Provider } from '@gen3/frontend/app';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { http, HttpResponse } from 'msw';
import theme from '../src/mantineTheme';
import icons from './loadIcons';

import '../src/styles/globals.css';
import '@fontsource/montserrat';
// source-sans-pro is frozen at a fontsource build that ships no `types`/`exports`,
// unlike montserrat/poppins — import the stylesheet directly so it type-resolves.
import '@fontsource/source-sans-pro/index.css';
import '@fontsource/poppins';
/*
 * Initializes MSW
 * See https://github.com/mswjs/msw-storybook-addon#configuring-msw
 * to learn how to customize it
 */
initialize({}, [
  http.get(`${GEN3_API}/_status`, () => {
    return HttpResponse.json({
      message: 'Feeling good with storybook!',
      csrf: '6640e4857e5cb3b42db303d8ee3a4ace11900.0002025-06-17T15:24:53+00:00',
    });
  }),
  http.get(`${GEN3_AUTHZ_API}/mapping`, () => {
    return HttpResponse.json({});
  }),
  http.get(`${GEN3_FENCE_API}/user`, () => {
    return HttpResponse.json(
      {
        active: true,
        authz: {
          '/open': [
            {
              method: 'read',
              service: 'fence',
            },
            {
              method: 'read-storage',
              service: 'fence',
            },
            {
              method: 'read',
              service: 'guppy',
            },
            {
              method: 'read',
              service: 'peregrine',
            },
            {
              method: 'read',
              service: 'sheepdog',
            },
          ],
        },
        azp: null,
        certificates_uploaded: [],
        display_name: null,
        email: 'storybook@uchicago.edu',
        groups: [],
        idp: 'storybook',
        is_admin: false,
        message: '',
        name: 'storybook@uchicago.edu',
        phone_number: null,
        preferred_username: null,
        primary_google_service_account: null,
        project_access: {},
        resources: ['/open'],
        resources_granted: [],
        role: 'user',
        sub: '374',
        user_id: 374,
        username: 'storybook@uchicago.edu',
      },
      { status: 200 },
    );
  }),
]);

const modalsConfig = {
  systemUseModal: {
    enabled: false,
    content: {
      text: [],
    },
  },
};

const sessionConfig = {
  updateSessionTime: 5,
  inactiveTimeLimit: 20,
  logoutInactiveUsers: false,
  monitorWorkspace: false,
};

const protectecRoutes = {
  routes: {
    '/DataLibrary': {
      loginRequired: true,
    },
    '/Workspace': {
      loginRequired: true,
    },
    '/Profile': {
      loginRequired: true,
    },
    '*': {
      loginRequired: false,
    },
  },
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
      <MantineProvider theme={theme}>
        <Gen3Provider
          icons={icons}
          sessionConfig={sessionConfig}
          modalsConfig={modalsConfig}
          protectedRoutesConfig={protectecRoutes}
        >
          <Story />
        </Gen3Provider>
      </MantineProvider>
    ),
  ],
  loaders: [mswLoader], // 👈 Adds the MSW loader to all stories
};

export default preview;
