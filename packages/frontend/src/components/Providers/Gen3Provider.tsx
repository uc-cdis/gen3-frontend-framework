import React, { useEffect, ReactNode } from 'react';
import { CoreProvider } from '@gen3/core';
import {
  createTheme,
  MantineProvider,
  // createEmotionCache,
  // EmotionCache,
} from '@mantine/core';
import { TenStringArray } from '../../utils';
import { SessionProvider } from '../../lib/session/session';
import { type RegisteredIcons, type Fonts } from '../../lib/content/types';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { addCollection } from '@iconify/react';
import { SessionConfiguration } from '../../lib/session/types';
import { Gen3ModalsProvider, type ModalsConfig } from '../Modals';

interface Gen3ProviderProps {
  colors: Record<string, TenStringArray>;
  icons: RegisteredIcons;
  fonts: Fonts;
  sessionConfig: SessionConfiguration;
  modalsConfig: ModalsConfig;
  children?: ReactNode | undefined;
}

// Define theme for mantine v7
const createMantineTheme = (
  fonts: Fonts,
  colors: Record<string, TenStringArray>,
) => {
  const theme = createTheme({
    // use V2 font in MantineProvider
    fontFamily: fonts.fontFamily,
    // Override default blue color until styles are determined
    colors: {
      white: [
        // TODO: replace with primary theme color
        '#ffffff',
        '#ffffff',
        '#ffffff',
        '#ffffff',
        '#ffffff',
        '#ffffff',
        '#ffffff',
        '#ffffff',
        '#ffffff',
        '#ffffff',
      ],
      // Add default color from tailwind config to Mantine theme
      // note that now getting colors from the tailwindcss-themer which assumes that plugin is last in the
      // plugins declaration.
      // TODO: refactor how the configuration get loaded
      ...Object.fromEntries(
        Object.entries(colors).map(([key, values]) => [
          key,
          Object.values(values),
        ]),
      ),
    },
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
      Modal: {
        defaultProps: {
          classNames: {
            title: 'font-bold',
          },
        },
      },
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
  colors,
  icons,
  fonts,
  sessionConfig,
  modalsConfig,
  children,
}: Gen3ProviderProps) => {
  useEffect(() => {
    addCollection(icons);
  }, [icons]);

  const theme = createMantineTheme(fonts, colors);

  return (
    <CoreProvider>
      <MantineProvider theme={theme}>
        <ModalsProvider>
          <Notifications />
          <SessionProvider {...sessionConfig}>
            <Gen3ModalsProvider config={modalsConfig}>
              {children}
            </Gen3ModalsProvider>
          </SessionProvider>
        </ModalsProvider>
      </MantineProvider>
    </CoreProvider>
  );
};

export default Gen3Provider;
