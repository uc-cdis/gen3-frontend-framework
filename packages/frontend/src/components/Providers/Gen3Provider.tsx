import React, { useEffect, ReactNode } from 'react';
import { CoreProvider } from '@gen3/core';
import {
  MantineProvider,
  // createEmotionCache,
  // EmotionCache,
} from '@mantine/core';
// import { createStyles, Global } from '@mantine/emotion';
import { TenStringArray } from '../../utils';
import { SessionProvider } from '../../lib/session/session';
import { type RegisteredIcons, type Fonts } from '../../lib/content/types';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { addCollection } from '@iconify/react';
import { SessionConfiguration } from '../../lib/session/types';
import { Gen3ModalsProvider, type ModalsConfig } from '../Modals';

// const getEmotionCache = (): EmotionCache => {
//   // Insert mantine styles after global styles
//   const insertionPoint =
//     typeof document !== 'undefined'
//       ? document.querySelectorAll<HTMLElement>(
//           'styles[api-emotion="css-global"]',
//         )?.[-1]
//       : undefined;

//   return createEmotionCache({ key: 'mantine', insertionPoint });
// };

interface Gen3ProviderProps {
  colors: Record<string, TenStringArray>;
  icons: RegisteredIcons;
  fonts: Fonts;
  sessionConfig: SessionConfiguration;
  modalsConfig: ModalsConfig;
  children?: ReactNode | undefined;
}

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

  return (
    <CoreProvider>
      <MantineProvider
        // withGlobalStyles
        // withNormalizeCSS
        // emotionCache={getEmotionCache()}
        theme={{
          fontFamily: fonts.fontFamily,
          // colors: {
          //   ...colors,
          // },
          primaryColor: 'primary',
          primaryShade: { light: 4, dark: 7 },
          breakpoints: {
            xs: '500',
            sm: '800',
            md: '1000',
            lg: '1275',
            xl: '1800',
          },
        }}
      >
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
