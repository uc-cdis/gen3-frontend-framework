import React, { useEffect, ReactNode } from 'react';
import { CoreProvider } from '@gen3/core';
import { createTheme, Pagination, Modal } from '@mantine/core';
import { TenStringArray } from '../../utils';
import { SessionProvider } from '../../lib/session/session';
import { type RegisteredIcons, type Fonts } from '../../lib/content/types';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { addCollection } from '@iconify/react';
import { SessionConfiguration } from '../../lib/session/types';
import { Gen3ModalsProvider, type ModalsConfig } from '../Modals';

interface Gen3ProviderProps {
  icons: Array<RegisteredIcons>;
  sessionConfig: SessionConfiguration;
  modalsConfig: ModalsConfig;
  children?: ReactNode | undefined;
}

// Define theme for mantine v7
export const createMantineTheme = (
  fonts: Fonts,
  colors: Record<string, TenStringArray>,
) => {
  const theme = createTheme({
    // use V2 font in MantineProvider
    fontFamily: fonts.fontFamily,
    colors: Object.fromEntries(
      Object.entries(colors).map(([key, values]) => (values? [
        key,
        Object.values(values),
      ]: [])),
    ),
    primaryColor: 'primary',
    primaryShade: { light: 4, dark: 7 },
    breakpoints: {
      xs: '31.25em',
      sm: '50em',
      md: '62.5em',
      lg: '80em',
      xl: '112.5em',
    },
    components: {
      Modal: Modal.extend({
        defaultProps: {
          classNames: {
            title: 'font-bold',
          },
        },
      }),
      Pagination: Pagination.extend({
        defaultProps: { //Add 508 localization to Pagination
          getControlProps: (control) => {
            if (control === 'first') {
              return { "aria-label": "First" };
            }
            if (control === 'last') {
              return { "aria-label": "Last" };
            }
            if (control === 'next') {
              return { "aria-label": "Next" };
            }
            if (control === 'previous') {
              return { "aria-label": "Previous" };
            }
            return {};
          },
        },
      }),
    },
  });

  return theme;
};

/**
 * Gen3Provider wraps around the entire app and provides general configurations
 * for the whole website like color scheme, icons, fonts, and sessionConfigs like
 * inactivity limits for session timeouts.
 */
const Gen3Provider = ({
  icons,
  sessionConfig,
  modalsConfig,
  children,
}: Gen3ProviderProps) => {
  useEffect(() => {
    icons.forEach((i) => addCollection(i));
  }, [icons]);


  return (
    <CoreProvider>
      <ModalsProvider>
        <Notifications />
        <SessionProvider {...sessionConfig}>
          <Gen3ModalsProvider config={modalsConfig}>
            {children}
          </Gen3ModalsProvider>
        </SessionProvider>
      </ModalsProvider>
    </CoreProvider>
  );
};

export default Gen3Provider;
